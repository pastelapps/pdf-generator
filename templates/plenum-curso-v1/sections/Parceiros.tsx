import React from 'react';

type Props = { instituicoes: string };

export function Parceiros({ instituicoes }: Props) {
  return (
    <div style={{ padding: '6mm 0', textAlign: 'center' }}>
      <h2 style={{ fontFamily: 'var(--font-heading), sans-serif', fontSize: '22pt', fontWeight: 700, color: '#fff', fontStyle: 'italic', marginBottom: '4mm' }}>
        Instituições que já se capacitaram conosco
      </h2>
      <img src={instituicoes} alt="Instituições parceiras" style={{ width: '80%' }} />
    </div>
  );
}
