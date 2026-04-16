# PDF Generator

Microserviço multi-tenant de geração de folders PDF a partir de dados do Supabase. Utiliza React para renderização de templates HTML e Playwright para conversão em PDF.

## Arquitetura

```
Request → Autenticação (Bearer Token) → Carrega Dados (Supabase) → Monta ViewModel → Renderiza HTML (React) → Gera PDF (Playwright) → Upload (Supabase Storage) → Retorna URL
```

### Tenants

| Tenant | Template           | Token Prefix | Supabase                                          |
|--------|--------------------|--------------|----------------------------------------------------|
| Plenum | `plenum-curso-v1`  | `plnm-`     | `jyackmnjhsdllfqqxund.supabase.co`                |
| CEAP   | `ceap-curso-v1`    | `ceap-`     | `jdcpglpcwrviotluzfvm.supabase.co`                |

Cada tenant possui seu próprio token de autenticação, templates, assets e conexão Supabase.

### Stack

- **Runtime:** Node.js + TypeScript (ESM)
- **Server:** Fastify
- **Templates:** React (SSR com `renderToStaticMarkup`)
- **PDF:** Playwright (Chromium headless)
- **Storage:** Supabase Storage
- **Banco de tenants:** SQLite (`data/tenants.db`)
- **Deploy:** Docker Compose

## Produção

| Item         | Valor                              |
|--------------|------------------------------------|
| **URL Base** | `http://77.237.247.129:59542`      |
| **Endpoint** | `POST /api/v1/generate-pdf`        |
| **Health**   | `GET /health`                      |

### Deploy

```bash
ssh root@77.237.247.129 "cd /opt/pdf-generator && git pull && docker compose down && docker compose up -d --build"
```

## Setup Local

1. Copie o `.env.example` para `.env.local` e preencha com suas credenciais:

```bash
cp .env.example .env.local
```

2. Suba o serviço com Docker:

```bash
docker compose up
```

3. Verifique que o serviço está rodando:

```bash
curl http://localhost:3000/health
```

## API

### Autenticação

Todas as requisições precisam do header:

```
Authorization: Bearer {TOKEN_DO_TENANT}
```

### Gerar PDF — Plenum

```bash
curl -X POST http://77.237.247.129:59542/api/v1/generate-pdf \
  -H "Authorization: Bearer plnm-..." \
  -H "Content-Type: application/json" \
  -d '{
    "edition_id": "UUID-DA-EDICAO",
    "section_overrides": {
      "about": { "margin_top": "5", "scale": "2" },
      "audience": { "card_font_size": "1" },
      "program": { "day_margin_top": "3" },
      "speakers": { "scale": "1.5" }
    }
  }'
```

### Gerar PDF — CEAP

```bash
curl -X POST http://77.237.247.129:59542/api/v1/generate-pdf \
  -H "Authorization: Bearer ceap-..." \
  -H "Content-Type: application/json" \
  -d '{
    "course_id": "UUID-DO-CURSO",
    "template_params": {
      "produto": "licittoguru"
    },
    "ceap_section_overrides": {
      "programacao": { "font_size": "1" }
    }
  }'
```

### Preview HTML (Debug)

Adicione `?debug=true` na URL para receber o HTML renderizado em vez do PDF:

```bash
curl -X POST "http://77.237.247.129:59542/api/v1/generate-pdf?debug=true" \
  -H "Authorization: Bearer plnm-..." \
  -H "Content-Type: application/json" \
  -d '{"edition_id": "UUID"}'
```

### Resposta de sucesso

```json
{
  "success": true,
  "pdf_url": "https://supabase.co/storage/v1/object/public/pdfs/generated/curso-uuid-timestamp.pdf",
  "generated_at": "2026-04-16T14:30:00.000Z",
  "edition_id": "..."
}
```

## Estrutura do Projeto

```
├── src/
│   ├── server.ts                  # Fastify bootstrap
│   ├── config.ts                  # Variáveis de ambiente
│   ├── routes/generate-pdf.ts     # Rota principal + schemas Zod
│   ├── middleware/auth.ts         # Autenticação Bearer
│   ├── services/
│   │   ├── course-loader.ts       # Loader Plenum (Supabase)
│   │   ├── ceap-course-loader.ts  # Loader CEAP (Supabase)
│   │   ├── view-model-builder.ts  # Builder ViewModel Plenum
│   │   ├── ceap-view-model-builder.ts # Builder ViewModel CEAP
│   │   ├── html-renderer.ts       # Renderiza React → HTML (Plenum)
│   │   ├── ceap-html-renderer.ts  # Renderiza React → HTML (CEAP)
│   │   ├── pdf-renderer.ts        # HTML → PDF (Playwright)
│   │   └── storage.ts             # Upload Supabase Storage
│   ├── schemas/                   # Tipos TypeScript + Zod
│   ├── clients/                   # Supabase factory, tenant DB
│   └── utils/                     # Asset resolver, normalizers
├── templates/
│   ├── registry.ts                # Registro de templates
│   ├── plenum-curso-v1/           # Template Plenum (React)
│   └── ceap-curso-v1/             # Template CEAP (React)
├── tenants/
│   ├── plenum/                    # Assets + spec da Plenum
│   └── ceap/                      # Assets + spec do CEAP
├── data/tenants.db                # SQLite com tokens e config
├── docker-compose.yml
└── Dockerfile
```

## Gestão de Tenants

```bash
# Listar tenants
npx tsx src/scripts/manage-tenants.ts list

# Adicionar tenant
npx tsx src/scripts/manage-tenants.ts add \
  --name "Nome" --prefix xx \
  --url "https://xxx.supabase.co" --key "..." \
  --bucket pdfs --folder generated \
  --template template-id

# Revogar token
npx tsx src/scripts/manage-tenants.ts revoke {token}
```

## Documentação por Tenant

Cada tenant possui um `SPEC_INTEGRACAO.md` com instruções completas para o desenvolvedor frontend:

- **Plenum:** [`tenants/plenum/SPEC_INTEGRACAO.md`](tenants/plenum/SPEC_INTEGRACAO.md)
- **CEAP:** [`tenants/ceap/SPEC_INTEGRACAO.md`](tenants/ceap/SPEC_INTEGRACAO.md) *(em breve)*
