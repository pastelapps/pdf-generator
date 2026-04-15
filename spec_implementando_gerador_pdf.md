# Spec: Integração com o Gerador de PDF

> Documento completo para implementar a integração de um sistema frontend com a API de geração de folders PDF.

---

## 1. Visão Geral

O **PDF Generator** é um microserviço que gera folders em PDF a partir de dados armazenados no Supabase. Ele recebe uma requisição com o ID da edição de um curso, busca os dados no banco, renderiza um template React em HTML e converte para PDF usando Playwright (Chromium headless).

### Fluxo simplificado

```
Frontend → POST /api/v1/generate-pdf → Microserviço → Supabase (dados) → HTML → PDF → Supabase Storage → URL pública
```

---

## 2. Autenticação

### Como funciona

Toda requisição (exceto `GET /health`) exige um **Bearer Token** no header `Authorization`.

```
Authorization: Bearer plnm-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### De onde vem o token

O token é armazenado na tabela interna `tenants` (SQLite local do microserviço). Cada tenant possui:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INTEGER | ID auto-incremento |
| `name` | TEXT | Nome do tenant (ex: "Plenum") |
| `token` | TEXT | Token único para autenticação — formato `plnm-{hash}` |
| `supabase_url` | TEXT | URL do projeto Supabase do tenant |
| `supabase_key` | TEXT | **Service Role Key** do Supabase do tenant |
| `storage_bucket` | TEXT | Bucket do Supabase Storage (default: `pdfs`) |
| `storage_folder` | TEXT | Pasta dentro do bucket (default: `generated`) |
| `active` | INTEGER | 1 = ativo, 0 = revogado |
| `created_at` | TEXT | Data de criação |

### Como configurar no frontend

O token de API deve ser armazenado como **secret/variável de ambiente** no sistema que fará a chamada. **Nunca expor no client-side.**

```env
PDF_GENERATOR_API_URL=http://localhost:3000
PDF_GENERATOR_API_TOKEN=plnm-621e4b511104b6c63ccd6b3f5d2d178e
```

> **IMPORTANTE:** A `supabase_key` dentro do tenant é a **Service Role Key** do Supabase. Ela é configurada uma vez no microserviço e nunca é exposta na API. O frontend só precisa do `token` do tenant para autenticar.

### Respostas de erro de autenticação

| Status | Código | Mensagem |
|--------|--------|----------|
| 401 | `UNAUTHORIZED` | Token de autenticação ausente ou mal formatado |
| 403 | `FORBIDDEN` | Tenant inativo |

---

## 3. Endpoint: Gerar PDF

### Request

```
POST /api/v1/generate-pdf
Content-Type: application/json
Authorization: Bearer {token}
```

### Body

```json
{
  "edition_id": "uuid-da-edicao",
  "template": "plenum-curso-v1",
  "section_overrides": { ... }
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `edition_id` | `string (UUID)` | Sim | ID da edição na tabela `course_dates` |
| `template` | `string` | Nao (default: `plenum-curso-v1`) | Template a usar. Atualmente apenas `plenum-curso-v1` |
| `section_overrides` | `object` | Nao | Ajustes visuais por seção (ver seção 6) |

### Response (200 OK)

```json
{
  "success": true,
  "pdf_url": "https://xxx.supabase.co/storage/v1/object/public/pdfs/generated/slug-uuid-timestamp.pdf",
  "generated_at": "2026-04-15T04:30:00.000Z",
  "edition_id": "uuid-da-edicao"
}
```

### Debug mode

Adicione `?debug=true` na URL para receber o HTML renderizado em vez do PDF:

```
POST /api/v1/generate-pdf?debug=true
```

Retorna `text/html` direto — util para inspecionar o layout no navegador.

### Erros possíveis

| Status | Código | Quando |
|--------|--------|--------|
| 400 | `INVALID_BODY` | Body JSON inválido ou campos faltando |
| 400 | `UNSUPPORTED_TEMPLATE` | Template diferente de `plenum-curso-v1` |
| 404 | `NOT_FOUND` | Edição, curso ou design system não encontrado |
| 422 | `INVALID_INSTRUCTOR_COUNT` | 0 instrutores ou mais de 3 |
| 500 | `DATABASE_ERROR` | Erro na query ao Supabase |
| 500 | `RENDER_ERROR` | Erro ao gerar PDF com Playwright |
| 500 | `STORAGE_ERROR` | Erro ao fazer upload no Supabase Storage |

---

## 4. Tabelas do Supabase (Banco de Dados)

O microserviço consulta 4 tabelas do Supabase para montar o PDF. Abaixo a documentação completa de cada uma.

### 4.1 `course_dates` (Edições)

A edição é o ponto de entrada — o `edition_id` enviado na API corresponde ao `id` desta tabela.

| Campo no banco | Tipo | Obrigatório | Nome no front | Descrição |
|----------------|------|-------------|---------------|-----------|
| `id` | UUID | Auto | — | Identificador único da edição |
| `course_id` | UUID | Sim | | FK para a tabela `courses` |
| `start_date` | TEXT (date) | Sim | | Data de início (formato ISO) |
| `end_date` | TEXT (date) | Sim | | Data de término (formato ISO) |
| `label` | TEXT | Sim | | Label da data exibida no PDF (ex: "18 e 19 de Agosto de 2025") |
| `location_venue` | TEXT | Sim | | Nome do local (ex: "Brasília - Centro de Convenções") |
| `location_address` | TEXT | Sim | | Endereço completo |
| `program_days` | JSONB | Sim | | Programação por dia (ver estrutura abaixo) |
| `instructor_ids` | UUID[] | Sim | | Array de IDs dos instrutores desta edição |
| `folder_pdf_url` | TEXT (nullable) | Nao | — | URL do PDF gerado (preenchida automaticamente pelo microserviço) |

**Estrutura de `program_days`:**

```json
[
  {
    "tag": "Dia 1 — Terça, 18/08",
    "time": "14:00 às 17:00",
    "title": "Fundamentos e Legislação",
    "topics": [
      {
        "text": "Introdução ao tema",
        "children": [
          { "text": "Subtópico A", "children": [] },
          { "text": "Subtópico B", "children": [] }
        ]
      }
    ],
    "description": "Texto alternativo quando não há tópicos"
  }
]
```

> **Nota:** Se o campo `time` estiver vazio, o sistema tenta extrair o horário do campo `tag` automaticamente (ex: `"Dia 1 · 14:00 às 17:00"` → separa tag e time).

> **Nota:** Se `topics` tiver itens, o dia é renderizado como **lista de tópicos** (`kind: bullets`). Se estiver vazio, usa o campo `description` como **parágrafo** (`kind: paragraph`).

### 4.2 `courses` (Cursos)

| Campo no banco | Tipo | Obrigatório | Nome no front | Descrição |
|----------------|------|-------------|---------------|-----------|
| `id` | UUID | Auto | — | Identificador único do curso |
| `slug` | TEXT | Sim | | Slug para URLs e nome do arquivo PDF |
| `title` | TEXT | Sim | | Título principal exibido na capa |
| `subtitle` | TEXT | Sim | | Subtítulo exibido abaixo do título na capa |
| `category_label` | TEXT | Sim | | Badge/etiqueta de categoria (ex: "Curso Presencial") |
| `design_system_id` | UUID | Sim | | FK para `design_systems` |
| `about_heading` | TEXT | Sim | | Título da seção "Sobre o Curso" |
| `about_subheading` | TEXT (nullable) | Nao | | Subtítulo da seção "Sobre o Curso" |
| `about_cards` | JSONB | Sim | | Cards da seção "Sobre o Curso" (ver abaixo) |
| `audience_heading` | TEXT | Sim | | Título da seção "Público-Alvo" |
| `audience_cards` | JSONB | Sim | | Cards da seção "Público-Alvo" (ver abaixo) |
| `program_heading` | TEXT | Sim | | Título da seção "Programação" |
| `program_description` | TEXT (nullable) | Nao | | Descrição geral da programação |
| `investment_heading` | TEXT | Sim | | Título da seção "Investimento" |
| `investment_subtitle` | TEXT (nullable) | Nao | | Subtítulo da seção "Investimento" |
| `included_items` | JSONB | Sim | | Itens inclusos no investimento (ver abaixo) |

**Estrutura de `about_cards`:**

```json
[
  {
    "icon": "ShieldCheck",
    "title": "Título do card",
    "description": "Descrição detalhada do card"
  }
]
```

**Estrutura de `audience_cards`:**

```json
[
  {
    "icon": "Users",
    "title": "Gestores Públicos",
    "description": "Descrição opcional"
  }
]
```

**Estrutura de `included_items`:**

```json
[
  {
    "icon": "BookOpen",
    "text": "Material didático completo"
  }
]
```

**Ícones disponíveis:** `ShieldCheck`, `Eye`, `FileCheck`, `Scale`, `BookOpen`, `Users`, `Landmark`, `FileSpreadsheet`, `Shield`, `User`, `Briefcase`, `MapPin`, `CalendarDays`, `Clock`, `CheckCircle2`, `Building2`, `Award`, `Phone`, `Mail`, `Globe`, `Star`. Qualquer outro valor exibe um ícone padrão (HelpCircle).

### 4.3 `instructors` (Instrutores)

| Campo no banco | Tipo | Obrigatório | Nome no front | Descrição |
|----------------|------|-------------|---------------|-----------|
| `id` | UUID | Auto | — | Identificador único |
| `name` | TEXT | Sim | | Nome completo do instrutor |
| `role` | TEXT | Sim | | Cargo/título profissional |
| `bio` | TEXT | Sim | | Biografia completa (texto corrido) |
| `photo_url` | TEXT (nullable) | Nao | | URL pública da foto do instrutor |
| `status` | TEXT | Sim | | `active` ou `inactive` — apenas ativos são incluídos |

> **Regras:**
> - Mínimo 1 instrutor ativo por edição
> - Máximo 3 instrutores por edição
> - 1 instrutor → layout `single-speaker` (card grande)
> - 2-3 instrutores → layout `multi-speaker` (cards compactos)
> - A foto do instrutor é exibida com efeito de "estouro" para cima do card (55mm x 70mm, sobe 15mm acima do card)

### 4.4 `design_systems` (Design System / Identidade Visual)

| Campo no banco | Tipo | Obrigatório | Nome no front | Descrição |
|----------------|------|-------------|---------------|-----------|
| `id` | UUID | Auto | — | Identificador único |
| `name` | TEXT | Sim | | Nome do tema (ex: "Azul Original", "Verde Esmeralda") |
| `color_primary` | TEXT (hex) | Sim | | Cor primária — botões, destaques (ex: `#1e40af`) |
| `color_primary_hover` | TEXT (hex) | Sim | | Cor primária hover (ex: `#2563eb`) |
| `color_primary_light` | TEXT (hex) | Sim | | Cor primária clara — labels, ícones (ex: `#3b82f6`) |
| `color_background` | TEXT (hex) | Sim | | Cor de fundo principal |
| `color_background_alt` | TEXT (hex) | Sim | | Cor de fundo alternativa |
| `color_background_deep` | TEXT (hex) | Sim | | Cor de fundo profunda — capa e páginas escuras |
| `color_surface` | TEXT (hex) | Sim | | Cor de superfície — cards |
| `color_surface_alt` | TEXT (hex) | Sim | | Cor de superfície alternativa |
| `color_accent` | TEXT (hex) | Sim | | Cor de destaque/acento |
| `font_heading` | TEXT | Sim | | Família tipográfica dos títulos (ex: "Bricolage Grotesque") |
| `font_body` | TEXT | Sim | | Família tipográfica do corpo (ex: "Inter") |
| `font_heading_weights` | INT[] | Sim | | Pesos de fonte para títulos (ex: `[400, 600, 700, 800]`) |
| `font_body_weights` | INT[] | Sim | | Pesos de fonte para corpo (ex: `[400, 500, 600]`) |
| `hero_frames_path` | TEXT (nullable) | Nao | | URL base dos frames da imagem hero da capa |
| `hero_frame_ext` | TEXT (nullable) | Nao | | Extensão dos frames (ex: `.jpg`) |
| `hero_frame_count` | INT (nullable) | Nao | | Quantidade total de frames disponíveis |

> **Imagem Hero da Capa:** Se `hero_frames_path` e `hero_frame_ext` estiverem preenchidos, o sistema monta a URL do primeiro frame concatenando: `{hero_frames_path}0001{hero_frame_ext}`. Exemplo:
> ```
> hero_frames_path: "https://xxx.supabase.co/storage/v1/object/public/course-covers/frames/curso-abc/frame_"
> hero_frame_ext: ".jpg"
> → URL final: "https://xxx.supabase.co/storage/v1/object/public/course-covers/frames/curso-abc/frame_0001.jpg"
> ```

> **Formato das cores:** Todas as cores devem ser hexadecimais com 6 dígitos, incluindo `#` (ex: `#1e40af`). Validação: `/^#[0-9a-fA-F]{6}$/`

---

## 5. Relação entre as Tabelas

```
design_systems
      │
      │ design_system_id
      ▼
  courses ──────────────── course_dates (edições)
                                │
                                │ instructor_ids[]
                                ▼
                           instructors
```

**Fluxo de lookup:**
1. Recebe `edition_id` (UUID de `course_dates`)
2. Busca a edição → obtém `course_id`
3. Busca o curso → obtém `design_system_id`
4. Busca o design system
5. Busca os instrutores pelo array `instructor_ids` da edição (filtra `status = 'active'`)

---

## 6. Section Overrides (Ajustes Visuais)

Os overrides permitem ajustar o layout do PDF sem alterar os dados no banco. São enviados no body da requisição como `section_overrides`.

> **Todos os valores são strings numéricas.** O sistema soma o valor do override ao valor base. Exemplo: se o ícone base tem 18px e você envia `"icon_size": "32"`, o resultado será `18 + 32 = 50px`.

### 6.1 Seção "Sobre o Curso" (`about`)

| Campo do override | Tipo | Valor base | Nome no front | Descrição |
|--------------------|------|------------|---------------|-----------|
| `margin_top` | string (mm) | `10mm` | | Margem superior da página |
| `margin_bottom` | string (mm) | `3mm` | | Gap entre os cards |
| `margin_lateral` | string (mm) | `18mm` | | Margem esquerda e direita da página |
| `icon_size` | string (delta) | `18` | | Incremento no tamanho do ícone dos cards |
| `scale` | string (delta) | `0` | | Incremento no tamanho das fontes (título, subtítulo, descrição dos cards) |

### 6.2 Seção "Público-Alvo / Capacitação" (`audience`)

| Campo do override | Tipo | Valor base | Nome no front | Descrição |
|--------------------|------|------------|---------------|-----------|
| `margin_top` | string (mm) | `10mm` | | Margem superior da página |
| `card_margin_bottom` | string (mm) | `2mm` | | Espaçamento vertical entre os cards |
| `card_padding_vertical` | string (mm) | `2.5mm` | | Padding vertical interno de cada card |
| `card_font_size` | string (delta) | `13pt` | | Incremento no tamanho da fonte dos cards |
| `icon_size` | string (delta) | `16` | | Incremento no tamanho do ícone dos cards |

### 6.3 Seção "Programação" (`program`)

| Campo do override | Tipo | Valor base | Nome no front | Descrição |
|--------------------|------|------------|---------------|-----------|
| `day_margin_top` | string (mm) | `0mm` | | Margem superior de cada bloco de dia |

### 6.4 Seção "Palestrantes" (`speakers`)

| Campo do override | Tipo | Valor base | Nome no front | Descrição |
|--------------------|------|------------|---------------|-----------|
| `margin_top` | string (mm) | `0mm` | | Margem superior dos cards de palestrante |
| `force_compact` | string (`"true"`) | — | | Forçar layout compacto (multi-speaker) mesmo com 1 instrutor |
| `scale` | string (delta) | `0` | | Incremento no tamanho da foto e fontes |

### Exemplo de chamada com overrides

```json
{
  "edition_id": "17ae4086-245a-48f1-acca-83d88b23638d",
  "section_overrides": {
    "about": {
      "icon_size": "32",
      "scale": "1",
      "margin_top": "10",
      "margin_lateral": "0"
    },
    "audience": {
      "icon_size": "34",
      "margin_top": "10",
      "card_margin_bottom": "4"
    },
    "speakers": {
      "scale": "2"
    }
  }
}
```

---

## 7. Exemplo Completo de Integração

### 7.1 Variáveis de ambiente (frontend/backend que consome a API)

```env
# URL do microserviço de PDF
PDF_GENERATOR_URL=https://pdf-generator.seudominio.com

# Token de autenticação — DEVE ser armazenado como SECRET
# Este token é gerado pelo microserviço e identifica o tenant
PDF_GENERATOR_TOKEN=plnm-621e4b511104b6c63ccd6b3f5d2d178e
```

> **IMPORTANTE:** O token (`PDF_GENERATOR_TOKEN`) deve ser armazenado como **secret** no Supabase (Edge Functions Secrets, Vault, ou equivalente). Nunca hardcoded no frontend. A chamada à API do PDF Generator deve ser feita **server-side** (Edge Function, API Route, etc).

### 7.2 Chamada via Edge Function (Supabase)

```typescript
// supabase/functions/generate-pdf/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { edition_id, section_overrides } = await req.json()

  const response = await fetch(`${Deno.env.get('PDF_GENERATOR_URL')}/api/v1/generate-pdf`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('PDF_GENERATOR_TOKEN')}`,
    },
    body: JSON.stringify({
      edition_id,
      section_overrides,
    }),
  })

  const result = await response.json()

  if (!response.ok) {
    return new Response(JSON.stringify(result), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // result.pdf_url contém a URL pública do PDF gerado
  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

### 7.3 Chamada via cURL

```bash
curl -X POST https://pdf-generator.seudominio.com/api/v1/generate-pdf \
  -H "Authorization: Bearer plnm-621e4b511104b6c63ccd6b3f5d2d178e" \
  -H "Content-Type: application/json" \
  -d '{
    "edition_id": "6f026dc0-4446-4caa-934e-65bd3a9e294a"
  }'
```

---

## 8. Pipeline Interno do Microserviço

Para referência de quem for dar manutenção ou debugar:

```
1. POST /api/v1/generate-pdf
   │
   ├─ Auth middleware: valida Bearer token contra tenants.db (SQLite)
   ├─ Body validation: Zod schema
   │
   ├─ loadCourseData(supabase, edition_id)
   │   ├─ SELECT * FROM course_dates WHERE id = $1
   │   ├─ SELECT * FROM courses WHERE id = $course_id
   │   ├─ SELECT * FROM instructors WHERE id IN ($ids) AND status = 'active'
   │   └─ SELECT * FROM design_systems WHERE id = $design_system_id
   │
   ├─ buildViewModel(courseData, editionId, sectionOverrides)
   │   ├─ Normaliza program_days (extrai time do tag se necessário)
   │   ├─ Resolve caminhos de assets locais (file://)
   │   ├─ Carrega depoimentos.json
   │   ├─ Monta coverFrameUrl a partir do design_system
   │   └─ Determina layoutVariant (single/multi-speaker)
   │
   ├─ renderHtml(viewModel)
   │   ├─ Lê template.css
   │   ├─ Gera CSS variables (:root) a partir do design system
   │   └─ React.renderToStaticMarkup → HTML completo
   │
   ├─ [Se ?debug=true] → Retorna HTML e para aqui
   │
   ├─ renderPdf(html)
   │   ├─ Salva HTML temporário em ./output/tmp/
   │   ├─ Chromium headless (Playwright)
   │   ├─ Aguarda fonts carregarem
   │   └─ page.pdf({ format: 'A4', printBackground: true })
   │
   ├─ Salva PDF local: ./output/{slug}-{editionId}-{timestamp}.pdf
   │
   ├─ uploadPdf → Supabase Storage: {bucket}/{folder}/{filename}
   │
   ├─ updateFolderPdfUrl → UPDATE course_dates SET folder_pdf_url = $url
   │
   └─ Response: { success, pdf_url, generated_at, edition_id }
```

---

## 9. Estrutura de Páginas do PDF

### Layout Single-Speaker (1 instrutor)

| Página | Conteúdo |
|--------|----------|
| 1 | **Capa** — Hero image, logo, título, subtítulo, badge categoria, 3 cards info (local, modalidade, data) |
| 2 | **Sobre o Curso** — Heading, subheading, grid de cards com ícones |
| 3 | **Público-Alvo** — Heading, lista de cards + info de local e data |
| 4+ | **Programação** — Fundo branco, dias com tópicos ou parágrafos (quebra natural) |
| N | **Palestrante** — Card grande com foto (55x70mm, estoura 15mm acima) + Somos Referência + Parceiros |
| N+1 | **Garanta sua Vaga** + Depoimentos + Contato |

### Layout Multi-Speaker (2-3 instrutores)

| Página | Conteúdo |
|--------|----------|
| 1 | **Capa** |
| 2 | **Sobre o Curso** |
| 3 | **Público-Alvo** |
| 4+ | **Programação** |
| N | **Palestrantes** — Página inteira com cards compactos (foto 55x70mm, estoura 15mm acima) |
| N+1 | **Somos Referência** + Garanta sua Vaga |
| N+2 | **Depoimentos** + Parceiros + Contato |

---

## 10. Resumo de Segurança

| Item | Detalhe |
|------|---------|
| Autenticação | Bearer token por tenant (SQLite local) |
| Supabase Key | Service Role Key armazenada no tenant — nunca exposta na API |
| Token do PDF Generator | Deve ser armazenado como **secret** no sistema que consome (ex: Supabase Vault/Secrets) |
| Chamada à API | Sempre **server-side** — nunca do browser do usuário |
| CORS | Habilitado em desenvolvimento (`origin: true`), configurar em produção |
| Upload | PDF vai para Supabase Storage com `upsert: true` |
| URL do PDF | URL pública do Supabase Storage — acessível por qualquer pessoa com o link |
