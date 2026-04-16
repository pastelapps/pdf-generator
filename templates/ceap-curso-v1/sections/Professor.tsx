import React from 'react';
import type { CeapViewModel } from '../../../src/schemas/ceap-view-model.js';
import { ProfessorCard } from '../components/ProfessorCard.js';

type Props = { data: CeapViewModel };

function addMm(base: number, delta: string | undefined): string {
  if (!delta) return `${base}mm`;
  return `${base + parseFloat(delta)}mm`;
}

export function Professor({ data }: Props) {
  const ov = data.sectionOverrides?.professor;
  const isMulti = data.instructors.length > 1;

  const topMargin = addMm(30, ov?.margin_top);
  const fontScale = parseFloat(ov?.font_scale || '0');
  const cardMb = addMm(6, ov?.card_margin_bottom);
  const learnFontSize = `${13 + parseFloat(ov?.learn_font_size || '0')}pt`;
  const learnPadding = addMm(3, ov?.learn_padding);

  const page: React.CSSProperties = {
    width: '210mm',
    minHeight: '297mm',
    backgroundImage: `url(${data.assets.backgroundE})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    padding: `${topMargin} 18mm 14mm 18mm`,
    color: '#ffffff',
  };

  const sectionTitle: React.CSSProperties = {
    fontFamily: 'var(--font-heading, sans-serif)',
    fontSize: '30pt',
    fontWeight: 900,
    marginBottom: '6mm',
    lineHeight: 1.15,
  };

  const learnTitle: React.CSSProperties = {
    fontFamily: 'var(--font-heading, sans-serif)',
    fontSize: '30pt',
    fontWeight: 900,
    marginBottom: '6mm',
    marginTop: '10mm',
    lineHeight: 1.15,
  };

  const bulletStyle: React.CSSProperties = {
    fontSize: learnFontSize,
    color: '#ffffff',
    lineHeight: 1.6,
    paddingLeft: learnPadding,
    marginBottom: learnPadding,
  };

  // Dynamic singular/plural
  const profLabel = isMulti ? 'seus Professores?' : 'seu Professor?';

  return (
    <div style={page} className="page-break">
      <h2 style={sectionTitle}>
        Quem ser&aacute;{' '}
        <span style={{ color: '#00a6f5' }}>{profLabel}</span>
      </h2>

      {data.instructors.map((inst) => (
        <ProfessorCard
          key={inst.id}
          name={inst.name}
          bio={inst.bio}
          photoUrl={inst.photoUrl}
          fontScale={fontScale}
          marginBottom={cardMb}
        />
      ))}

      <h2 style={learnTitle}>
        O que voc&ecirc;{' '}
        <span style={{ color: '#00a6f5' }}>vai aprender?</span>
      </h2>

      {data.course.aboutCards.map((card, i) => (
        <div key={i} style={bulletStyle}>
          <span style={{ color: '#ffffff', marginRight: '3mm' }}>&bull;</span>
          {card.title}
        </div>
      ))}
    </div>
  );
}
