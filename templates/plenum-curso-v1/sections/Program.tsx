import React from 'react';
import { ProgramDay } from '../components/ProgramDay.js';
import type { ViewModel } from '../../../src/schemas/view-model.js';

type Props = { data: ViewModel };

function addMm(base: number, delta: string | undefined): string {
  if (!delta) return `${base}mm`;
  const d = parseFloat(delta);
  return `${base + d}mm`;
}

const s = {
  page: {
    width: '210mm', minHeight: '297mm', background: '#ffffff', color: '#1a1a2e', padding: '14mm 18mm',
  } as React.CSSProperties,
  label: {
    fontSize: '11pt', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase',
    color: '#3b82f6', marginBottom: '2mm',
  } as React.CSSProperties,
  title: {
    fontSize: '28pt', fontWeight: 700, marginBottom: '2mm', lineHeight: 1.2,
  } as React.CSSProperties,
  subtitle: {
    fontSize: '13pt', color: '#64748b', marginBottom: '5mm',
  } as React.CSSProperties,
};

export function Program({ data }: Props) {
  const dayMarginTop = addMm(10, data.sectionOverrides?.program?.day_margin_top);

  return (
    <>
      {/* Primeira página de programação com header */}
      <div style={s.page} className="page-break">
        <div style={s.label}>Programação</div>
        {data.course.programDescription && <p style={s.subtitle}>{data.course.programDescription}</p>}
        {data.edition.programDays.map((day, i) => (
          <ProgramDay key={i} {...day} dayMarginTop={dayMarginTop} />
        ))}
      </div>
    </>
  );
}
