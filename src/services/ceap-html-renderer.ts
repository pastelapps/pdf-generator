import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import type { CeapViewModel } from '../schemas/ceap-view-model.js';
import { getTemplate } from '../../templates/registry.js';

function buildCssVars(colors: Record<string, string>, fonts: { heading: string; body: string }): string {
  const vars = [
    ...Object.entries(colors).map(([k, v]) => `  ${k}: ${v};`),
    `  --font-heading: ${fonts.heading};`,
    `  --font-body: ${fonts.body};`,
  ];
  return `:root {\n${vars.join('\n')}\n}`;
}

export function renderCeapHtml(viewModel: CeapViewModel, templateId: string): string {
  const entry = getTemplate(templateId);
  if (!entry) {
    throw new Error(`Template "${templateId}" não encontrado no registry.`);
  }

  const css = readFileSync(entry.cssPath, 'utf-8');
  const cssVars = buildCssVars(viewModel.designSystem.colors, viewModel.designSystem.fonts);
  const markup = renderToStaticMarkup(React.createElement(entry.component, { data: viewModel }));

  const fontHeading = viewModel.designSystem.fonts.heading;
  const fontBody = viewModel.designSystem.fonts.body;
  const fontFamilies = new Set([fontHeading, fontBody]);
  const googleFontsUrl = `https://fonts.googleapis.com/css2?${[...fontFamilies].map(f => `family=${encodeURIComponent(f)}:wght@400;500;700;900`).join('&')}&display=swap`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="${googleFontsUrl}" rel="stylesheet" />
  <title>${viewModel.course.title} - Folder CEAP</title>
  <style>
${cssVars}
${css}
  </style>
</head>
<body>
  ${markup}
</body>
</html>`;
}
