# pdf-generator

Microserviço de geração de folders PDF a partir de dados do Supabase.

## Setup

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

## Uso

### Gerar PDF de uma edição

```bash
curl -X POST http://localhost:3000/api/v1/generate-pdf \
  -H "Content-Type: application/json" \
  -d '{"edition_id":"<UUID-DA-EDICAO>"}'
```

### Resposta de sucesso

```json
{
  "success": true,
  "pdf_url": "https://...",
  "generated_at": "2026-04-14T...",
  "edition_id": "..."
}
```
