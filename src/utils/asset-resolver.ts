import path from 'node:path';
import { readFileSync } from 'node:fs';
import type { Depoente } from '../schemas/view-model.js';

const TENANTS_DIR = path.resolve(process.cwd(), 'tenants');

type AssetsManifest = {
  logoColorido: string;
  logoBranco: string;
  kitParticipante: string;
  instituicoes: string;
  fotosEvento: string[];
};

function tenantAssetsDir(tenantName: string): string {
  return path.join(TENANTS_DIR, tenantName.toLowerCase(), 'assets');
}

function tenantAssetUrl(tenantName: string, filename: string): string {
  return `file://${path.join(tenantAssetsDir(tenantName), filename)}`;
}

export function getAssets(tenantName: string) {
  const manifestPath = path.join(TENANTS_DIR, tenantName.toLowerCase(), 'assets.json');
  const manifest: AssetsManifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));

  return {
    logoColorido: tenantAssetUrl(tenantName, manifest.logoColorido),
    logoBranco: tenantAssetUrl(tenantName, manifest.logoBranco),
    kitParticipante: tenantAssetUrl(tenantName, manifest.kitParticipante),
    instituicoes: tenantAssetUrl(tenantName, manifest.instituicoes),
    fotosEvento: manifest.fotosEvento.map(f => tenantAssetUrl(tenantName, f)),
  };
}

type CeapAssetsManifest = {
  background1: string;
  background2: string;
  backgroundE: string;
  backgroundProgramacao: string;
  kitDoAluno: string;
  medalha: string;
  licittoguru: string;
  footerPlataforma: string;
  logoCeapColorido: string;
  logoCeapBranco: string;
  backgroundFinalLicittoguru?: string;
  backgroundFinalPlataforma?: string;
  backgroundFinalMonicalopes?: string;
  iconeAlvo?: string;
  iconeCargaHoraria?: string;
  iconeData?: string;
  iconeLocal?: string;
};

export function getCeapAssets(tenantName: string) {
  const manifestPath = path.join(TENANTS_DIR, tenantName.toLowerCase(), 'assets.json');
  const manifest: CeapAssetsManifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));

  return {
    background1: tenantAssetUrl(tenantName, manifest.background1),
    background2: tenantAssetUrl(tenantName, manifest.background2),
    backgroundE: tenantAssetUrl(tenantName, manifest.backgroundE),
    backgroundProgramacao: tenantAssetUrl(tenantName, manifest.backgroundProgramacao),
    kitDoAluno: tenantAssetUrl(tenantName, manifest.kitDoAluno),
    medalha: tenantAssetUrl(tenantName, manifest.medalha),
    licittoguru: tenantAssetUrl(tenantName, manifest.licittoguru),
    footerPlataforma: tenantAssetUrl(tenantName, manifest.footerPlataforma),
    logoCeapColorido: tenantAssetUrl(tenantName, manifest.logoCeapColorido),
    logoCeapBranco: tenantAssetUrl(tenantName, manifest.logoCeapBranco),
    backgroundFinalLicittoguru: manifest.backgroundFinalLicittoguru ? tenantAssetUrl(tenantName, manifest.backgroundFinalLicittoguru) : '',
    backgroundFinalPlataforma: manifest.backgroundFinalPlataforma ? tenantAssetUrl(tenantName, manifest.backgroundFinalPlataforma) : '',
    backgroundFinalMonicalopes: manifest.backgroundFinalMonicalopes ? tenantAssetUrl(tenantName, manifest.backgroundFinalMonicalopes) : '',
    iconeAlvo: manifest.iconeAlvo ? tenantAssetUrl(tenantName, manifest.iconeAlvo) : '',
    iconeCargaHoraria: manifest.iconeCargaHoraria ? tenantAssetUrl(tenantName, manifest.iconeCargaHoraria) : '',
    iconeData: manifest.iconeData ? tenantAssetUrl(tenantName, manifest.iconeData) : '',
    iconeLocal: manifest.iconeLocal ? tenantAssetUrl(tenantName, manifest.iconeLocal) : '',
  };
}

export function loadDepoimentos(tenantName: string): Depoente[] {
  const filePath = path.join(tenantAssetsDir(tenantName), 'depoimentos.json');
  const raw = readFileSync(filePath, 'utf-8');
  const data = JSON.parse(raw) as Array<{ name: string; role: string; quote: string; photo: string }>;

  return data.map(d => ({
    ...d,
    photo: tenantAssetUrl(tenantName, d.photo.replace(/^\/assets\//, '')),
  }));
}
