import React from 'react';
import { Icon } from '../components/Icon.js';
import type { ViewModel } from '../../../src/schemas/view-model.js';

type Props = { data: ViewModel };

export function GarantaVaga({ data }: Props) {
  return (
    <div style={{ padding: '6mm 0' }}>
      <h2 style={{ fontFamily: 'var(--font-heading), sans-serif', fontSize: '24pt', fontWeight: 700, color: '#fff', marginBottom: '2mm', fontStyle: 'italic' }}>
        {data.course.investmentHeading}
      </h2>
      {data.course.investmentSubtitle && (
        <p style={{ fontSize: '13pt', color: 'rgba(255,255,255,0.6)', marginBottom: '4mm', lineHeight: 1.5 }}>{data.course.investmentSubtitle}</p>
      )}
      <div style={{ display: 'flex', gap: '6mm', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '11pt', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '3mm' }}>O que está incluso:</div>
          {data.course.includedItems.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '2.5mm', fontSize: '13pt', color: 'rgba(255,255,255,0.8)', marginBottom: '2mm' }}>
              <div style={{ color: 'var(--color-primary-light, #5b9cf6)', flexShrink: 0, marginTop: '0.5mm' }}><Icon name={item.icon} size={12} /></div>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
        <img src={data.assets.kitParticipante} alt="Kit" style={{ width: '90mm', objectFit: 'contain', flexShrink: 0 }} />
      </div>
    </div>
  );
}
