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
  return path.join(TENANTS_DIR, tenantName, 'assets');
}

function tenantAssetUrl(tenantName: string, filename: string): string {
  return `file://${path.join(tenantAssetsDir(tenantName), filename)}`;
}

export function getAssets(tenantName: string) {
  const manifestPath = path.join(TENANTS_DIR, tenantName, 'assets.json');
  const manifest: AssetsManifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));

  return {
    logoColorido: tenantAssetUrl(tenantName, manifest.logoColorido),
    logoBranco: tenantAssetUrl(tenantName, manifest.logoBranco),
    kitParticipante: tenantAssetUrl(tenantName, manifest.kitParticipante),
    instituicoes: tenantAssetUrl(tenantName, manifest.instituicoes),
    fotosEvento: manifest.fotosEvento.map(f => tenantAssetUrl(tenantName, f)),
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
