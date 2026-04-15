import React from 'react';
import type { Depoente } from '../../../src/schemas/view-model.js';

type Props = { depoentes: Depoente[] };

export function Depoimentos({ depoentes }: Props) {
  const card: React.CSSProperties = {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '14px',
    padding: '4mm',
    width: '83mm',
    flexShrink: 0,
  };

  return (
    <div style={{ padding: '6mm 0', textAlign: 'center' }}>
      <h2 style={{ fontFamily: 'var(--font-heading), sans-serif', fontSize: '24pt', fontWeight: 700, color: '#fff', fontStyle: 'italic', marginBottom: '5mm' }}>
        Veja quem já esteve aqui:
      </h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4mm', justifyContent: 'center' }}>
        {depoentes.map((dep, i) => (
          <div key={i} style={card}>
            <p style={{ fontSize: '10pt', fontStyle: 'italic', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5, marginBottom: '3mm', textAlign: 'left' }}>
              &ldquo;{dep.quote}&rdquo;
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2.5mm', textAlign: 'left' }}>
              <img src={dep.photo} alt={dep.name} style={{ width: '10mm', height: '10mm', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '11pt', fontWeight: 700, color: '#fff' }}>{dep.name}</div>
                <div style={{ fontSize: '9pt', color: 'var(--color-primary-light, #5b9cf6)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{dep.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
