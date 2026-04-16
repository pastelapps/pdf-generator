import React from 'react';
import type { CeapViewModel } from '../../../src/schemas/ceap-view-model.js';

type Props = { data: CeapViewModel };

export function Cover({ data }: Props) {
  const isMulti = data.layoutVariant === 'multi-prof';
  const capaOv = data.sectionOverrides?.capa;
  const profFontSize = capaOv?.professor_font_size
    ? `${parseFloat(capaOv.professor_font_size)}pt`
    : '14pt';

  const page: React.CSSProperties = {
    width: '210mm',
    height: '297mm',
    backgroundImage: `url(${data.assets.background1})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  };

  const logoStyle: React.CSSProperties = {
    height: '22mm',
    marginTop: '14mm',
    objectFit: 'contain',
  };

  const photoContainerStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
    width: '100%',
    position: 'relative',
    minHeight: 0,
  };

  const photoStyle: React.CSSProperties = {
    height: '155mm',
    objectFit: 'contain',
    objectPosition: 'bottom center',
    maxWidth: '100%',
  };

  const profNameStyle: React.CSSProperties = {
    position: 'absolute',
    color: '#ffffff',
    fontSize: profFontSize,
    fontWeight: 400,
    letterSpacing: '1.5px',
    fontFamily: "var(--font-heading, 'Poppins'), sans-serif",
    whiteSpace: 'pre-line',
  };

  const bottomContent: React.CSSProperties = {
    width: '100%',
    textAlign: 'center',
    padding: '0 18mm 16mm',
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: 'var(--font-heading, sans-serif)',
    fontSize: '28pt',
    fontWeight: 900,
    textTransform: 'uppercase',
    color: '#ffffff',
    lineHeight: 1.1,
    marginBottom: '3mm',
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '18pt',
    fontWeight: 400,
    color: '#00a6f5',
    letterSpacing: '1px',
    marginBottom: '5mm',
  };

  const dateBoxStyle: React.CSSProperties = {
    display: 'inline-block',
    background: 'linear-gradient(to right, #012441, #0157b6)',
    borderRadius: '50px',
    padding: '3mm 10mm',
    fontSize: '13pt',
    fontWeight: 700,
    letterSpacing: '3px',
    textTransform: 'uppercase',
    color: '#ffffff',
    marginBottom: '5mm',
  };

  // Single professor layout
  if (!isMulti) {
    const instructor = data.instructors[0]!;
    const photoUrl = instructor.photoUrl || data.course.coverImageUrl;

    return (
      <div style={page}>
        <img src={data.assets.logoCeapColorido} alt="CEAP Brasil" style={logoStyle} />

        <div style={photoContainerStyle}>
          {photoUrl && (
            <img src={photoUrl} alt={instructor.name} style={photoStyle} />
          )}
          <div style={{
            ...profNameStyle,
            right: '18mm',
            top: '30mm',
          }}>
            {instructor.role ? `${instructor.role.split(' ')[0]}. ` : 'Prof. '}{instructor.name}
          </div>
        </div>

        <div style={bottomContent}>
          <h1 style={titleStyle}>{data.course.title}</h1>
          {data.course.subtitle && (
            <p style={subtitleStyle}>{data.course.subtitle}</p>
          )}
          <div style={dateBoxStyle}>{data.course.dateLabel}{data.course.locationCity ? ` | ${data.course.locationCity}` : ''}</div>
        </div>
      </div>
    );
  }

  // Multi-professor layout — uses a composed cover photo
  const leftMargins = data.professorLeftMargins || {};
  const rightMargins = data.professorRightMargins || {};
  const coverPhoto = data.coverPhotoUrl || data.course.coverImageUrl;

  return (
    <div style={page}>
      <img src={data.assets.logoCeapColorido} alt="CEAP Brasil" style={logoStyle} />

      <div style={photoContainerStyle}>
        {coverPhoto && (
          <img src={coverPhoto} alt="Professores" style={photoStyle} />
        )}
        {data.professorLeftName && (
          <div style={{
            ...profNameStyle,
            left: leftMargins.left || '14mm',
            right: leftMargins.right || 'auto',
            top: '25mm',
          }}>
            {data.professorLeftName}
          </div>
        )}
        {data.professorRightName && (
          <div style={{
            ...profNameStyle,
            right: rightMargins.right || '14mm',
            left: rightMargins.left || 'auto',
            top: '25mm',
            textAlign: 'right',
          }}>
            {data.professorRightName}
          </div>
        )}
      </div>

      <div style={bottomContent}>
        <h1 style={titleStyle}>{data.course.title}</h1>
        {data.course.subtitle && (
          <p style={subtitleStyle}>{data.course.subtitle}</p>
        )}
        <div style={dateBoxStyle}>{data.course.dateLabel}</div>
      </div>
    </div>
  );
}
