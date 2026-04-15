import { randomBytes } from 'node:crypto';
import { initTenantDb, createTenant, listTenants, revokeTenant } from '../clients/tenant-db.js';

function generateToken(prefix: string): string {
  const hash = randomBytes(16).toString('hex');
  return `${prefix}-${hash}`;
}

function printUsage(): void {
  console.log(`
Uso:
  npx tsx src/scripts/manage-tenants.ts add --name "Plenum" --prefix plnm --url "https://..." --key "..." [--bucket pdfs] [--folder generated]
  npx tsx src/scripts/manage-tenants.ts list
  npx tsx src/scripts/manage-tenants.ts revoke <token>
`);
}

function parseArgs(args: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;
    if (arg.startsWith('--') && i + 1 < args.length) {
      result[arg.slice(2)] = args[i + 1]!;
      i++;
    }
  }
  return result;
}

const [command, ...rest] = process.argv.slice(2);

if (!command) {
  printUsage();
  process.exit(1);
}

initTenantDb();

switch (command) {
  case 'add': {
    const opts = parseArgs(rest);
    const { name, prefix, url, key, bucket, folder } = opts;

    if (!name || !prefix || !url || !key) {
      console.error('Erro: --name, --prefix, --url e --key são obrigatórios');
      printUsage();
      process.exit(1);
    }

    const token = generateToken(prefix);
    const tenant = createTenant({
      name,
      token,
      supabase_url: url,
      supabase_key: key,
      storage_bucket: bucket,
      storage_folder: folder,
    });

    console.log('\nTenant criado com sucesso!\n');
    console.log(`  Nome:   ${tenant.name}`);
    console.log(`  Token:  ${tenant.token}`);
    console.log(`  URL:    ${tenant.supabase_url}`);
    console.log(`  Bucket: ${tenant.storage_bucket}`);
    console.log(`  Folder: ${tenant.storage_folder}`);
    console.log();
    break;
  }

  case 'list': {
    const tenants = listTenants();

    if (tenants.length === 0) {
      console.log('Nenhum tenant cadastrado.');
      break;
    }

    console.log('\nTenants cadastrados:\n');
    for (const t of tenants) {
      const status = t.active ? 'ATIVO' : 'INATIVO';
      console.log(`  [${status}] ${t.name}`);
      console.log(`    Token:  ${t.token}`);
      console.log(`    URL:    ${t.supabase_url}`);
      console.log(`    Bucket: ${t.storage_bucket}/${t.storage_folder}`);
      console.log(`    Criado: ${t.created_at}`);
      console.log();
    }
    break;
  }

  case 'revoke': {
    const token = rest[0];
    if (!token) {
      console.error('Erro: informe o token a revogar');
      printUsage();
      process.exit(1);
    }

    const revoked = revokeTenant(token);
    if (revoked) {
      console.log('Token revogado com sucesso.');
    } else {
      console.error('Token não encontrado.');
      process.exit(1);
    }
    break;
  }

  default:
    console.error(`Comando desconhecido: ${command}`);
    printUsage();
    process.exit(1);
}
