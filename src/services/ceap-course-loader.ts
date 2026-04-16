import type { SupabaseClient } from '@supabase/supabase-js';
import { ceapCourseSchema, type CeapCourse } from '../schemas/ceap-course.js';
import { instructorSchema, type Instructor } from '../schemas/instructor.js';
import { designSystemSchema, type DesignSystem } from '../schemas/design-system.js';
import { NotFoundError, DatabaseError } from '../utils/errors.js';
import { logger } from '../logger.js';

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

  // 2. Buscar design system e instrutores em paralelo
  const [dsResult, instructorsResult] = await Promise.all([
    supabase.from('lp_design_systems').select('*').eq('id', course.design_system_id).single(),
    course.instructor_ids.length > 0
      ? supabase.from('lp_instructors').select('*').in('id', course.instructor_ids)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (dsResult.error || !dsResult.data) {
    throw new NotFoundError(`Design system CEAP não encontrado: ${course.design_system_id}`);
  }

  const designSystem = designSystemSchema.parse(dsResult.data);

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
