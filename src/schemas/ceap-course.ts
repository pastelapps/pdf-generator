import { z } from 'zod';

const topicSchema: z.ZodType<any> = z.object({
  text: z.string(),
  children: z.lazy(() => z.array(topicSchema)).default([]),
});

const programDaySchema = z.object({
  tag: z.string(),
  time: z.string().default(''),
  title: z.string(),
  topics: z.array(topicSchema).default([]),
  description: z.string().default(''),
});

const aboutCardSchema = z.object({
  icon: z.string(),
  title: z.string(),
  description: z.string().optional().default(''),
});

const audienceCardSchema = z.object({
  icon: z.string(),
  title: z.string(),
  description: z.string().optional().default(''),
});

const includedItemSchema = z.object({
  icon: z.string(),
  text: z.string(),
});

const folderSyllabusItemSchema = z.object({
  date: z.string(),
  time: z.string().default(''),
  type: z.string().default('modulo'),
  title: z.string().default(''),
  topics: z.array(z.string()).default([]),
});

export const ceapCourseSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  subtitle: z.string().nullable().default(''),
  category_label: z.string().nullable().default(''),
  design_system_id: z.string().uuid().nullable().default(null),

  // Cover
  cover_image_url: z.string().nullable().default(null),
  title_parts: z.preprocess(
    (val) => (val == null ? [] : typeof val === 'string' ? JSON.parse(val) : val),
    z.array(z.object({ text: z.string(), color: z.string() })).default([]),
  ),
  hero_badges: z.preprocess(
    (val) => (val == null ? [] : typeof val === 'string' ? JSON.parse(val) : val),
    z.array(z.object({
      icon: z.string(),
      label: z.string(),
      value: z.string(),
    })).default([]),
  ),

  // About / Audience
  about_heading: z.string().nullable().default(''),
  about_subheading: z.string().nullable().default(''),
  about_description: z.string().nullable().default(''),
  about_cards: z.preprocess(
    (val) => (val == null ? [] : typeof val === 'string' ? JSON.parse(val) : val),
    z.array(aboutCardSchema).default([]),
  ),
  audience_heading: z.string().nullable().default(''),
  audience_cards: z.preprocess(
    (val) => (val == null ? [] : typeof val === 'string' ? JSON.parse(val) : val),
    z.array(audienceCardSchema).default([]),
  ),

  // Program
  program_heading: z.string().nullable().default(''),
  program_description: z.string().nullable().default(''),
  program_days: z.preprocess(
    (val) => (val == null ? [] : typeof val === 'string' ? JSON.parse(val) : val),
    z.array(programDaySchema).default([]),
  ),

  // Folder syllabus (detailed schedule with dates/times/topics as strings)
  folder_presentation: z.string().nullable().default(''),
  folder_syllabus: z.preprocess(
    (val) => (val == null ? [] : typeof val === 'string' ? JSON.parse(val) : val),
    z.array(folderSyllabusItemSchema).default([]),
  ),

  // Dates & Location
  start_date: z.string().nullable().default(null),
  end_date: z.string().nullable().default(null),
  date_label: z.string().nullable().default(''),
  location_venue: z.string().nullable().default(''),
  location_address: z.string().nullable().default(''),
  location_city: z.string().nullable().default(''),
  location_state: z.string().nullable().default(''),
  workload: z.string().nullable().default(''),

  // Investment
  investment_heading: z.string().nullable().default('Investimento'),
  investment_subtitle: z.string().nullable().default(''),
  included_items: z.preprocess(
    (val) => (val == null ? [] : typeof val === 'string' ? JSON.parse(val) : val),
    z.array(includedItemSchema).default([]),
  ),

  // Instructors
  instructor_ids: z.preprocess(
    (val) => (val == null ? [] : typeof val === 'string' ? JSON.parse(val) : val),
    z.array(z.string().uuid()).default([]),
  ),

  // Section backgrounds (if custom bg per section)
  section_backgrounds: z.record(z.string()).nullable().default({}),

  // URLs
  folder_pdf_url: z.string().nullable().default(null),
  whatsapp_number: z.string().nullable().default(null),
  whatsapp_message: z.string().nullable().default(null),
}).passthrough();

export type CeapCourse = z.infer<typeof ceapCourseSchema>;
