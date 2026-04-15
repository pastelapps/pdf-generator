import { z } from 'zod';

const topicSchema: z.ZodType<{ text: string; children: Array<{ text: string; children: any[] }> }> = z.object({
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

export const courseDateSchema = z.object({
  id: z.string().uuid(),
  course_id: z.string().uuid(),
  start_date: z.string(),
  end_date: z.string(),
  label: z.string(),
  location_venue: z.string(),
  location_address: z.string(),
  program_days: z.preprocess(
    (val) => (typeof val === 'string' ? JSON.parse(val) : val),
    z.array(programDaySchema)
  ),
  instructor_ids: z.array(z.string().uuid()),
  folder_pdf_url: z.string().nullable().default(null),
}).passthrough();

export type CourseDate = z.infer<typeof courseDateSchema>;
export type ProgramDay = z.infer<typeof programDaySchema>;
export type Topic = z.infer<typeof topicSchema>;
