import React from 'react';

type Props = { name: string; role: string; bio: string; photoUrl: string | null; cardMarginTop?: string };

const PHOTO_W = 55;
const PHOTO_H = 70;
const OVERFLOW = 15;

export function SpeakerCardLarge({ name, role, bio, photoUrl, cardMarginTop }: Props) {
  const mt = cardMarginTop ? `${parseFloat(cardMarginTop) + OVERFLOW}mm` : `${OVERFLOW}mm`;
  const card: React.CSSProperties = {
    display: 'flex', gap: '6mm', background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '6mm', marginBottom: '6mm',
    marginTop: mt,
    overflow: 'visible',
  };
  const photo: React.CSSProperties = {
    width: `${PHOTO_W}mm`,
    height: `${PHOTO_H}mm`,
    borderRadius: '8px',
    objectFit: 'cover',
    flexShrink: 0,
    position: 'relative',
    top: `-${OVERFLOW}mm`,
    marginBottom: `-${OVERFLOW}mm`,
  };
  return (
    <div style={card}>
      {photoUrl && <img src={photoUrl} alt={name} style={photo} />}
      <div>
        <div style={{ fontSize: '22pt', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1mm' }}>{name}</div>
        <div style={{ fontSize: '11pt', color: 'var(--color-primary-light, #5b9cf6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3mm' }}>{role}</div>
        <div style={{ fontSize: '12pt', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{bio}</div>
      </div>
    </div>
  );
}
