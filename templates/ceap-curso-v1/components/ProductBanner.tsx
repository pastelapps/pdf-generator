import React from 'react';

type Props = {
  produto: 'licittoguru' | 'plataforma' | 'monicalopes';
  assets: {
    licittoguru: string;
    footerPlataforma: string;
  };
};

const PRODUCT_CONFIG = {
  licittoguru: {
    buttonText: 'Quero Testar 7 dias Gratuitamente',
    buttonColor: '#10b981',
  },
  plataforma: {
    buttonText: 'Quero Agendar uma Demonstra\u00e7\u00e3o!',
    buttonColor: '#00a6f5',
  },
  monicalopes: {
    buttonText: '',
    buttonColor: '#00a6f5',
  },
};

export function ProductBanner({ produto, assets }: Props) {
  const config = PRODUCT_CONFIG[produto];

  const banner: React.CSSProperties = {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  };

  const imgStyle: React.CSSProperties = {
    width: '100%',
    display: 'block',
  };

  if (produto === 'licittoguru') {
    return (
      <div style={banner}>
        <img src={assets.licittoguru} alt="Licito Guru" style={imgStyle} />
      </div>
    );
  }

  if (produto === 'plataforma') {
    return (
      <div style={banner}>
        <img src={assets.footerPlataforma} alt="Plataforma LegisATIVO" style={imgStyle} />
      </div>
    );
  }

  // monicalopes — placeholder until asset is provided
  return (
    <div style={{
      ...banner,
      background: 'linear-gradient(135deg, #0d2040 0%, #152a4a 100%)',
      padding: '10mm 16mm',
      textAlign: 'center',
      color: '#ffffff',
    }}>
      <div style={{ fontSize: '16pt', fontWeight: 700, marginBottom: '3mm' }}>
        Ceap Brasil &amp; Lopes
      </div>
      <div style={{ fontSize: '11pt', color: 'rgba(255,255,255,0.7)' }}>
        Imagem do produto ser&aacute; adicionada em breve.
      </div>
    </div>
  );
}
