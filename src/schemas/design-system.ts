import { z } from 'zod';

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Cor hex inválida');

export const designSystemSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  color_primary: hexColor,
  color_primary_hover: hexColor,
  color_primary_light: hexColor,
  color_background: hexColor,
  color_background_alt: hexColor,
  color_background_deep: hexColor,
  color_surface: hexColor,
  color_surface_alt: hexColor,
  color_accent: hexColor,
  font_heading: z.string(),
  font_body: z.string(),
  font_heading_weights: z.array(z.number()),
  font_body_weights: z.array(z.number()),
}).passthrough();

export type DesignSystem = z.infer<typeof designSystemSchema>;
