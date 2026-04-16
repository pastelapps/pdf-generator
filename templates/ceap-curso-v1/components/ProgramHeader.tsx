import React from 'react';

type Props = {
  title: string;
  subtitle: string;
  dateLabel: string;
  locationCity?: string;
  showLabel?: boolean;
};

export function ProgramHeader({ title, subtitle, dateLabel, locationCity, showLabel = true }: Props) {
  const header: React.CSSProperties = {
    width: '100%',
    background: 'transparent',
    padding: '8mm 16mm 8mm 16mm',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const leftSide: React.CSSProperties = {
    maxWidth: '55%',
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: "var(--font-heading, 'Poppins'), sans-serif",
    fontSize: '16pt',
    fontWeight: 900,
    textTransform: 'uppercase',
    color: '#ffffff',
    lineHeight: 1.2,
    marginBottom: '1.5mm',
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '9pt',
    color: '#00a6f5',
    letterSpacing: '0.5px',
    marginBottom: '2mm',
  };

  const dateBoxStyle: React.CSSProperties = {
    display: 'inline-block',
    background: 'linear-gradient(to right, #012441, #0157b6)',
    borderRadius: '50px',
    padding: '1.5mm 5mm',
    fontSize: '8pt',
    fontWeight: 700,
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: '#ffffff',
  };

  const rightSide: React.CSSProperties = {
    fontFamily: "var(--font-heading, 'Poppins'), sans-serif",
    fontSize: '32pt',
    fontWeight: 900,
    textTransform: 'uppercase',
    color: '#ffffff',
    letterSpacing: '2px',
  };

  return (
    <div style={header}>
      <div style={leftSide}>
        <div style={titleStyle}>{title}</div>
        {subtitle && <div style={subtitleStyle}>{subtitle}</div>}
        <div style={dateBoxStyle}>{dateLabel}{locationCity ? ` | ${locationCity}` : ''}</div>
      </div>
      {showLabel && <div style={rightSide}>PROGRAMA&Ccedil;&Atilde;O</div>}
    </div>
  );
}
