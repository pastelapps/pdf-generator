import React from 'react';
import type { CeapViewModel } from '../../../src/schemas/ceap-view-model.js';
import { ProgramHeader } from '../components/ProgramHeader.js';

type Props = { data: CeapViewModel };

const BG_MAP: Record<string, keyof CeapViewModel['assets']> = {
  licittoguru: 'backgroundFinalLicittoguru',
  plataforma: 'backgroundFinalPlataforma',
  monicalopes: 'backgroundFinalMonicalopes',
};

export function Encerramento({ data }: Props) {
  const bgKey = BG_MAP[data.produtoCeap] || 'backgroundFinalLicittoguru';
  const bgUrl = data.assets[bgKey];

  const page: React.CSSProperties = {
    width: '210mm',
    height: '297mm',
    backgroundImage: bgUrl ? `url(${bgUrl})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    position: 'relative',
  };

  const valorStyle: React.CSSProperties = {
    position: 'absolute',
    top: '70mm',
    left: '25mm',
    fontFamily: "var(--font-heading, 'Poppins'), sans-serif",
    fontSize: '18pt',
    fontWeight: 700,
    color: '#0a1628',
  };

  return (
    <div style={page} className="page-break">
      <ProgramHeader
        title={data.course.title}
        subtitle={data.course.subtitle || ''}
        dateLabel={data.course.dateLabel}
        locationCity={data.course.locationCity}
        showLabel={false}
      />

      {data.propostaComercial && (
        <div style={valorStyle}>
          R$ {data.propostaComercial.valor}*
        </div>
      )}
    </div>
  );
}
