import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { FC } from 'react';
import type { ViewModel } from '../src/schemas/view-model.js';
import type { CeapViewModel } from '../src/schemas/ceap-view-model.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export type TemplateEntry = {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: FC<{ data: any }>;
  cssPath: string;
};

const registry = new Map<string, TemplateEntry>();

function register(entry: TemplateEntry): void {
  registry.set(entry.id, entry);
}

// --- Register templates ---

import { Template as PlenumCursoV1 } from './plenum-curso-v1/Template.js';

register({
  id: 'plenum-curso-v1',
  component: PlenumCursoV1 as FC<{ data: any }>,
  cssPath: path.resolve(__dirname, 'plenum-curso-v1/styles/template.css'),
});

import { Template as CeapCursoV1 } from './ceap-curso-v1/Template.js';

register({
  id: 'ceap-curso-v1',
  component: CeapCursoV1 as FC<{ data: any }>,
  cssPath: path.resolve(__dirname, 'ceap-curso-v1/styles/template.css'),
});

// --- Public API ---

export function getTemplate(id: string): TemplateEntry | undefined {
  return registry.get(id);
}

export function getAvailableTemplates(): string[] {
  return Array.from(registry.keys());
}
