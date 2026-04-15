import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import type { ViewModel } from '../schemas/view-model.js';
import { getTemplate } from '../../templates/registry.js';

function buildCssVars(colors: Record<string, string>, fonts: { heading: string; body: string }): string {
  const vars = [
    ...Object.entries(colors).map(([k, v]) => `  ${k}: ${v};`),
    `  --font-heading: ${fonts.heading};`,
    `  --font-body: ${fonts.body};`,
  ];
  return `:root {\n${vars.join('\n')}\n}`;
}

export function renderHtml(viewModel: ViewModel, templateId: string): string {
  const entry = getTemplate(templateId);
  if (!entry) {
    throw new Error(`Template "${templateId}" não encontrado no registry.`);
  }

  const css = readFileSync(entry.cssPath, 'utf-8');
  const cssVars = buildCssVars(viewModel.designSystem.colors, viewModel.designSystem.fonts);
  const markup = renderToStaticMarkup(React.createElement(entry.component, { data: viewModel }));

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${viewModel.course.title} - Folder</title>
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
