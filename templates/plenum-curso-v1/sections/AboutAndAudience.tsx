import React from 'react';
import { Icon } from '../components/Icon.js';
import type { ViewModel } from '../../../src/schemas/view-model.js';

type Props = { data: ViewModel };

function addMm(base: number, delta: string | undefined): string {
  if (!delta) return `${base}mm`;
  const d = parseFloat(delta);
  return `${base + d}mm`;
}

const s = {
  page: {
    width: '210mm', height: '297mm', background: 'var(--color-background-deep, #010814)',
    color: '#fff', overflow: 'hidden',
  } as React.CSSProperties,
  label: {
    fontSize: '11pt', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase',
    color: 'var(--color-primary-light, #3b82f6)', marginBottom: '3mm',
  } as React.CSSProperties,
  title: {
    fontFamily: 'var(--font-heading), sans-serif', fontSize: '24pt', fontWeight: 700,
    fontStyle: 'italic', marginBottom: '3mm', lineHeight: 1.2, color: '#fff',
  } as React.CSSProperties,
  subtitle: {
    fontSize: '13pt', opacity: 0.6, marginBottom: '5mm', lineHeight: 1.5,
  } as React.CSSProperties,
  grid: {
    display: 'flex', flexWrap: 'wrap', gap: '3mm', marginTop: '4mm',
  } as React.CSSProperties,
  card: {
    background: 'var(--color-surface, #0b1a30)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px', padding: '4mm', width: '55mm', flexShrink: 0,
  } as React.CSSProperties,
  cardTitle: { fontSize: '13pt', fontWeight: 700, margin: '2mm 0 1mm', color: '#fff' } as React.CSSProperties,
  cardDesc: { fontSize: '11pt', color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 } as React.CSSProperties,
  audLayout: { display: 'flex', gap: '6mm', marginTop: '4mm' } as React.CSSProperties,
  audList: { flex: 1, display: 'flex', flexDirection: 'column' } as React.CSSProperties,
  audItem: {
    display: 'flex', alignItems: 'center', gap: '3mm',
    background: 'var(--color-surface, #0b1a30)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px', padding: '2.5mm 3.5mm',
  } as React.CSSProperties,
  audInfo: { width: '62mm', display: 'flex', flexDirection: 'column', gap: '3mm' } as React.CSSProperties,
  infoCard: {
    background: 'var(--color-surface, #0b1a30)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px', padding: '4mm',
  } as React.CSSProperties,
};

export function AboutAndAudience({ data }: Props) {
  const aboutOv = data.sectionOverrides?.about;
  const audOv = data.sectionOverrides?.audience;

  // Base: padding '10mm 18mm' → top=10, lateral=18, card gap=3, icon=18, title=13pt, desc=11pt
  const aboutTopPad = addMm(10, aboutOv?.margin_top);
  const aboutLateralPad = addMm(18, aboutOv?.margin_lateral);
  const aboutCardMb = addMm(3, aboutOv?.margin_bottom);
  const aboutIconSize = 18 + parseFloat(aboutOv?.icon_size || '0');
  const aboutScale = parseFloat(aboutOv?.scale || '0');
  const aboutSubtitleSize = `${13 + aboutScale}pt`;
  const aboutTitleSize = `${13 + aboutScale}pt`;
  const aboutDescSize = `${11 + aboutScale}pt`;

  // Base: padding top=10, card gap=2, card padding vertical=2.5, font=13, icon=16
  const audTopPad = addMm(10, audOv?.margin_top);
  const audCardGap = addMm(2, audOv?.card_margin_bottom);
  const audCardPadV = addMm(2.5, audOv?.card_padding_vertical);
  const audCardFontSize = `${13 + parseFloat(audOv?.card_font_size || '0')}pt`;
  const audIconSize = 16 + parseFloat(audOv?.icon_size || '0');

  return (
    <>
      {/* Página: Sobre o Curso */}
      <div
        style={{
          ...s.page,
          padding: `${aboutTopPad} ${aboutLateralPad} 10mm ${aboutLateralPad}`,
        }}
        className="page-break"
      >
        <div style={s.label}>Sobre o Curso</div>
        <h2 style={s.title}>{data.course.aboutHeading}</h2>
        <p style={{ ...s.subtitle, fontSize: aboutSubtitleSize }}>{data.course.aboutSubheading}</p>
        <div style={{ ...s.grid, gap: aboutCardMb }}>
          {data.course.aboutCards.map((card, i) => (
            <div key={i} style={s.card}>
              <div style={{ color: 'var(--color-primary-light, #5b9cf6)' }}><Icon name={card.icon} size={aboutIconSize} /></div>
              <div style={{ ...s.cardTitle, fontSize: aboutTitleSize }}>{card.title}</div>
              <div style={{ ...s.cardDesc, fontSize: aboutDescSize }}>{card.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Página: Público-Alvo */}
      <div
        style={{
          ...s.page,
          padding: `${audTopPad} 18mm 10mm 18mm`,
        }}
        className="page-break"
      >
        <div style={s.label}>Público-Alvo</div>
        <h2 style={s.title}>{data.course.audienceHeading}</h2>
        <div style={s.audLayout}>
          <div style={{ ...s.audList, gap: audCardGap }}>
            {data.course.audienceCards.map((card, i) => (
              <div key={i} style={{ ...s.audItem, padding: `${audCardPadV} 3.5mm` }}>
                <div style={{ color: 'var(--color-primary-light, #5b9cf6)', flexShrink: 0 }}><Icon name={card.icon} size={audIconSize} /></div>
                <span style={{ fontSize: audCardFontSize, fontWeight: 600 }}>{card.title}</span>
              </div>
            ))}
          </div>
          <div style={s.audInfo}>
            <div style={s.infoCard}>
              <div style={{ fontSize: '17pt', fontWeight: 700, marginBottom: '1.5mm' }}>Local:</div>
              <div style={{ fontSize: '12pt', opacity: 0.6, lineHeight: 1.4 }}>
                {data.edition.locationVenue}<br />{data.edition.locationAddress}
              </div>
            </div>
            <div style={s.infoCard}>
              <div style={{ fontSize: '17pt', fontWeight: 700, marginBottom: '1mm' }}>Data:</div>
              <div style={{ fontSize: '16pt', fontWeight: 700 }}>{data.edition.dateLabel}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
