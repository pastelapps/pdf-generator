import React from 'react';
import type { ViewModel } from '../../../src/schemas/view-model.js';
import { Cover } from '../sections/Cover.js';
import { AboutAndAudience } from '../sections/AboutAndAudience.js';
import { Program } from '../sections/Program.js';
import { SpeakerCardCompact } from '../sections/SpeakerCardCompact.js';
import { GarantaVaga } from '../sections/GarantaVaga.js';
import { SomosReferencia } from '../sections/SomosReferencia.js';
import { Depoimentos } from '../sections/Depoimentos.js';
import { Parceiros } from '../sections/Parceiros.js';
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
  marginBottom: '8mm',
  lineHeight: 1.2,
  color: '#fff',
};

const footerLogo: React.CSSProperties = {
  display: 'block',
  margin: '8mm auto 0',
  height: '10mm',
  opacity: 0.4,
};

function addMm(base: number, delta: string | undefined): string {
  if (!delta) return `${base}mm`;
  return `${base + parseFloat(delta)}mm`;
}

export function LayoutMultiSpeaker({ data }: Props) {
  const speakersCardMt = data.sectionOverrides?.speakers?.margin_top ? addMm(0, data.sectionOverrides.speakers.margin_top) : undefined;

  return (
    <>
      {/* Página 1: Capa */}
      <Cover data={data} />

      {/* Página 2: Sobre + Público */}
      <AboutAndAudience data={data} />

      {/* Página 3+: Programação (fundo branco) */}
      <Program data={data} />

      {/* Página: Palestrantes (página inteira, fundo escuro) */}
      <div style={{ ...darkPageFixed, breakBefore: 'page' as const }}>
        <div style={sectionLabel}>Palestrantes</div>
        <h2 style={sectionTitle}>Palestrantes</h2>
        {data.instructors.map(instructor => (
          <SpeakerCardCompact
            key={instructor.id}
            name={instructor.name}
            role={instructor.role}
            bio={instructor.bio}
            photoUrl={instructor.photoUrl}
            cardMarginTop={speakersCardMt}
          />
        ))}
        <img src={data.assets.logoBranco} alt="Logo" style={footerLogo} />
      </div>

      {/* Página: Somos Referência + Garanta Vaga */}
      <div style={{ ...darkPageFixed, breakBefore: 'page' as const }}>
        <SomosReferencia fotosEvento={data.assets.fotosEvento} />
        <GarantaVaga data={data} />
        <img src={data.assets.logoBranco} alt="Logo" style={footerLogo} />
      </div>

      {/* Última página: Depoimentos + Parceiros + Contato */}
      <div style={{ ...darkPageFixed, breakBefore: 'page' as const }}>
        <Depoimentos depoentes={data.assets.depoentes} />
        <Parceiros instituicoes={data.assets.instituicoes} />
        <Contato logoBranco={data.assets.logoBranco} />
      </div>
    </>
  );
}
