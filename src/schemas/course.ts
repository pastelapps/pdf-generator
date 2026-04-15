import { z } from 'zod';

const aboutCardSchema = z.object({
  icon: z.string(),
  title: z.string(),
  description: z.string(),
});

const audienceCardSchema = z.object({
  icon: z.string(),
  title: z.string(),
  description: z.string().optional(),
});

const includedItemSchema = z.object({
  icon: z.string(),
  text: z.string(),
});

export const courseSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  subtitle: z.string(),
  category_label: z.string(),
  design_system_id: z.string().uuid(),
  about_heading: z.string(),
  about_subheading: z.string().nullable().default(''),
  about_cards: z.array(aboutCardSchema),
  audience_heading: z.string(),
  audience_cards: z.array(audienceCardSchema),
  program_heading: z.string(),
  program_description: z.string().nullable().default(null),
  investment_heading: z.string(),
  investment_subtitle: z.string().nullable().default(null),
  included_items: z.array(includedItemSchema),
}).passthrough();

export type Course = z.infer<typeof courseSchema>;
