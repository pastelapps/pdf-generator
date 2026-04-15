import React from 'react';

type Props = { name: string; role: string; bio: string; photoUrl: string | null; cardMarginTop?: string };

export function SpeakerCardLarge({ name, role, bio, photoUrl, cardMarginTop }: Props) {
  const card: React.CSSProperties = {
    display: 'flex', gap: '6mm', background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '6mm', marginBottom: '6mm',
    marginTop: cardMarginTop,
  };
  return (
    <div style={card}>
      {photoUrl && <img src={photoUrl} alt={name} style={{ width: '42mm', height: '48mm', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />}
      <div>
        <div style={{ fontSize: '22pt', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1mm' }}>{name}</div>
        <div style={{ fontSize: '11pt', color: 'var(--color-primary-light, #5b9cf6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3mm' }}>{role}</div>
        <div style={{ fontSize: '12pt', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{bio}</div>
      </div>
    </div>
  );
}
