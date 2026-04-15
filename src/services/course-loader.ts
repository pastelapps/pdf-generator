import { supabase } from '../clients/supabase.js';
import { courseSchema, type Course } from '../schemas/course.js';
import { courseDateSchema, type CourseDate } from '../schemas/course-date.js';
import { instructorSchema, type Instructor } from '../schemas/instructor.js';
import { designSystemSchema, type DesignSystem } from '../schemas/design-system.js';
import { NotFoundError, DatabaseError, InvalidInstructorCountError } from '../utils/errors.js';
import { logger } from '../logger.js';

export type CourseData = {
  course: Course;
  edition: CourseDate;
  instructors: Instructor[];
  designSystem: DesignSystem;
};

export async function loadCourseData(editionId: string): Promise<CourseData> {
  // 1. Buscar edição
  const { data: editionRaw, error: editionError } = await supabase
    .from('course_dates')
    .select('*')
    .eq('id', editionId)
    .single();

  if (editionError || !editionRaw) {
    throw new NotFoundError(`Edição não encontrada: ${editionId}`);
  }

  const edition = courseDateSchema.parse(editionRaw);
  logger.info({ editionId, courseId: edition.course_id }, 'Edição carregada');

  // 2. Buscar curso e design system em paralelo
  const [courseResult, instructorsResult] = await Promise.all([
    supabase.from('courses').select('*').eq('id', edition.course_id).single(),
    edition.instructor_ids.length > 0
      ? supabase.from('instructors').select('*').in('id', edition.instructor_ids).eq('status', 'active')
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (courseResult.error || !courseResult.data) {
    throw new NotFoundError(`Curso não encontrado: ${edition.course_id}`);
  }

  const course = courseSchema.parse(courseResult.data);

  // 3. Buscar design system
  const { data: dsRaw, error: dsError } = await supabase
    .from('design_systems')
    .select('*')
    .eq('id', course.design_system_id)
    .single();

  if (dsError || !dsRaw) {
    throw new NotFoundError(`Design system não encontrado: ${course.design_system_id}`);
  }

  const designSystem = designSystemSchema.parse(dsRaw);

  // Aviso sobre cores suspeitas
  const suspiciousColors = ['#4caf50', '#af4cab'];
  const dsColors = [designSystem.color_background, designSystem.color_background_alt, designSystem.color_surface, designSystem.color_surface_alt];
  const hasSuspicious = dsColors.some(c => suspiciousColors.includes(c.toLowerCase()));
  if (hasSuspicious) {
    logger.warn(
      { designSystemId: designSystem.id, name: designSystem.name, colors: dsColors },
      'Design system com cores possivelmente incorretas — renderizando fielmente conforme o banco'
    );
  }

  // 4. Validar instrutores
  if (instructorsResult.error) {
    throw new DatabaseError('Erro ao buscar instrutores', instructorsResult.error);
  }

  const instructors = (instructorsResult.data || []).map(i => instructorSchema.parse(i));

  if (instructors.length === 0) {
    throw new InvalidInstructorCountError(
      'A edição não possui instrutores cadastrados. Cadastre pelo menos um instrutor antes de gerar o folder.'
    );
  }

  if (instructors.length > 3) {
    throw new InvalidInstructorCountError(
      'O template plenum-curso-v1 suporta no máximo 3 instrutores. Para cursos com 4+ palestrantes, o folder deve ser gerado manualmente.'
    );
  }

  logger.info(
    { course: course.title, instructors: instructors.length, designSystem: designSystem.name },
    'Dados carregados com sucesso'
  );

  return { course, edition, instructors, designSystem };
}
