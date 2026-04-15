import type { CourseData } from './course-loader.js';
import type { ViewModel, Depoente, SectionOverrides } from '../schemas/view-model.js';
import { normalizeProgramDays } from '../utils/program-normalizer.js';
import { getAssets, assetUrl } from '../utils/asset-resolver.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';

function loadDepoimentos(): Depoente[] {
  const raw = readFileSync(path.resolve(process.cwd(), 'assets/depoimentos.json'), 'utf-8');
  const data = JSON.parse(raw) as Array<{ name: string; role: string; quote: string; photo: string }>;
  return data.map(d => ({
    ...d,
    photo: assetUrl(d.photo.replace(/^\/assets\//, '')),
  }));
}

export function buildViewModel(data: CourseData, editionId: string, sectionOverrides?: SectionOverrides): ViewModel {
  const { course, edition, instructors, designSystem } = data;

  const forceCompact = sectionOverrides?.speakers?.force_compact === 'true';
  const layoutVariant = (forceCompact || instructors.length > 1) ? 'multi-speaker' : 'single-speaker';

  const programDays = normalizeProgramDays(edition.program_days as any);

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

  const assets = getAssets();
  const depoentes = loadDepoimentos();

  // Build cover frame URL from design system hero_frames_path + frame 1
  let coverFrameUrl: string | null = null;
  const framesPath = (designSystem as any).hero_frames_path as string | undefined;
  const frameExt = (designSystem as any).hero_frame_ext as string | undefined;
  if (framesPath && frameExt) {
    coverFrameUrl = `${framesPath}0001${frameExt}`;
  }

  return {
    generatedAt: new Date(),
    editionId,

    course: {
      title: course.title,
      subtitle: course.subtitle,
      slug: course.slug,
      categoryLabel: course.category_label,
      aboutHeading: course.about_heading,
      aboutSubheading: course.about_subheading,
      aboutCards: course.about_cards,
      audienceHeading: course.audience_heading,
      audienceCards: course.audience_cards,
      programHeading: course.program_heading,
      programDescription: course.program_description || '',
      investmentHeading: course.investment_heading,
      investmentSubtitle: course.investment_subtitle || '',
      includedItems: course.included_items,
    },

    edition: {
      startDate: new Date(edition.start_date),
      endDate: new Date(edition.end_date),
      dateLabel: edition.label,
      locationVenue: edition.location_venue,
      locationAddress: edition.location_address,
      programDays,
    },

    instructors: instructors.map(i => ({
      id: i.id,
      name: i.name,
      role: i.role,
      bio: i.bio,
      photoUrl: i.photo_url,
    })),

    layoutVariant,

    designSystem: {
      colors,
      fonts: {
        heading: designSystem.font_heading,
        body: designSystem.font_body,
      },
    },

    assets: {
      ...assets,
      depoentes,
      coverFrameUrl,
    },

    sectionOverrides: sectionOverrides ?? {},
  };
}
