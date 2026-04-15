import React from 'react';

type Props = { name: string; role: string; bio: string; photoUrl: string | null; cardMargin?: string; scale?: number };

export function SpeakerCardCompact({ name, role, bio, photoUrl, cardMargin, scale = 0 }: Props) {
  const mb = cardMargin ? `${5 + parseFloat(cardMargin)}mm` : '5mm';
  const mt = cardMargin ?? undefined;
  const card: React.CSSProperties = {
    display: 'flex', gap: '5mm', background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '5mm', marginBottom: mb,
    marginTop: mt,
  };
  return (
    <div style={card}>
      {photoUrl && <img src={photoUrl} alt={name} style={{ width: `${32 + scale}mm`, height: `${38 + scale}mm`, borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />}
      <div>
        <div style={{ fontSize: `${20 + scale}pt`, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1mm' }}>{name}</div>
        <div style={{ fontSize: `${11 + scale}pt`, color: 'var(--color-primary-light, #5b9cf6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2.5mm' }}>{role}</div>
        <div style={{ fontSize: `${11 + scale}pt`, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{bio}</div>
      </div>
    </div>
  );
}
