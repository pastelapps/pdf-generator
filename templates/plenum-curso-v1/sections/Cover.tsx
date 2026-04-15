import React from 'react';
import type { ViewModel } from '../../../src/schemas/view-model.js';

type Props = { data: ViewModel };

export function Cover({ data }: Props) {
  const hasFrame = !!data.assets.coverFrameUrl;

  const page: React.CSSProperties = {
    width: '210mm',
    height: '297mm',
    background: 'var(--color-background-deep, #010814)',
    backgroundImage: hasFrame ? `url(${data.assets.coverFrameUrl})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '20mm 22mm 20mm',
    color: '#ffffff',
    position: 'relative',
    overflow: 'hidden',
  };

  const centerGroup: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  };

  const badge: React.CSSProperties = {
    display: 'inline-block',
    border: '1.5px solid rgba(255,255,255,0.5)',
    color: '#ffffff',
    padding: '1.5mm 7mm',
    borderRadius: '3px',
    fontSize: '13pt',
    fontWeight: 700,
    letterSpacing: '2.5px',
    textTransform: 'uppercase',
    marginBottom: '6mm',
  };

  const title: React.CSSProperties = {
    fontFamily: 'var(--font-heading), sans-serif',
    fontSize: '40pt',
    fontWeight: 700,
    fontStyle: 'italic',
    lineHeight: 1.05,
    marginBottom: '5mm',
    color: '#ffffff',
  };

  const subtitle: React.CSSProperties = {
    fontSize: '16pt',
    opacity: 0.7,
    maxWidth: '155mm',
    lineHeight: 1.4,
  };

  const cardsRow: React.CSSProperties = {
    display: 'flex',
    gap: '3mm',
    justifyContent: 'center',
    width: '100%',
  };

  const card: React.CSSProperties = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    padding: '3mm 4mm',
    flex: 1,
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    gap: '3mm',
  };

  const iconCircle: React.CSSProperties = {
    width: '8mm',
    height: '8mm',
    borderRadius: '50%',
    background: 'var(--color-primary, #3b82f6)',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const overlay: React.CSSProperties = hasFrame ? {
    position: 'absolute',
    inset: 0,
    background: 'rgba(1, 8, 20, 0.65)',
    zIndex: 0,
  } : {};

  const content: React.CSSProperties = {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    width: '100%',
  };

  return (
    <div style={page}>
      {hasFrame && <div style={overlay} />}
      <div style={content}>
      {/* Logo + Badge + Título + Subtítulo agrupados no centro */}
      <div style={centerGroup}>
        <img src={data.assets.logoColorido} alt="Instituto Plenum Brasil" style={{ height: '18mm', marginBottom: '10mm' }} />
        <div style={badge}>{data.course.categoryLabel}</div>
        <h1 style={title}>{data.course.title}</h1>
        <p style={subtitle}>{data.course.subtitle}</p>
      </div>

      {/* Cards no bottom */}
      <div style={cardsRow}>
        <div style={card}>
          <div style={iconCircle}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
          <div>
            <div style={{ fontSize: '9pt', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.5, marginBottom: '0.3mm' }}>Capacitação em</div>
            <div style={{ fontSize: '13pt', fontWeight: 600 }}>{data.edition.locationVenue.split(' - ')[1] || data.edition.locationVenue.split(',')[0]}</div>
          </div>
        </div>
        <div style={card}>
          <div style={iconCircle}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div>
            <div style={{ fontSize: '9pt', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.5, marginBottom: '0.3mm' }}>Vagas limitadas</div>
            <div style={{ fontSize: '13pt', fontWeight: 600 }}>Presencial e Ao Vivo</div>
          </div>
        </div>
        <div style={card}>
          <div style={iconCircle}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <div>
            <div style={{ fontSize: '9pt', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.5, marginBottom: '0.3mm' }}>Próxima turma</div>
            <div style={{ fontSize: '13pt', fontWeight: 600 }}>{data.edition.dateLabel}</div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
