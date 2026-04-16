# Spec de Integração — Gerador de PDF Plenum

> Documento técnico para o desenvolvedor frontend que vai criar a tela de geração de PDF.

---

## 1. Visão Geral

O Gerador de PDF é um serviço independente hospedado em VPS. O frontend precisa:

1. Montar um formulário com os parâmetros de ajuste do PDF
2. Enviar uma requisição HTTP `POST` para a API
3. Receber a URL do PDF gerado

O PDF é gerado a partir dos dados cadastrados no Supabase (curso, edição, palestrantes, design system). Os **section_overrides** são ajustes visuais finos que o operador pode fazer pelo frontend.

---

## 2. Configuração da API

| Item              | Valor                                                  |
|-------------------|--------------------------------------------------------|
| **URL Base**      | `http://77.237.247.129:59542`                          |
| **Endpoint**      | `POST /api/v1/generate-pdf`                            |
| **Autenticação**  | Header `Authorization: Bearer {TOKEN}`                 |
| **Token Plenum**  | `plnm-621e4b511104b6c63ccd6b3f5d2d178e`               |
| **Content-Type**  | `application/json`                                     |
| **Debug (HTML)**  | Adicionar `?debug=true` na URL para ver o HTML sem gerar PDF |

---

## 3. Corpo da Requisição (Request Body)

```json
{
  "edition_id": "UUID da edição (obrigatório)",
  "template": "plenum-curso-v1 (opcional, usa o padrão do tenant)",
  "section_overrides": { ... }
}
```

### Campos obrigatórios

| Campo        | Tipo   | Descrição                                                    |
|--------------|--------|--------------------------------------------------------------|
| `edition_id` | string | UUID da edição do curso (tabela `course_dates` no Supabase)  |

### Campos opcionais

| Campo               | Tipo   | Descrição                                                          |
|---------------------|--------|--------------------------------------------------------------------|
| `template`          | string | ID do template. Padrão: `plenum-curso-v1`                         |
| `section_overrides` | object | Ajustes visuais por seção (veja seção 5 abaixo)                    |

---

## 4. Resposta da API

### Sucesso (200)

```json
{
  "success": true,
  "pdf_url": "https://jyackmnjhsdllfqqxund.supabase.co/storage/v1/object/public/pdfs/generated/nome-do-curso-uuid-timestamp.pdf",
  "generated_at": "2026-04-16T14:30:00.000Z",
  "edition_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Erros comuns

| Código | Erro                      | Causa                                          |
|--------|---------------------------|-------------------------------------------------|
| 400    | `INVALID_BODY`            | JSON inválido ou campos com tipo errado         |
| 400    | `MISSING_EDITION_ID`      | `edition_id` não foi enviado                    |
| 400    | `UNSUPPORTED_TEMPLATE`    | Template não existe no sistema                  |
| 401    | `UNAUTHORIZED`            | Token inválido ou ausente                       |
| 500    | `INVALID_INSTRUCTOR_COUNT`| Edição sem instrutores ou com mais de 3         |

---

## 5. Section Overrides — Parâmetros de Ajuste Visual

Todos os valores são **strings** que representam **deltas** (ajustes relativos ao valor base).
- Valores positivos (`"3"`) **somam** ao base
- Valores negativos (`"-2"`) **subtraem** do base
- Valor vazio ou não enviado = usa o base sem ajuste

> **Instrução para o frontend:** Cada parâmetro abaixo deve ser um campo `<input>` na tela. O label visível é o **Nome no Front**. A **Observação** deve aparecer como tooltip ou texto auxiliar abaixo do campo.

---

### 5.1 Seção: Sobre o Curso (`about`)

> Corresponde à página "Sobre o Curso" do PDF — cards com ícones descrevendo o que o aluno vai aprender.

| Parâmetro              | Nome no Front                         | Observação                                                                                      |
|------------------------|---------------------------------------|-------------------------------------------------------------------------------------------------|
| `about.margin_top`     | Margem superior (Sobre o Curso)       | Aumenta ou diminui o espaçamento no topo da seção inteira. Base: 10mm. Ex: `"5"` → 15mm         |
| `about.margin_bottom`  | Espaço entre cards (Sobre o Curso)    | Aumenta ou diminui o espaço entre cada card. Base: 3mm. Ex: `"-1"` → 2mm                        |
| `about.margin_lateral` | Margens laterais (Sobre o Curso)      | Aumenta ou diminui o padding esquerdo/direito da seção. Base: 18mm. Ex: `"2"` → 20mm            |
| `about.icon_size`      | Tamanho dos ícones (Sobre o Curso)    | Aumenta ou diminui o tamanho dos ícones dentro dos cards. Base: 18px. Ex: `"4"` → 22px          |
| `about.scale`          | Escala geral de fontes (Sobre o Curso)| Escala todas as fontes da seção proporcionalmente. Base título: 13pt, descrição: 11pt. Ex: `"2"` → 15pt/13pt |

---

### 5.2 Seção: Público-Alvo (`audience`)

> Corresponde à página "Para quem é esta capacitação?" — cards com ícones descrevendo o público-alvo.

| Parâmetro                      | Nome no Front                              | Observação                                                                                  |
|--------------------------------|--------------------------------------------|---------------------------------------------------------------------------------------------|
| `audience.margin_top`          | Margem superior (Público-Alvo)             | Espaçamento no topo da seção. Base: 10mm. Ex: `"5"` → 15mm                                  |
| `audience.card_margin_bottom`  | Espaço entre cards (Público-Alvo)          | Espaço vertical entre cada card. Base: 2mm. Ex: `"1"` → 3mm                                 |
| `audience.card_padding_vertical`| Padding interno dos cards (Público-Alvo)  | Espaçamento interno vertical de cada card. Base: 2.5mm. Ex: `"0.5"` → 3mm                   |
| `audience.card_font_size`      | Tamanho da fonte dos cards (Público-Alvo)  | Tamanho do texto dentro dos cards. Base: 13pt. Ex: `"1"` → 14pt                             |
| `audience.icon_size`           | Tamanho dos ícones (Público-Alvo)          | Tamanho dos ícones dentro dos cards. Base: 16px. Ex: `"2"` → 18px                           |

---

### 5.3 Seção: Programação (`program`)

> Corresponde às páginas de "Programação" do PDF — dias, módulos e tópicos do curso.

| Parâmetro                | Nome no Front                          | Observação                                                                              |
|--------------------------|----------------------------------------|-----------------------------------------------------------------------------------------|
| `program.day_margin_top` | Margem superior das datas (Programação)| Espaço acima de cada bloco de data/dia. Base: 10mm. Ex: `"3"` → 13mm                    |

---

### 5.4 Seção: Palestrantes (`speakers`)

> Corresponde à página de "Palestrantes" — cards com foto, nome, cargo e bio de cada palestrante.
> Esta seção aparece automaticamente no layout multi-speaker (2+ palestrantes).

| Parâmetro              | Nome no Front                        | Observação                                                                                                 |
|------------------------|--------------------------------------|------------------------------------------------------------------------------------------------------------|
| `speakers.margin_top`  | Margem superior (Palestrantes)       | Espaçamento acima dos cards de palestrantes. Serve para ajustar o posicionamento vertical dos cards         |
| `speakers.scale`       | Escala geral (Palestrantes)          | Escala proporcionalmente fontes e imagem dos palestrantes. Base nome: 20pt, foto: 55mm. Ex: `"3"` → 23pt/58mm |

---

## 6. Exemplo Completo de Requisição

### Requisição mínima (sem ajustes)

```bash
curl -X POST http://77.237.247.129:59542/api/v1/generate-pdf \
  -H "Authorization: Bearer plnm-621e4b511104b6c63ccd6b3f5d2d178e" \
  -H "Content-Type: application/json" \
  -d '{
    "edition_id": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

### Requisição com ajustes visuais

```bash
curl -X POST http://77.237.247.129:59542/api/v1/generate-pdf \
  -H "Authorization: Bearer plnm-621e4b511104b6c63ccd6b3f5d2d178e" \
  -H "Content-Type: application/json" \
  -d '{
    "edition_id": "550e8400-e29b-41d4-a716-446655440000",
    "section_overrides": {
      "about": {
        "margin_top": "5",
        "scale": "2"
      },
      "audience": {
        "card_font_size": "1",
        "icon_size": "2"
      },
      "program": {
        "day_margin_top": "3"
      },
      "speakers": {
        "scale": "1.5"
      }
    }
  }'
```

### Preview HTML (modo debug)

```bash
curl -X POST "http://77.237.247.129:59542/api/v1/generate-pdf?debug=true" \
  -H "Authorization: Bearer plnm-621e4b511104b6c63ccd6b3f5d2d178e" \
  -H "Content-Type: application/json" \
  -d '{"edition_id": "550e8400-e29b-41d4-a716-446655440000"}'
```

O modo debug retorna o HTML renderizado em vez de gerar o PDF. Útil para testar os ajustes rapidamente.

---

## 7. Instruções para o Frontend

### 7.1 Estrutura da Tela

A tela de geração de PDF deve conter:

1. **Seletor de Edição** — dropdown ou campo de busca para selecionar a edição do curso (`edition_id`)
2. **Seções de ajuste** — uma seção colapsável para cada grupo de overrides:
   - Sobre o Curso
   - Público-Alvo
   - Programação
   - Palestrantes
3. **Botão "Gerar PDF"** — dispara a requisição
4. **Botão "Preview HTML"** — dispara a requisição com `?debug=true` e abre o HTML em nova aba
5. **Resultado** — exibe o link do PDF gerado ou mensagem de erro

### 7.2 Layout dos campos de ajuste

Cada seção deve exibir seus parâmetros como inputs numéricos:

```
┌─────────────────────────────────────────────────────────┐
│  ▼ Sobre o Curso                                        │
│                                                         │
│  Margem superior (Sobre o Curso)              [_____]   │
│  (Aumenta ou diminui o espaçamento no topo da seção)    │
│                                                         │
│  Espaço entre cards (Sobre o Curso)           [_____]   │
│  (Aumenta ou diminui o espaço entre cada card)          │
│                                                         │
│  Margens laterais (Sobre o Curso)             [_____]   │
│  (Aumenta ou diminui o padding esquerdo/direito)        │
│                                                         │
│  Tamanho dos ícones (Sobre o Curso)           [_____]   │
│  (Aumenta ou diminui o tamanho dos ícones nos cards)    │
│                                                         │
│  Escala geral de fontes (Sobre o Curso)       [_____]   │
│  (Escala todas as fontes da seção proporcionalmente)    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 7.3 Montagem do JSON

Os campos preenchidos devem ser montados no objeto `section_overrides`. Campos vazios **não devem ser enviados** (omitir do JSON).

```typescript
// Exemplo de montagem no frontend
function buildSectionOverrides(formData: FormData) {
  const overrides: Record<string, Record<string, string>> = {};

  // about
  const aboutFields = ['margin_top', 'margin_bottom', 'margin_lateral', 'icon_size', 'scale'];
  const about: Record<string, string> = {};
  for (const field of aboutFields) {
    const value = formData.get(`about.${field}`) as string;
    if (value && value.trim() !== '') about[field] = value.trim();
  }
  if (Object.keys(about).length > 0) overrides.about = about;

  // audience
  const audienceFields = ['margin_top', 'card_margin_bottom', 'card_padding_vertical', 'card_font_size', 'icon_size'];
  const audience: Record<string, string> = {};
  for (const field of audienceFields) {
    const value = formData.get(`audience.${field}`) as string;
    if (value && value.trim() !== '') audience[field] = value.trim();
  }
  if (Object.keys(audience).length > 0) overrides.audience = audience;

  // program
  const programFields = ['day_margin_top'];
  const program: Record<string, string> = {};
  for (const field of programFields) {
    const value = formData.get(`program.${field}`) as string;
    if (value && value.trim() !== '') program[field] = value.trim();
  }
  if (Object.keys(program).length > 0) overrides.program = program;

  // speakers
  const speakersFields = ['margin_top', 'scale'];
  const speakers: Record<string, string> = {};
  for (const field of speakersFields) {
    const value = formData.get(`speakers.${field}`) as string;
    if (value && value.trim() !== '') speakers[field] = value.trim();
  }
  if (Object.keys(speakers).length > 0) overrides.speakers = speakers;

  return Object.keys(overrides).length > 0 ? overrides : undefined;
}
```

### 7.4 Chamada à API

```typescript
async function generatePdf(editionId: string, overrides?: Record<string, any>, debug = false) {
  const url = `http://77.237.247.129:59542/api/v1/generate-pdf${debug ? '?debug=true' : ''}`;

  const body: Record<string, any> = { edition_id: editionId };
  if (overrides) body.section_overrides = overrides;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer plnm-621e4b511104b6c63ccd6b3f5d2d178e',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro ao gerar PDF');
  }

  if (debug) {
    // Retorna HTML para preview
    const html = await response.text();
    return { type: 'html', content: html };
  }

  const data = await response.json();
  return { type: 'pdf', url: data.pdf_url, generatedAt: data.generated_at };
}
```

---

## 8. Fluxo Completo

```
1. Usuário seleciona a edição do curso
2. (Opcional) Usuário ajusta os parâmetros visuais nos inputs
3. Usuário clica "Preview HTML" para ver rapidamente como ficou
4. Usuário ajusta parâmetros se necessário
5. Usuário clica "Gerar PDF"
6. Frontend envia POST para a API
7. API retorna { success: true, pdf_url: "..." }
8. Frontend exibe o link do PDF ou abre em nova aba
```

---

## 9. Dados que Vêm do Banco (Supabase)

Estes dados **não são enviados na requisição** — são carregados automaticamente pela API a partir do `edition_id`:

| Dado                   | Tabela Supabase    | Descrição                                       |
|------------------------|--------------------|--------------------------------------------------|
| Título do curso        | `courses`          | Nome do curso                                    |
| Subtítulo              | `courses`          | Subtítulo descritivo                             |
| Cards "Sobre"          | `courses`          | Array JSON com ícone + título + descrição         |
| Cards "Público-Alvo"   | `courses`          | Array JSON com ícone + título                     |
| Programação            | `course_dates`     | Array JSON com dias, módulos e tópicos            |
| Data/Local             | `course_dates`     | Datas, local, endereço da edição                  |
| Palestrantes           | `instructors`      | Nome, cargo, bio e foto de cada palestrante       |
| Design System          | `design_systems`   | Cores, fontes e estilos visuais do curso          |

---

## 10. Resumo dos Parâmetros (Referência Rápida)

```
section_overrides
├── about
│   ├── margin_top          Margem superior (Sobre o Curso)
│   ├── margin_bottom       Espaço entre cards (Sobre o Curso)
│   ├── margin_lateral      Margens laterais (Sobre o Curso)
│   ├── icon_size           Tamanho dos ícones (Sobre o Curso)
│   └── scale               Escala geral de fontes (Sobre o Curso)
├── audience
│   ├── margin_top          Margem superior (Público-Alvo)
│   ├── card_margin_bottom  Espaço entre cards (Público-Alvo)
│   ├── card_padding_vertical  Padding interno dos cards (Público-Alvo)
│   ├── card_font_size      Tamanho da fonte dos cards (Público-Alvo)
│   └── icon_size           Tamanho dos ícones (Público-Alvo)
├── program
│   └── day_margin_top      Margem superior das datas (Programação)
└── speakers
    ├── margin_top          Margem superior (Palestrantes)
    └── scale               Escala geral (Palestrantes)
    

```

Total: **12 parâmetros ajustáveis** distribuídos em 4 seções.


OBservacao: para fazer asc hamsda cirar no supabase os seguintes secrets

PDF_GENERATOR_URL=http://77.237.247.129:59542                                                          
PDF_GENERATOR_API_TOKEN=plnm-621e4b511104b6c63ccd6b3f5d2d178e

esse ja é o tokem oficial pda plenum e deve ser usado para identificação nas requisiç~eos


