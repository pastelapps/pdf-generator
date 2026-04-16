import type { SupabaseClient } from '@supabase/supabase-js';
import { ceapCourseSchema, type CeapCourse } from '../schemas/ceap-course.js';
import { instructorSchema, type Instructor } from '../schemas/instructor.js';
import { designSystemSchema, type DesignSystem } from '../schemas/design-system.js';
import { NotFoundError, DatabaseError } from '../utils/errors.js';
import { logger } from '../logger.js';

// Default design system for CEAP (dark blue theme)
const CEAP_DEFAULT_DESIGN_SYSTEM: DesignSystem = {
  id: 'ceap-default',
  name: 'CEAP Default',
  color_primary: '#00a6f5',
  color_primary_hover: '#0090d6',
  color_primary_light: '#e0f4ff',
  color_background: '#0a1628',
  color_background_alt: '#0f1d32',
  color_background_deep: '#060e1a',
  color_surface: '#1a2a42',
  color_surface_alt: '#243552',
  color_accent: '#00d4ff',
  font_heading: 'Poppins',
  font_body: 'Poppins',
  font_weight_heading: 700,
  font_weight_body: 400,
};

export type CeapCourseData = {
  course: CeapCourse;
  instructors: Instructor[];
  designSystem: DesignSystem;
};

export async function loadCeapCourseData(supabase: SupabaseClient, courseId: string): Promise<CeapCourseData> {
  // 1. Buscar curso
  const { data: courseRaw, error: courseError } = await supabase
    .from('lp_courses')
    .select('*')
    .eq('id', courseId)
    .single();

  if (courseError || !courseRaw) {
    throw new NotFoundError(`Curso CEAP não encontrado: ${courseId}`);
  }

  const course = ceapCourseSchema.parse(courseRaw);
  logger.info({ courseId, title: course.title }, 'Curso CEAP carregado');

  // 2. Buscar design system (se existir) e instrutores em paralelo
  const [dsResult, instructorsResult] = await Promise.all([
    course.design_system_id
      ? supabase.from('lp_design_systems').select('*').eq('id', course.design_system_id).single()
      : Promise.resolve({ data: null, error: null }),
    course.instructor_ids.length > 0
      ? supabase.from('lp_instructors').select('*').in('id', course.instructor_ids)
      : Promise.resolve({ data: [], error: null }),
  ]);

  // Use design system do banco ou o padrão CEAP
  let designSystem: DesignSystem;
  if (dsResult.data) {
    designSystem = designSystemSchema.parse(dsResult.data);
  } else {
    designSystem = CEAP_DEFAULT_DESIGN_SYSTEM;
    logger.info('Usando design system padrão CEAP');
  }

  // 3. Validar instrutores
  if (instructorsResult.error) {
    throw new DatabaseError('Erro ao buscar professores CEAP', instructorsResult.error);
  }

  const instructors = (instructorsResult.data || []).map(i => instructorSchema.parse(i));

  if (instructors.length === 0) {
    throw new NotFoundError('O curso CEAP não possui professores cadastrados.');
  }

  logger.info(
    { course: course.title, instructors: instructors.length, designSystem: designSystem.name },
    'Dados CEAP carregados com sucesso'
  );

  return { course, instructors, designSystem };
}
