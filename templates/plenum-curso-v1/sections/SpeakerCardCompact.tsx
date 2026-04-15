import React from 'react';

type Props = { name: string; role: string; bio: string; photoUrl: string | null; cardMargin?: string; scale?: number };

const PHOTO_W = 55;
const PHOTO_H = 70;
const OVERFLOW = 15;

export function SpeakerCardCompact({ name, role, bio, photoUrl, cardMargin, scale = 0 }: Props) {
  const mb = cardMargin ? `${5 + parseFloat(cardMargin)}mm` : '5mm';
  const mt = cardMargin ?? undefined;
  const card: React.CSSProperties = {
    display: 'flex', gap: '5mm', background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '5mm', marginBottom: mb,
    marginTop: mt ? `${parseFloat(mt) + OVERFLOW}mm` : `${OVERFLOW}mm`,
    overflow: 'visible',
  };
  const photo: React.CSSProperties = {
    width: `${PHOTO_W + scale}mm`,
    height: `${PHOTO_H + scale}mm`,
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
        <div style={{ fontSize: `${20 + scale}pt`, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1mm' }}>{name}</div>
        <div style={{ fontSize: `${11 + scale}pt`, color: 'var(--color-primary-light, #5b9cf6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2.5mm' }}>{role}</div>
        <div style={{ fontSize: `${11 + scale}pt`, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{bio}</div>
      </div>
    </div>
  );
}
