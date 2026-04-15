import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { ViewModel } from '../schemas/view-model.js';
import { Template } from '../../templates/plenum-curso-v1/Template.js';

function buildCssVars(colors: Record<string, string>, fonts: { heading: string; body: string }): string {
  const vars = [
    ...Object.entries(colors).map(([k, v]) => `  ${k}: ${v};`),
    `  --font-heading: ${fonts.heading};`,
    `  --font-body: ${fonts.body};`,
  ];
  return `:root {\n${vars.join('\n')}\n}`;
}

export function renderHtml(viewModel: ViewModel): string {
  const cssPath = path.resolve(process.cwd(), 'templates/plenum-curso-v1/styles/template.css');
  const css = readFileSync(cssPath, 'utf-8');

  const cssVars = buildCssVars(viewModel.designSystem.colors, viewModel.designSystem.fonts);

  const markup = renderToStaticMarkup(React.createElement(Template, { data: viewModel }));

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
