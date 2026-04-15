import { z } from 'zod';

export const instructorSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  role: z.string(),
  bio: z.string(),
  photo_url: z.string().nullable().default(null),
  status: z.string(),
}).passthrough();

export type Instructor = z.infer<typeof instructorSchema>;
