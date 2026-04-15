import React from 'react';

type Props = { logoBranco: string };

export function Contato({ logoBranco }: Props) {
  return (
    <div style={{ textAlign: 'center', padding: '5mm 0', borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '4mm' }}>
      <div style={{ fontSize: '11pt', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '3mm' }}>Entre em contato</div>
      <img src={logoBranco} alt="Instituto Plenum Brasil" style={{ height: '14mm', marginBottom: '3mm' }} />
      <div style={{ fontSize: '11pt', color: 'rgba(255,255,255,0.6)', marginBottom: '2mm' }}>
        <strong style={{ color: '#fff' }}>CONSULTORA:</strong> AIANE LUSTOSA &nbsp; (61) 99291-1458 &nbsp; (61) 3142-0868
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '4mm', fontSize: '10pt', color: 'rgba(255,255,255,0.5)', flexWrap: 'wrap' }}>
        <span>@PLENUMBRASIL</span>
        <span>PLENUM BRASIL</span>
        <span>CURSOS@PLENUMBRASIL.COM</span>
        <span>PLENUMBRASIL.COM.BR</span>
      </div>
    </div>
  );
}
