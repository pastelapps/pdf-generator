import path from 'node:path';

const ASSETS_DIR = path.resolve(process.cwd(), 'assets');

export function assetPath(filename: string): string {
  return path.join(ASSETS_DIR, filename);
}

export function assetUrl(filename: string): string {
  return `file://${assetPath(filename)}`;
}

export function getAssets() {
  return {
    logoColorido: assetUrl('logo-colorido.png'),
    logoBranco: assetUrl('logo-branco.png'),
    kitParticipante: assetUrl('kit-participante.png'),
    instituicoes: assetUrl('instituicoes.png'),
    fotosEvento: [
      assetUrl('evento-13.png'),
      assetUrl('evento-14.png'),
      assetUrl('evento-15.png'),
      assetUrl('evento-16.png'),
      assetUrl('evento-17.png'),
    ],
  };
}
