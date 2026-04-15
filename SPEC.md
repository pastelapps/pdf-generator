# SPEC — pdf-generator (Sessão 1)

> **Documento canônico da Sessão 1**: scaffolding e pipeline end-to-end funcional do microserviço `pdf-generator`. Este arquivo é a fonte da verdade para todas as decisões arquiteturais, fluxos de dados, estrutura de pastas, e critérios de aceitação da primeira sessão de construção.

---

## 1. Contexto do projeto

Este repositório é um microserviço chamado `pdf-generator` — um motor de geração de folders PDF a partir de dados dinâmicos vindos de um banco Supabase. O primeiro cliente desse motor é o **Instituto Plenum Brasil**, uma empresa que vende cursos e capacitações de alto valor pra gestores públicos (prefeitos, ministros, vereadores, secretários), e precisa que cada curso tenha um folder PDF de qualidade profissional pra enviar pra clientes e divulgar eventos.

Hoje a Plenum já tem um gerador de folders feito em Next.js que renderiza PDFs no front-end, mas ele tem problemas sérios de reflow de layout quando o conteúdo varia de tamanho (alguns cursos têm ementas com 3 bullets, outros com 20), quebras de página feias, e fidelidade visual baixa. Esse projeto substitui aquele gerador por uma solução robusta: um microserviço Node.js + Playwright rodando em Docker, que recebe um ID de edição de curso via HTTP, busca os dados no Supabase, renderiza um HTML template com React, e usa Chromium headless pra gerar um PDF de qualidade editorial.

A arquitetura é **multi-tenant por template**: esse projeto é pensado pra, no futuro, servir várias empresas diferentes (cada uma com seu template visual único), mas começa servindo só a Plenum com o template `plenum-curso-v1`. Cada template é um "aplicativo visual" isolado dentro de uma pasta própria, compartilhando apenas o motor de renderização (Fastify + Playwright + Supabase client).

O projeto roda localmente no Mac do desenvolvedor via `docker compose up` durante toda a fase de desenvolvimento, e só depois (em outra sessão, que não é essa) vai ser deployado numa VPS Contabo junto com outros serviços do desenvolvedor (n8n, Whisper). **Nada nessa sessão deve tocar em infra de produção.**

---

## 2. Objetivo da Sessão 1

Ao final dessa sessão, o desenvolvedor precisa conseguir:

1. Rodar `docker compose up` no Mac e ver o serviço subir sem erros
2. Fazer `curl http://localhost:3000/health` e receber 200 OK
3. Fazer `curl -X POST http://localhost:3000/api/v1/generate-pdf -H "Content-Type: application/json" -d '{"edition_id":"<UUID-REAL>"}'` e receber 200 com uma URL de PDF
4. Ver o PDF gerado salvo em `./output/` localmente
5. Ver o mesmo PDF salvo no Supabase Storage (bucket `pdfs`, pasta `generated/`)
6. Ver o campo `folder_pdf_url` da tabela `course_dates` atualizado com a URL do PDF
7. Abrir o PDF e ver **todas as seções do folder renderizadas** (capa, sobre, programação, palestrantes, kit, depoimentos, contato) — **mesmo que o visual esteja feio, sem refino tipográfico, com cores cruas**.

O polimento visual é trabalho de outra sessão. Nesta sessão, o critério é "pipeline end-to-end funcional com conteúdo correto".

---

## 3. Arquitetura de alto nível

O pipeline de uma request é:

```
POST /api/v1/generate-pdf { edition_id }
         ↓
Fastify handler valida o body
         ↓
Supabase client busca (em paralelo quando possível):
  1. course_dates pelo edition_id
  2. courses pelo course_id obtido
  3. design_systems pelo design_system_id obtido
  4. instructors pelos IDs em instructor_ids (array)
         ↓
Cada payload é validado contra um schema Zod
         ↓
ViewModel builder consolida tudo num objeto tipado pro template
         ↓
React renderToStaticMarkup renderiza <PlenumCursoV1Template data={viewModel}/>
         ↓
Wrapper adiciona <!DOCTYPE html>, CSS inline, fonts locais, CSS vars do design system
         ↓
HTML é salvo em ./output/tmp/{edition_id}-{timestamp}.html
         ↓
Playwright abre file://.../output/tmp/....html
         ↓
Aguarda networkidle + document.fonts.ready
         ↓
page.pdf({ format: 'A4', printBackground: true })
         ↓
Buffer binário salvo em ./output/{slug}-{edition_id}-{timestamp}.pdf
         ↓
Upload do PDF pro Supabase Storage (bucket 'pdfs', path 'generated/{filename}')
         ↓
UPDATE course_dates SET folder_pdf_url = '<url>' WHERE id = edition_id
         ↓
Response 200 { success: true, pdf_url, generated_at }
```

---

## 4. Modelo de dados

O banco Supabase tem **4 tabelas relevantes** pro gerador. **IMPORTANTE**: use o MCP do Supabase (configurado no ambiente do Claude Code) pra explorar o schema real das tabelas e validar nomes exatos de colunas antes de escrever os schemas Zod. A documentação abaixo é baseada em registros de exemplo e pode ter imprecisões de nomenclatura. A fonte da verdade é o banco real.

### 4.1 Tabela `courses`

Guarda os **dados genéricos e estáveis** de um curso — coisas que não mudam entre diferentes edições/turmas do mesmo curso. Aqui vive a identidade do curso: título, subtítulo, ementa conceitual, público-alvo, categoria.

Campos **relevantes pro gerador**:

- `id` (UUID, PK)
- `slug` (string, usado pra nomear arquivos)
- `title` (string, título principal do curso)
- `subtitle` (string)
- `category_label` (string tipo "Imersão" / "Capacitação" / "Intensivo")
- `design_system_id` (UUID, FK pra tabela `design_systems`)
- `about_heading` (string, título da seção "Sobre o Curso")
- `about_subheading` (string, subtítulo da seção)
- `about_cards` (JSON array: `[{icon, title, description}]` — cards da página "Sobre")
- `audience_heading` (string, título da seção "Para quem é?")
- `audience_cards` (JSON array: `[{icon, title, description?}]`)
- `program_heading` (string, ex: "Programação")
- `program_description` (string opcional)
- `investment_heading` (string, ex: "Garanta sua Vaga")
- `investment_subtitle` (string opcional)
- `included_items` (JSON array: `[{icon, text}]` — lista do "O que está incluso")

Campos que o gerador deve **IGNORAR COMPLETAMENTE** (são pra LP do site, não pro PDF):

- `testimonials` (o PDF usa depoimentos FIXOS do arquivo `assets/depoimentos.json`, nunca os do banco)
- `partner_logos` (o PDF usa a imagem FIXA `assets/instituicoes.png`, nunca os logos do banco)
- `audience_images` (só aparecem na LP)
- `background_image_url`, `section_backgrounds` (PDF usa o design system)
- `hero_video_url`, `hero_frames_path`, `hero_frame_count`, `hero_frame_ext` (animação da LP)
- `cover_image_url`, `product_image_url`, `og_image_url` (metadados do site)
- `meta_title`, `meta_description` (SEO)
- `whatsapp_number`, `whatsapp_message`
- `modality`, `status`
- `title_parts`, `hero_badges` (campos legados, o gerador deriva os badges da edição)
- `relevance_paragraphs`, `general_info_items` (conteúdo auxiliar da LP)
- `folder_pdf_url` na tabela `courses` (se existir — o PDF fica na tabela `course_dates`, não aqui)

### 4.2 Tabela `course_dates` (a **tabela de edições**)

Guarda os **dados específicos de uma edição/turma** do curso — coisas que mudam cada vez que o curso é oferecido: datas, local, programação detalhada, quais professores vão dar aquela edição. **É aqui que o PDF gerado é armazenado.** Um curso pode ter múltiplas edições (março, julho, novembro — cada uma com seus professores e datas), e cada uma tem seu próprio folder PDF.

Campos **relevantes pro gerador**:

- `id` (UUID, PK) — **esse é o `edition_id` que o endpoint recebe**
- `course_id` (UUID, FK pra `courses`)
- `start_date` (timestamp)
- `end_date` (timestamp)
- `label` (string legível tipo "18 a 21 de agosto de 2026")
- `location_venue` (string tipo "Sede Plenum Brasil - Brasília")
- `location_address` (string endereço completo)
- `program_days` (JSON array — estrutura rica, explicada abaixo)
- `instructor_ids` (UUID array) — array de IDs de instrutores dessa edição
- `folder_pdf_url` (string nullable) — **o campo que o gerador VAI ATUALIZAR com a URL do PDF gerado**

Campos a **IGNORAR**:

- `location_map_embed` (iframe do Google Maps, não entra no PDF)
- `location_extra`, `max_students`, `status`, `sort_order`, `created_at`

### 4.3 Estrutura do `program_days`

Este campo é o mais importante e mais complexo do gerador. Tem essa forma:

```json
[
  {
    "tag": "Dia 1 — Terça, 18/08 · 14:00 às 17:00",
    "time": "",
    "title": "Recepção institucional, credenciamento presencial e entrega de materiais",
    "topics": [],
    "description": "Período destinado à chegada dos participantes..."
  },
  {
    "tag": "Dia 2 — Quarta, 19/08",
    "time": "08:00 às 12:00",
    "title": "Módulo I — Marco Normativo...",
    "topics": [
      { "text": "Lei Anticorrupção (Lei 12.846/2013)...", "children": [] },
      { "text": "Resolução CNMP 305/2025...", "children": [] }
    ],
    "description": ""
  }
]
```

**Observações críticas que o template precisa tratar**:

- Alguns dias têm `topics` (bullets detalhados) e `description` vazio → vira card com lista de bullets
- Outros dias têm `description` (parágrafo corrido) e `topics` vazio → vira card com parágrafo
- O `tag` às vezes já contém o horário embutido ("· 14:00 às 17:00"), outras vezes o horário está separado no campo `time`. O viewmodel builder deve **normalizar**: se `time` está vazio mas o `tag` contém horário, extrair pro campo `time`; se ambos estão populados, preferir `time` e limpar do `tag`
- `topics[].children` existe na estrutura pra suportar sub-bullets, mas hoje vem sempre vazio. **O template deve renderizar recursivamente sub-bullets se vierem**, mesmo que não sejam usados hoje. Prevê o futuro sem custo.
- Os títulos de módulo podem ser **muito longos** (100+ caracteres). O CSS precisa tratar isso com `word-wrap: break-word` e tamanhos de fonte que comportem.

### 4.4 Tabela `instructors`

Guarda dados dos palestrantes. Relaciona-se com `course_dates` via o array `instructor_ids`.

Campos **relevantes**:

- `id` (UUID, PK)
- `name` (string, nome completo)
- `role` (string, cargo/título — ex: "Promotor de Justiça do MPCE")
- `bio` (string longa, bio em parágrafo)
- `photo_url` (string nullable — URL da foto do palestrante)
- `status` (string — filtrar só `active`)

Campos a **IGNORAR**: `social_links`, `created_at`, `updated_at`

**Regra de negócio crítica de layouts**:

- Se a edição tem **1 instrutor**: usar o layout `LayoutSingleSpeaker`
- Se a edição tem **2 ou 3 instrutores**: usar o layout `LayoutMultiSpeaker`
- Se a edição tem **0 instrutores**: retornar HTTP 422 com mensagem "A edição não possui instrutores cadastrados. Cadastre pelo menos um instrutor antes de gerar o folder."
- Se a edição tem **4 ou mais instrutores**: retornar HTTP 422 com mensagem "O template plenum-curso-v1 suporta no máximo 3 instrutores. Para cursos com 4+ palestrantes, o folder deve ser gerado manualmente."

### 4.5 Tabela `design_systems`

Guarda temas visuais (cores e fontes) que podem ser compartilhados entre múltiplos cursos.

Campos **relevantes**:

- `id` (UUID, PK)
- `name` (string, ex: "Azul Institucional")
- `color_primary`, `color_primary_hover`, `color_primary_light`
- `color_background`, `color_background_alt`, `color_background_deep`
- `color_surface`, `color_surface_alt`
- `color_accent`
- `font_heading` (string, ex: "PPRadioGrotesk")
- `font_body` (string, ex: "Satoshi")
- `font_heading_weights` (array de pesos)
- `font_body_weights` (array de pesos)

**AVISO IMPORTANTE sobre dados ruins**: Alguns registros de `design_systems` no banco atual têm **cores claramente erradas** (verde `#4caf50` e rosa `#af4cab` num tema chamado "Azul Institucional"). Isso é lixo de desenvolvimento que o operador vai limpar depois. **Implemente um validador de design system que**:

1. Valida o registro com Zod (estrutura correta)
2. Se detectar cores "suspeitas" (tipo verdes saturados ou rosas em tema chamado "azul"), logar um warning estruturado mas **renderizar fielmente mesmo assim**
3. Não filtre nem corrija silenciosamente — só alerte no log

O gerador deve ser **fiel ao banco**. Responsabilidade de limpar dados é da Plenum, não do gerador.

### 4.6 Regra geral sobre campos do banco

Se encontrar qualquer campo do banco que não estiver listado aqui como "relevante", **ignore**. Não tente ser útil usando campos extras sem confirmar. Campos suspeitos incluem qualquer coisa relacionada a: LP, SEO, marketing, vídeos, analytics, WhatsApp, redes sociais.

---

## 5. Stack técnico

Use **exatamente** essas versões e ferramentas (decisões já tomadas, não questione):

- **Runtime**: Node.js 20 LTS
- **Linguagem**: TypeScript 5+, modo strict, ES2022 target
- **HTTP server**: Fastify 4+
- **Validação**: Zod 3+
- **Banco**: Supabase via `@supabase/supabase-js` 2+
- **Renderização HTML**: React 18 (só server-side, `renderToStaticMarkup` de `react-dom/server`)
- **PDF engine**: Playwright 1.49+
- **Container base**: `mcr.microsoft.com/playwright:v1.49.0-jammy`
- **Hot reload em dev**: `tsx watch`
- **Logger**: `pino` (já incluso no Fastify)
- **Env loader**: `dotenv`
- **Package manager**: `npm` (não yarn nem pnpm)

**NÃO use**:

- `puppeteer` (use Playwright)
- `@react-pdf/renderer` (abordagem errada pro nosso caso)
- Next.js (não é app web, é microserviço)
- ORM (Prisma, Drizzle, TypeORM) — o Supabase client já é suficiente
- Build tools complexos (Vite, Webpack, etc.) — só `tsc` e pronto
- `ts-node` — use `tsx` que é mais moderno

---

## 6. Variáveis de ambiente

Variáveis esperadas no `.env.local`:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET` (default: `pdfs`)
- `SUPABASE_STORAGE_FOLDER` (default: `generated`)
- `PORT` (default: `3000`)
- `NODE_ENV` (default: `development`)
- `LOG_LEVEL` (default: `info`)

---

## 7. Estrutura de pastas

```
pdf-generator/
├── .dockerignore
├── .env.example
├── .env.local                 (criado manualmente pelo dev, NÃO versionado)
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
├── README.md
├── SPEC.md                    (este arquivo)
│
├── assets/                    (JÁ EXISTE, NÃO MODIFICAR)
│   ├── logo-colorido.png      (capa)
│   ├── logo-branco.png        (páginas internas)
│   ├── kit-participante.png
│   ├── instituicoes.png
│   ├── evento-1.png
│   ├── evento-2.png
│   ├── evento-3.png
│   ├── evento-4.png
│   ├── evento-5.png
│   ├── anastasia.png
│   ├── zymler.png
│   ├── velloso.png
│   ├── jarbas.png
│   └── depoimentos.json
│
├── output/                    (gitignored, criado em runtime)
│   ├── .gitkeep
│   └── tmp/
│       └── .gitkeep
│
├── src/
│   ├── server.ts              (Fastify app + rotas)
│   ├── config.ts              (dotenv + validação Zod do env)
│   ├── logger.ts              (pino configurado)
│   │
│   ├── clients/
│   │   └── supabase.ts        (cliente Supabase tipado)
│   │
│   ├── schemas/
│   │   ├── course.ts          (Zod do Course)
│   │   ├── course-date.ts     (Zod do CourseDate, inclui program_days)
│   │   ├── instructor.ts      (Zod do Instructor)
│   │   ├── design-system.ts   (Zod do DesignSystem)
│   │   └── view-model.ts      (Zod do ViewModel consolidado)
│   │
│   ├── services/
│   │   ├── course-loader.ts   (busca e valida todos os dados do Supabase)
│   │   ├── view-model-builder.ts  (consolida dados num ViewModel)
│   │   ├── html-renderer.ts   (renderToStaticMarkup + wrapper HTML)
│   │   ├── pdf-renderer.ts    (Playwright: HTML → PDF)
│   │   ├── storage.ts         (upload pro Supabase Storage)
│   │   └── course-updater.ts  (UPDATE folder_pdf_url)
│   │
│   ├── routes/
│   │   ├── health.ts          (GET /health)
│   │   └── generate-pdf.ts    (POST /api/v1/generate-pdf)
│   │
│   └── utils/
│       ├── asset-resolver.ts  (resolve paths absolutos de assets/)
│       ├── errors.ts          (classes de erro custom + handlers)
│       └── program-normalizer.ts  (normaliza program_days)
│
└── templates/
    └── plenum-curso-v1/
        ├── config.ts          (metadados do template)
        ├── Template.tsx       (componente raiz, decide layout)
        │
        ├── layouts/
        │   ├── LayoutSingleSpeaker.tsx
        │   └── LayoutMultiSpeaker.tsx
        │
        ├── sections/
        │   ├── Cover.tsx
        │   ├── AboutAndAudience.tsx
        │   ├── Program.tsx
        │   ├── SpeakerCardLarge.tsx
        │   ├── SpeakerCardCompact.tsx
        │   ├── GarantaVaga.tsx
        │   ├── SomosReferencia.tsx
        │   ├── Depoimentos.tsx
        │   ├── Parceiros.tsx
        │   ├── Contato.tsx
        │   └── PageHeader.tsx
        │
        ├── components/
        │   ├── Icon.tsx           (Lucide wrapper)
        │   ├── Badge.tsx
        │   └── ProgramDay.tsx     (renderiza um dia da programação)
        │
        ├── styles/
        │   └── template.css       (CSS consolidado com vars do design system)
        │
        └── static-data/
            └── depoimentos.ts     (re-export tipado do JSON de assets/)
```

---

## 8. Fases de implementação

A sessão é dividida em **8 fases sequenciais**. Depois de cada fase, **pare, resuma o que foi feito, e aguarde confirmação do dev antes de prosseguir**. Isso é essencial pra revisão incremental.

### Fase 1 — Scaffolding inicial e configuração

Crie `package.json` com todas as dependências listadas na stack, scripts pra `dev`, `build`, `start`. Crie `tsconfig.json` strict ES2022. Crie `.gitignore` ignorando `node_modules`, `output/*` (exceto `.gitkeep`), `.env.local`, `dist/`. Crie `.dockerignore`. Crie `.env.example` com todas as variáveis documentadas (sem valores reais). Crie `README.md` com instruções mínimas de como rodar o projeto (`docker compose up`). Implemente `src/config.ts` que carrega `.env.local` via dotenv e valida com Zod.

**Critério de aceitação**: Os arquivos de configuração existem, `npm install` roda sem erro (quando o dev executar no container depois), e `src/config.ts` valida o env com Zod.

**PARE AQUI E RESUMA PRO DEV ANTES DA FASE 2.**

### Fase 2 — Docker e servidor Fastify básico

Crie o `Dockerfile` usando `mcr.microsoft.com/playwright:v1.49.0-jammy` como base. Instala dependências, copia o código, expõe porta 3000, comando de start usa `tsx watch src/server.ts` pra ter hot reload em dev. Crie o `docker-compose.yml` com um único serviço `pdf-generator`, build do Dockerfile local, volume montando o código fonte pra hot reload, volume separado pra `node_modules`, volume pra `output/`, carrega `.env.local`, expõe porta 3000.

Implemente `src/server.ts` com Fastify, CORS permissivo em dev, logger pino, graceful shutdown no SIGTERM, e apenas a rota `/health` funcionando (retorna `{ status: 'ok', timestamp: ISO }`). Implemente `src/logger.ts` configurando pino com pretty print em dev.

Implemente `src/routes/health.ts` com o handler simples. No boot do servidor, logue claramente em que porta tá rodando e qual é o NODE_ENV.

**Critério de aceitação**: O dev roda `docker compose up`, vê o servidor subindo, faz `curl http://localhost:3000/health` e recebe `{ status: 'ok', timestamp: '...' }` com status 200.

**PARE AQUI E RESUMA PRO DEV ANTES DA FASE 3.**

### Fase 3 — Supabase client e exploração do schema real

**IMPORTANTE**: Antes de escrever os schemas Zod das tabelas, **use o MCP do Supabase** (que já está configurado no ambiente do Claude Code) pra explorar o schema real das 4 tabelas. Confirme nomes exatos de colunas, tipos, nullables. A documentação deste SPEC pode ter imprecisões. A fonte da verdade é o banco real.

Depois de explorar o schema, implemente:

- `src/clients/supabase.ts` — cliente Supabase tipado, usando `createClient` com a service role key (bypassa RLS)
- `src/schemas/course.ts` — Zod schema do `Course` com `.passthrough()` pra aceitar campos extras
- `src/schemas/course-date.ts` — Zod do `CourseDate` incluindo schema aninhado do `program_days`. O `program_days` pode vir como string JSON ou JSON nativo — trate os dois casos com `z.preprocess` se necessário.
- `src/schemas/instructor.ts` — Zod do `Instructor`, filtrando só `status === 'active'`
- `src/schemas/design-system.ts` — Zod do `DesignSystem` com validação das cores (hex válido) e fontes
- `src/services/course-loader.ts` — função `loadCourseData(editionId)` que busca todas as 4 entidades e valida

Crie classes de erro em `src/utils/errors.ts`:

- `NotFoundError` (404)
- `ValidationError` (422)
- `DatabaseError` (500)
- `InvalidInstructorCountError` (422) — pra casos de 0 ou 4+ instrutores
- `RenderError` (500) — pra falhas de Playwright
- `StorageError` (500) — pra falhas de upload

Cada erro deve ter `statusCode`, `code` (string tipo `EDITION_NOT_FOUND`), `message`, e opcionalmente `details`. Registre um error handler global no Fastify que captura essas classes e retorna JSON estruturado.

**Critério de aceitação**: Existe uma função `loadCourseData` que, passando um `editionId` real, retorna todos os dados validados. Crie um endpoint temporário `/debug/load/:editionId` que invoca essa função e loga o resultado. O dev vai fornecer um UUID real pra testar.

**PARE AQUI E RESUMA PRO DEV ANTES DA FASE 4. Peça o UUID de uma edição real pra testar.**

### Fase 4 — ViewModel builder e normalização

Crie `src/schemas/view-model.ts` com o tipo `ViewModel` consolidado — o formato que o template React vai consumir. Pense nesse ViewModel como a "API" entre o backend e o template. O template não deve saber nada sobre Supabase ou estrutura de banco — só consome o ViewModel.

Estrutura sugerida (adapte conforme achar melhor, mas respeite o princípio):

```typescript
type ViewModel = {
  generatedAt: Date;
  editionId: string;
  
  course: {
    title: string;
    subtitle: string;
    categoryLabel: string;
    aboutHeading: string;
    aboutSubheading: string;
    aboutCards: Array<{ icon: string; title: string; description: string }>;
    audienceHeading: string;
    audienceCards: Array<{ icon: string; title: string; description?: string }>;
    programHeading: string;
    programDescription: string;
    investmentHeading: string;
    investmentSubtitle: string;
    includedItems: Array<{ icon: string; text: string }>;
  };
  
  edition: {
    startDate: Date;
    endDate: Date;
    dateLabel: string;
    locationVenue: string;
    locationAddress: string;
    programDays: Array<{
      tag: string;
      time: string;
      title: string;
      topics: Array<{ text: string; children: Array<...> }>;
      description: string;
      kind: 'bullets' | 'paragraph';
    }>;
  };
  
  instructors: Array<{
    id: string;
    name: string;
    role: string;
    bio: string;
    photoUrl: string | null;
  }>;
  
  layoutVariant: 'single-speaker' | 'multi-speaker';
  
  designSystem: {
    colors: Record<string, string>;
    fonts: { heading: string; body: string };
  };
  
  assets: {
    logoColorido: string;
    logoBranco: string;
    kitParticipante: string;
    instituicoes: string;
    fotosEvento: string[];
    depoentes: Array<{ name: string; role: string; quote: string; photo: string }>;
  };
};
```

Implemente `src/services/view-model-builder.ts` com a função `buildViewModel(data, editionId)` que:

1. Decide o `layoutVariant` baseado em `instructors.length`. Se 0 ou 4+, joga `InvalidInstructorCountError`
2. Normaliza `program_days` (extrai horário do tag se necessário, detecta `kind`)
3. Transforma cores do design system em CSS custom properties
4. Resolve paths absolutos dos assets
5. Carrega o `depoimentos.json` de `assets/` e inclui no ViewModel

Implemente `src/utils/program-normalizer.ts` com a função `normalizeProgramDays`:

- Se `time` vazio e `tag` contém padrão `... · HH:MM às HH:MM`, extrai o horário pro `time` e remove do `tag`
- Se `topics.length > 0`, `kind = 'bullets'`. Senão, `kind = 'paragraph'`
- Garante que `topics[].children` existe (array vazio como fallback)

Implemente `src/utils/asset-resolver.ts` com funções que retornam paths absolutos.

**Critério de aceitação**: Endpoint temporário `/debug/viewmodel/:editionId` que retorna o ViewModel completo como JSON. O dev verifica visualmente se tá correto.

**PARE AQUI E RESUMA PRO DEV ANTES DA FASE 5.**

### Fase 5 — Template React e renderização HTML

**IMPORTANTE**: Nesta fase você cria os componentes React do template `plenum-curso-v1`, mas **sem preocupação com estética refinada**. O objetivo é ter todos os dados aparecendo em algum lugar, com estrutura HTML correta e CSS funcional básico. Refinamento visual é trabalho de outra sessão.

Crie `templates/plenum-curso-v1/config.ts`, `Template.tsx`, layouts, seções e componentes conforme a estrutura de pastas. Os componentes chave são:

**Layouts**:

- `LayoutSingleSpeaker.tsx` — sequência: Capa → Sobre+Público → Programação → Palestrante(meia página)+GarantaVaga(meia página)+logos → Somos referência+Depoimentos+Contato
- `LayoutMultiSpeaker.tsx` — sequência: Capa → Sobre+Público → Programação → Palestrantes(página inteira) → Somos referência+GarantaVaga → Depoimentos+parceiros+contato

**Seções** (11 arquivos): `Cover`, `AboutAndAudience`, `Program`, `SpeakerCardLarge`, `SpeakerCardCompact`, `GarantaVaga`, `SomosReferencia`, `Depoimentos`, `Parceiros`, `Contato`, `PageHeader`.

**Componentes**: `Icon` (wrapper do Lucide com map seguro), `Badge`, `ProgramDay` (renderiza um item de program_days baseado no `kind`).

**CSS** (`styles/template.css`):

- Reset mínimo
- `@page { size: A4; margin: 0 }`
- CSS custom properties na `:root` usando cores do design system
- Estilos funcionais das seções (sem polimento)
- `.page-break { break-before: page; }`
- `.avoid-break { break-inside: avoid-page; }`

**Ícones do Lucide** (map inicial): `ShieldCheck, Eye, FileCheck, Scale, BookOpen, Users, Landmark, FileSpreadsheet, Shield, User, Briefcase, MapPin, CalendarDays, Clock, CheckCircle2, HelpCircle` (fallback).

Implemente `src/services/html-renderer.ts` com a função `renderHtml(viewModel): string` que:

1. Chama `renderToStaticMarkup(<Template data={viewModel} />)`
2. Lê o CSS de `template.css` e inline dentro de `<style>`
3. Injeta as CSS custom properties do design system na `:root`
4. Monta o HTML final com DOCTYPE, `<html>`, `<head>`, `<body>`
5. Retorna a string HTML completa

**Critério de aceitação**: Endpoint temporário `/debug/html/:editionId` retorna o HTML direto no navegador. Dev abre no Chrome e verifica se todas as seções existem e todos os dados aparecem. Feio é permitido. Faltando dado não é.

**PARE AQUI E RESUMA PRO DEV ANTES DA FASE 6.**

### Fase 6 — Playwright e geração de PDF

Implemente `src/services/pdf-renderer.ts` com `renderPdf(html, options?): Promise<Buffer>`:

1. Salva HTML em arquivo temp `output/tmp/{uuid}.html`
2. Lança Chromium (`chromium.launch({ headless: true })`)
3. Abre novo contexto e página
4. Navega pra `file://${absolutePath}`
5. Aguarda `networkidle` (timeout 30s)
6. Aguarda `page.evaluate(() => document.fonts.ready)`
7. Chama `page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true })`
8. Fecha page, contexto, browser
9. Retorna Buffer
10. Limpa arquivo temp (mantém se `NODE_ENV === 'development'`)

Trate erros convertendo em `RenderError` com mensagem clara.

**NÃO implemente browser pool warm**. Cada request lança e fecha o Chromium. Otimização é pra outra sessão.

**Critério de aceitação**: Endpoint temporário `/debug/pdf/:editionId` retorna o buffer como `application/pdf`. Dev baixa o PDF e abre pra verificar.

**PARE AQUI E RESUMA PRO DEV ANTES DA FASE 7.**

### Fase 7 — Upload pro Supabase Storage e update do banco

Implemente `src/services/storage.ts` com `uploadPdf(buffer, filename): Promise<string>`:

1. Upload no bucket do env (default `pdfs`), pasta do env (default `generated`)
2. `upsert: true` pra sobrescrever se existir
3. Content-Type: `application/pdf`
4. Retorna URL pública

Filename segue padrão `{slug}-{editionId}-{timestamp}.pdf`.

Implemente `src/services/course-updater.ts` com `updateFolderPdfUrl(editionId, pdfUrl): Promise<void>`:

1. `UPDATE course_dates SET folder_pdf_url = $pdfUrl WHERE id = $editionId`
2. Se nenhuma linha afetada, lança `NotFoundError`

**Critério de aceitação**: Endpoint temporário `/debug/full/:editionId` executa o pipeline completo. Dev verifica no Supabase Dashboard que o PDF está no Storage e o `folder_pdf_url` foi atualizado.

**PARE AQUI E RESUMA PRO DEV ANTES DA FASE 8.**

### Fase 8 — Endpoint oficial e finalização

Implemente `src/routes/generate-pdf.ts` — o endpoint oficial `POST /api/v1/generate-pdf`:

- Body: `{ edition_id: string (UUID), template?: string (default "plenum-curso-v1") }`
- Valida com Zod
- Se `template !== 'plenum-curso-v1'`, retorna 400
- Executa pipeline completo
- Retorna 200 com `{ success: true, pdf_url, generated_at, edition_id }`
- Logs estruturados em cada etapa

Adicione query param `?debug=true` que retorna HTML em vez de PDF (útil pra Sessão 2).

Registre o endpoint no `src/server.ts`.

**Remova todos os endpoints `/debug/*` temporários**. Fica só `/health` e `/api/v1/generate-pdf`.

Atualize o `README.md` com instruções de setup, exemplo de `curl`, estrutura de pastas.

**Critério de aceitação final**:

1. `docker compose up` sobe o serviço limpo
2. `curl http://localhost:3000/health` → 200 OK
3. `curl -X POST http://localhost:3000/api/v1/generate-pdf -H "Content-Type: application/json" -d '{"edition_id":"<UUID>"}'` → 200 com URL
4. PDF em `./output/`
5. PDF no Supabase Storage
6. `course_dates.folder_pdf_url` atualizado
7. PDF abre, tem múltiplas páginas A4, contém todas as seções com dados
8. `edition_id` inválido → 404 claro
9. 0 ou 4+ instrutores → 422 claro
10. Logs estruturados no console

**PARE AQUI E ENTREGUE O PROJETO AO DEV PRA REVISÃO FINAL.**

---

## 9. Decisões arquiteturais importantes (NÃO mude sem confirmar)

- **IGNORE os campos `testimonials` e `partner_logos` do registro do curso.** Depoimentos vêm de `assets/depoimentos.json` (fixos institucionais). Logos vêm de `assets/instituicoes.png` (imagem única fixa).

- **NÃO implemente lógica de "padding dinâmico" ou "iteração visual" pra encaixar programação em N páginas.** Confie no `break-inside: avoid-page` do CSS. A programação vai quebrar naturalmente quantas páginas precisar.

- **NÃO tente filtrar Lorem Ipsum, typos, ou dados estranhos dos registros.** Renderize fielmente o que vem do banco.

- **NÃO implemente browser pool warm do Playwright** nesta sessão. Volume baixo não justifica.

- **NÃO implemente autenticação por API key nesta sessão.** O endpoint fica público durante dev.

- **NÃO crie subagents ou paraleliza tarefas dentro das fases.** Cada fase é sequencial, pausa entre elas pro dev revisar.

- **NÃO instale bibliotecas extras sem necessidade.** Stick com o que tá na stack.

- **NÃO mexa na pasta `assets/`**. Os arquivos já estão lá.

- **NÃO faça deploy, não rode comandos na VPS, não configure domínio, não gere certificados SSL.**

- **NÃO refatore visualmente o template em busca de "fidelidade visual ao modelo".** Critério é "dados renderizados, estrutura correta". Refinamento é outra sessão.

---

## 10. Processo de trabalho

- Você passa por 8 fases sequenciais, parando depois de cada uma pra resumir o que foi feito e aguardar aprovação
- Se encontrar ambiguidade ou faltar informação, **pare e pergunte**. Não chute.
- Se o MCP do Supabase revelar schema diferente do documentado, **alinhe com o schema real** e avise nas notas da fase
- Use commits frequentes (um por fase no mínimo), mensagens descritivas em português
- No resumo de cada fase pro dev, inclua:
  - O que foi feito (lista curta)
  - Arquivos criados/modificados
  - Comandos pro dev testar a fase
  - Perguntas abertas (se houver)
  - O que vem na próxima fase

---

## 11. Como começar

Comece pela **Fase 1** imediatamente. A pasta `pdf-generator/` onde você está já tem a subpasta `assets/` com todos os 14 arquivos de mídia necessários — confirme que eles existem antes de prosseguir, mas **não os modifique**.

Boa construção. 🚀
