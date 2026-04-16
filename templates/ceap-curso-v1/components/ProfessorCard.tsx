import React from 'react';

type Props = {
  name: string;
  bio: string;
  photoUrl: string | null;
  fontScale?: number;
  marginBottom?: string;
};

export function ProfessorCard({ name, bio, photoUrl, fontScale = 0, marginBottom = '6mm' }: Props) {
  const nameSize = `${18 + fontScale}pt`;
  const bioSize = `${11 + fontScale}pt`;

  const card: React.CSSProperties = {
    display: 'flex',
    gap: '5mm',
    background: 'rgba(10, 25, 50, 0.5)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    padding: '5mm',
    marginBottom,
    overflow: 'hidden',
  };

  const photo: React.CSSProperties = {
    width: '45mm',
    height: '52mm',
    borderRadius: '8px',
    objectFit: 'cover',
    flexShrink: 0,
  };

  const nameStyle: React.CSSProperties = {
    fontFamily: "var(--font-heading, 'Poppins'), sans-serif",
    fontSize: nameSize,
    fontWeight: 900,
    color: '#00a6f5',
    marginBottom: '2mm',
    lineHeight: 1.2,
  };

  const bioStyle: React.CSSProperties = {
    fontSize: bioSize,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 1.5,
  };

  return (
    <div style={card}>
      {photoUrl && <img src={photoUrl} alt={name} style={photo} />}
      <div>
        <div style={nameStyle}>{name}</div>
        <div style={bioStyle}>{bio}</div>
      </div>
    </div>
  );
}
