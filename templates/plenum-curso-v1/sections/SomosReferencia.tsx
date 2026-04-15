import React from 'react';

type Props = { fotosEvento: string[] };

export function SomosReferencia({ fotosEvento }: Props) {
  return (
    <div style={{ padding: '6mm 0', textAlign: 'center' }}>
      <h2 style={{ fontFamily: 'var(--font-heading), sans-serif', fontSize: '24pt', fontWeight: 700, color: '#fff', fontStyle: 'italic', lineHeight: 1.3, marginBottom: '5mm' }}>
        Somos referência em capacitação e desenvolvimento<br />de gestores públicos no país.
      </h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2mm', justifyContent: 'center' }}>
        {fotosEvento.slice(0, 3).map((foto, i) => (
          <img key={i} src={foto} alt={`Evento ${i + 1}`} style={{ width: '56mm', height: '32mm', objectFit: 'cover', borderRadius: '6px' }} />
        ))}
        {fotosEvento.slice(3).map((foto, i) => (
          <img key={i + 3} src={foto} alt={`Evento ${i + 4}`} style={{ width: '56mm', height: '32mm', objectFit: 'cover', borderRadius: '6px' }} />
        ))}
      </div>
    </div>
  );
}
