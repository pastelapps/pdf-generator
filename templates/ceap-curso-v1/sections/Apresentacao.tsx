import React from 'react';
import type { CeapViewModel } from '../../../src/schemas/ceap-view-model.js';

type Props = { data: CeapViewModel };

function addMm(base: number, delta: string | undefined): string {
  if (!delta) return `${base}mm`;
  return `${base + parseFloat(delta)}mm`;
}

export function Apresentacao({ data }: Props) {
  const ov = data.sectionOverrides?.apresentacao;

  const topMargin = addMm(32, ov?.margin_top);
  const bottomMargin = addMm(6, ov?.margin_bottom);
  const cardPadding = addMm(3, ov?.card_padding);
  const cardSpacing = addMm(2, ov?.card_spacing);
  const baseFontSize = 13 + parseFloat(ov?.font_size || '0');
  const cardFontSize = `${12 + parseFloat(ov?.card_font_size || '0')}pt`;

  const page: React.CSSProperties = {
    width: '210mm',
    height: '297mm',
    backgroundImage: `url(${data.assets.background2})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    padding: `${topMargin} 18mm 10mm 18mm`,
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: 'var(--font-heading, sans-serif)',
    fontSize: '30pt',
    fontWeight: 900,
    color: '#ffffff',
    marginBottom: '6mm',
    lineHeight: 1.15,
  };

  const textStyle: React.CSSProperties = {
    fontSize: `${baseFontSize}pt`,
    color: '#ffffff',
    lineHeight: 1.55,
    marginBottom: bottomMargin,
  };

  const twoColStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8mm',
    flex: 1,
    minHeight: 0,
  };

  const leftColStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  };

  const rightColStyle: React.CSSProperties = {
    width: '80mm',
    display: 'flex',
    flexDirection: 'column',
    gap: '5mm',
  };

  const paraQuemTitle: React.CSSProperties = {
    fontFamily: 'var(--font-heading, sans-serif)',
    fontSize: '22pt',
    fontWeight: 900,
  };

  const paraQuemContainer: React.CSSProperties = {
    border: '1px solid #00a6f5',
    borderRadius: '14px',
    padding: '5mm',
    display: 'flex',
    flexDirection: 'column',
    background: 'linear-gradient(135deg, #00438d, #000000, #000000, #000000, #00438d)',
  };

  const checkCardStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '3mm',
    background: 'rgba(10, 25, 50, 0.5)',
    borderRadius: '8px',
    padding: `${cardPadding} 4mm`,
    marginBottom: cardSpacing,
    fontSize: cardFontSize,
    color: '#ffffff',
    lineHeight: 1.35,
  };

  const checkIconStyle: React.CSSProperties = {
    width: '5.5mm',
    height: '5.5mm',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const infoLabelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-heading, sans-serif)',
    fontSize: '20pt',
    fontWeight: 900,
    color: '#ffffff',
    lineHeight: 1.2,
  };

  const infoValueStyle: React.CSSProperties = {
    fontSize: '12pt',
    color: '#ffffff',
    lineHeight: 1.4,
  };

  const infoIconStyle: React.CSSProperties = {
    width: '14mm',
    height: '14mm',
    flexShrink: 0,
  };

  // Build apresentação text: prefer folderPresentation, fallback to aboutDescription
  const apresentacaoText = data.course.folderPresentation || data.course.aboutDescription || data.course.aboutSubheading || '';

  return (
    <div style={page} className="page-break">
      <h2 style={titleStyle}>Apresenta&ccedil;&atilde;o</h2>

      {apresentacaoText && (
        <p style={textStyle}>{apresentacaoText}</p>
      )}

      <div style={twoColStyle}>
        {/* Left column: Para quem é? — container com borda */}
        <div style={leftColStyle}>
          <div style={paraQuemContainer}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3mm', marginBottom: '4mm' }}>
              <img src={data.assets.iconeAlvo} alt="Alvo" style={{ width: '61px', height: '61px' }} />
              <span style={paraQuemTitle}>
                Para <span style={{ color: '#00a6f5' }}>quem &eacute;?</span>
              </span>
            </div>

            {data.course.audienceCards.map((card, i) => (
              <div key={i} style={checkCardStyle}>
                <span style={checkIconStyle}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#00a6f5" strokeWidth="1.5" fill="none" />
                    <polyline points="7 12 10.5 15.5 17 9" stroke="#00a6f5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                </span>
                <span>{card.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: Carga Horária, Data, Local */}
        <div style={rightColStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4mm' }}>
            <img src={data.assets.iconeCargaHoraria} alt="Carga Horária" style={infoIconStyle} />
            <div>
              <div style={infoLabelStyle}>Carga Hor&aacute;ria</div>
              <div style={infoValueStyle}>{data.course.workload ? `${data.course.workload}h` : '20h'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4mm' }}>
            <img src={data.assets.iconeData} alt="Data" style={infoIconStyle} />
            <div>
              <div style={infoLabelStyle}>Data</div>
              <div style={infoValueStyle}>{data.course.dateLabel}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4mm' }}>
            <img src={data.assets.iconeLocal} alt="Local" style={infoIconStyle} />
            <div>
              <div style={infoLabelStyle}>Local</div>
              <div style={{ ...infoValueStyle, fontWeight: 700 }}>{data.course.locationVenue}</div>
              <div style={infoValueStyle}>{data.course.locationAddress}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
