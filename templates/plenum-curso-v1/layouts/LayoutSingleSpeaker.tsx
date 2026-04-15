import React from 'react';
import type { ViewModel } from '../../../src/schemas/view-model.js';
import { Cover } from '../sections/Cover.js';
import { AboutAndAudience } from '../sections/AboutAndAudience.js';
import { Program } from '../sections/Program.js';
import { SpeakerCardLarge } from '../sections/SpeakerCardLarge.js';
import { GarantaVaga } from '../sections/GarantaVaga.js';
import { Parceiros } from '../sections/Parceiros.js';
import { SomosReferencia } from '../sections/SomosReferencia.js';
import { Depoimentos } from '../sections/Depoimentos.js';
import { Contato } from '../sections/Contato.js';

type Props = { data: ViewModel };

const darkPage: React.CSSProperties = {
  width: '210mm',
  minHeight: '297mm',
  background: 'var(--color-background-deep, #010814)',
  color: '#fff',
  padding: '10mm 18mm',
};

const darkPageFixed: React.CSSProperties = {
  ...darkPage,
  height: '297mm',
  minHeight: undefined,
  overflow: 'hidden',
};

const sectionLabel: React.CSSProperties = {
  fontSize: '11pt',
  fontWeight: 700,
  letterSpacing: '2px',
  textTransform: 'uppercase',
  color: 'var(--color-primary-light, #3b82f6)',
  marginBottom: '3mm',
};

const sectionTitle: React.CSSProperties = {
  fontFamily: 'var(--font-heading), sans-serif',
  fontSize: '28pt',
  fontWeight: 700,
  fontStyle: 'italic',
  marginBottom: '5mm',
  lineHeight: 1.2,
  color: '#fff',
};

function addMm(base: number, delta: string | undefined): string {
  if (!delta) return `${base}mm`;
  return `${base + parseFloat(delta)}mm`;
}

export function LayoutSingleSpeaker({ data }: Props) {
  const instructor = data.instructors[0]!;

  return (
    <>
      {/* Página 1: Capa */}
      <Cover data={data} />

      {/* Página 2: Sobre + Público */}
      <AboutAndAudience data={data} />

      {/* Página 3+: Programação (fundo branco, quebra natural) */}
      <Program data={data} />

      {/* Página: Palestrante + Somos Referência + Parceiros */}
      <div style={{ ...darkPageFixed, breakBefore: 'page' as const }}>
        <div style={sectionLabel}>Palestrantes</div>
        <h2 style={sectionTitle}>Palestrantes</h2>
        <SpeakerCardLarge
          name={instructor.name}
          role={instructor.role}
          bio={instructor.bio}
          photoUrl={instructor.photoUrl}
        />
        <SomosReferencia fotosEvento={data.assets.fotosEvento} />
        <Parceiros instituicoes={data.assets.instituicoes} />
      </div>

      {/* Última página: Garanta Vaga + Depoimentos + Contato */}
      <div style={{ ...darkPageFixed, breakBefore: 'page' as const }}>
        <GarantaVaga data={data} />
        <Depoimentos depoentes={data.assets.depoentes} />
        <Contato logoBranco={data.assets.logoBranco} />
      </div>
    </>
  );
}
