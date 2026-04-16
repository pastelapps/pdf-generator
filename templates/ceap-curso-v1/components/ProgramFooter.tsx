import React from 'react';

type Props = {
  contato: {
    telefone1: string;
    telefone2: string;
    email: string;
    site: string;
  };
  logoBranco: string;
};

export function ProgramFooter({ contato, logoBranco }: Props) {
  const footer: React.CSSProperties = {
    width: '100%',
    background: 'transparent',
    padding: '5mm 16mm',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#ffffff',
  };

  const leftStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5mm',
  };

  const garantaStyle: React.CSSProperties = {
    fontFamily: "var(--font-heading, 'Poppins'), sans-serif",
    fontSize: '11pt',
    fontWeight: 900,
    textTransform: 'uppercase',
    color: '#ffffff',
    marginBottom: '1mm',
    borderBottom: '1px solid rgba(255,255,255,0.3)',
    paddingBottom: '1.5mm',
  };

  const contactLine: React.CSSProperties = {
    display: 'flex',
    gap: '4mm',
    fontSize: '8pt',
    color: 'rgba(255,255,255,0.8)',
  };

  return (
    <div style={footer}>
      <div style={leftStyle}>
        <div style={garantaStyle}>GARANTA J&Aacute; A SUA INSCRI&Ccedil;&Atilde;O!</div>
        <div style={contactLine}>
          <span>{contato.telefone1}</span>
          <span style={{ borderLeft: '1px solid rgba(255,255,255,0.3)', paddingLeft: '4mm' }}>{contato.email}</span>
        </div>
        <div style={contactLine}>
          <span>{contato.telefone2}</span>
          <span style={{ borderLeft: '1px solid rgba(255,255,255,0.3)', paddingLeft: '4mm' }}>{contato.site}</span>
        </div>
      </div>
    </div>
  );
}
