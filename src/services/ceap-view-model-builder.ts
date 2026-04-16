import type { CeapCourseData } from './ceap-course-loader.js';
import type { CeapViewModel, CeapSectionOverrides } from '../schemas/ceap-view-model.js';
import { getCeapAssets } from '../utils/asset-resolver.js';
import { normalizeProgramDays } from '../utils/program-normalizer.js';

export type CeapTemplateParams = {
  proposta_comercial?: { valor: string };
  produto: 'licittoguru' | 'plataforma' | 'monicalopes';
  cover_photo_url?: string;
  professor_left_name?: string;
  professor_right_name?: string;
  professor_left_margins?: { left?: string; right?: string };
  professor_right_margins?: { left?: string; right?: string };
  professor_font_size?: string;
  contato?: {
    telefone1?: string;
    telefone2?: string;
    email?: string;
    site?: string;
  };
};

/**
 * Resolve relative Supabase storage paths to full public URLs.
 * Paths like `/Fred Perillo (2).png` → full Supabase storage URL.
 */
function resolveSupabaseUrl(url: string | null, bucket = 'instructors'): string | null {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const encoded = encodeURIComponent(url.replace(/^\//, ''));
  return `https://jdcpglpcwrviotluzfvm.supabase.co/storage/v1/object/public/${bucket}/${encoded}`;
}

export function buildCeapViewModel(
  data: CeapCourseData,
  tenantName: string,
  templateParams: CeapTemplateParams,
  sectionOverrides?: CeapSectionOverrides,
): CeapViewModel {
  const { course, instructors, designSystem } = data;

  const layoutVariant = instructors.length > 1 ? 'multi-prof' : 'single-prof';

  const assets = getCeapAssets(tenantName);

  const programDays = normalizeProgramDays(course.program_days as any);

  const colors: Record<string, string> = {
    '--color-primary': designSystem.color_primary,
    '--color-primary-hover': designSystem.color_primary_hover,
    '--color-primary-light': designSystem.color_primary_light,
    '--color-background': designSystem.color_background,
    '--color-background-alt': designSystem.color_background_alt,
    '--color-background-deep': designSystem.color_background_deep,
    '--color-surface': designSystem.color_surface,
    '--color-surface-alt': designSystem.color_surface_alt,
    '--color-accent': designSystem.color_accent,
  };

  // Default contato — can be overridden via template_params
  const contato = {
    telefone1: templateParams.contato?.telefone1 || '(48) 3204-6843',
    telefone2: templateParams.contato?.telefone2 || '(48) 99665-7706',
    email: templateParams.contato?.email || 'comercial.sc01@ceapbrasil.com',
    site: templateParams.contato?.site || 'www.ceapbrasil.com',
  };

  return {
    generatedAt: new Date(),
    courseId: course.id,

    course: {
      title: course.title,
      subtitle: course.subtitle || '',
      slug: course.slug,
      categoryLabel: course.category_label || '',
      titleParts: course.title_parts || [],
      heroBadges: course.hero_badges || [],
      coverImageUrl: resolveSupabaseUrl(course.cover_image_url, 'course-covers'),
      aboutHeading: course.about_heading || '',
      aboutSubheading: course.about_subheading || '',
      aboutDescription: course.about_description || '',
      aboutCards: course.about_cards || [],
      audienceHeading: course.audience_heading || '',
      audienceCards: course.audience_cards || [],
      programHeading: course.program_heading || '',
      programDescription: course.program_description || '',
      programDays,
      dateLabel: course.date_label || '',
      locationVenue: course.location_venue || '',
      locationAddress: course.location_address || '',
      locationCity: course.location_city || (course.location_address ? course.location_address.split(',').pop()?.trim().replace(/\s*-\s*\w{2}$/, '') || '' : ''),
      investmentHeading: course.investment_heading || 'Investimento',
      investmentSubtitle: course.investment_subtitle || '',
      includedItems: course.included_items || [],
    },

    instructors: instructors.map(i => ({
      id: i.id,
      name: i.name,
      role: i.role,
      bio: i.bio,
      photoUrl: resolveSupabaseUrl(i.photo_url, 'instructors'),
    })),

    layoutVariant,

    designSystem: {
      colors,
      fonts: {
        heading: designSystem.font_heading,
        body: designSystem.font_body,
      },
    },

    contato,

    produtoCeap: templateParams.produto,
    propostaComercial: templateParams.proposta_comercial,

    coverPhotoUrl: resolveSupabaseUrl(templateParams.cover_photo_url ?? null, 'course-covers'),
    professorLeftName: templateParams.professor_left_name,
    professorRightName: templateParams.professor_right_name,
    professorLeftMargins: templateParams.professor_left_margins,
    professorRightMargins: templateParams.professor_right_margins,
    professorFontSize: templateParams.professor_font_size,

    assets,

    sectionOverrides: sectionOverrides ?? {},
  };
}
