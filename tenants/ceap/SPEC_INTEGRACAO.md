# Spec de Integração — Gerador de PDF CEAP

> Documento técnico para o desenvolvedor frontend que vai criar a tela de geração de PDF.

---

## 1. Visão Geral

O Gerador de PDF é um serviço independente hospedado em VPS. O frontend precisa:

1. Montar um formulário com os parâmetros do PDF
2. Enviar uma requisição HTTP `POST` para a API
3. Receber a URL do PDF gerado

O PDF é gerado a partir dos dados cadastrados no Supabase (tabela `lp_courses` + `lp_instructors`). Os **ceap_section_overrides** são ajustes visuais finos e os **template_params** são dados dinâmicos que o operador envia pelo frontend.

---

## 2. Configuração da API

| Item              | Valor                                                  |
|-------------------|--------------------------------------------------------|
| **URL Base**      | `http://77.237.247.129:59542`                          |
| **Endpoint**      | `POST /api/v1/generate-pdf`                            |
| **Autenticação**  | Header `Authorization: Bearer {TOKEN}`                 |
| **Token CEAP**    | `ceap-256bbc0747e87dc50f9fe817e629875b`                |
| **Content-Type**  | `application/json`                                     |
| **Debug (HTML)**  | Adicionar `?debug=true` na URL para ver o HTML sem gerar PDF |

---

## 3. Corpo da Requisição (Request Body)

```json
{
  "course_id": "UUID do curso (obrigatório)",
  "template_params": {
    "produto": "licittoguru"
  },
  "ceap_section_overrides": { ... }
}
```

---

## 4. Parâmetros Obrigatórios

| Campo                   | Tipo   | Descrição                                                      |
|-------------------------|--------|----------------------------------------------------------------|
| `course_id`             | string | UUID do curso (tabela `lp_courses` no Supabase)                |
| `template_params.produto` | string | Produto CEAP. Valores: `licittoguru`, `plataforma`, `monicalopes` |

---

## 5. Template Params — Parâmetros Dinâmicos do PDF

Estes parâmetros são enviados dentro de `template_params` e controlam conteúdo dinâmico do PDF.

> **Instrução para o frontend:** Cada parâmetro abaixo deve ser um campo na tela. O label visível é o **Nome no Front**. A **Observação** deve aparecer como tooltip ou texto auxiliar.

### 5.1 Produto CEAP (`produto`) — OBRIGATÓRIO

| Parâmetro | Nome no Front | Observação |
|-----------|---------------|------------|
| `template_params.produto` | Produto CEAP | Selecione qual produto aparece na última página do PDF. Determina a imagem de fundo da página de encerramento. Valores: `licittoguru`, `plataforma`, `monicalopes` |

> **No frontend:** usar um `<select>` com 3 opções.

### 5.2 Modo Comercial e Proposta Comercial

O PDF pode ser gerado em dois modos:

- **Modo Padrão (não-comercial):** PDF institucional sem preço. Usado para divulgação geral.
- **Modo Comercial:** PDF com o valor da proposta exibido na última página. Usado para enviar propostas a clientes específicos.

| Parâmetro | Nome no Front | Observação |
|-----------|---------------|------------|
| (toggle) | PDF Comercial | Toggle/checkbox na tela. Quando ativado, exibe o campo de valor abaixo. Quando desativado, gera PDF sem preço |
| `template_params.proposta_comercial.valor` | Valor da Proposta (R$) | Só aparece quando "PDF Comercial" está ativado. Exibe "R$ {valor}*" na última página do PDF. Ex: `"1.990,00"` |

> **No frontend:** criar um toggle/checkbox "PDF Comercial" no topo do formulário. Quando ativado, exibir o campo "Valor da Proposta (R$)". Quando desativado, ocultar o campo e **omitir o objeto `proposta_comercial` inteiro do JSON** — isso gera o PDF sem preço.
>
> ```
> ┌─────────────────────────────────────────────────┐
> │  [✓] PDF Comercial                              │
> │                                                 │
> │  Valor da Proposta (R$): [  1.990,00  ]         │
> │  (Exibe o preço na última página do PDF)        │
> └─────────────────────────────────────────────────┘
> ```

### 5.3 Capa — Foto e Professores (opcional)

| Parâmetro | Nome no Front | Observação |
|-----------|---------------|------------|
| `template_params.cover_photo_url` | URL da foto da capa | URL de imagem personalizada para a capa (Supabase Storage). Se vazio, usa a foto do professor cadastrada no banco |
| `template_params.professor_left_name` | Nome professor esquerda | Para layout com 2 professores: nome que aparece à esquerda da foto. Se vazio, usa o nome do 1º professor do banco |
| `template_params.professor_right_name` | Nome professor direita | Para layout com 2 professores: nome que aparece à direita da foto |
| `template_params.professor_font_size` | Tamanho fonte nome do professor | Ajusta o tamanho da fonte do nome na capa. Ex: `"16"` para 16pt |

### 5.4 Margens dos Nomes na Capa (opcional)

Para ajuste fino do posicionamento dos nomes dos professores na capa com 2 professores.

| Parâmetro | Nome no Front | Observação |
|-----------|---------------|------------|
| `template_params.professor_left_margins.left` | Margem esquerda (prof. esquerda) | Margem CSS esquerda do nome do professor da esquerda |
| `template_params.professor_left_margins.right` | Margem direita (prof. esquerda) | Margem CSS direita do nome do professor da esquerda |
| `template_params.professor_right_margins.left` | Margem esquerda (prof. direita) | Margem CSS esquerda do nome do professor da direita |
| `template_params.professor_right_margins.right` | Margem direita (prof. direita) | Margem CSS direita do nome do professor da direita |

### 5.5 Contato (opcional)

Sobrescreve os dados de contato padrão que aparecem no rodapé das páginas de programação.

| Parâmetro | Nome no Front | Observação |
|-----------|---------------|------------|
| `template_params.contato.telefone1` | Telefone 1 | Padrão: `(48) 3204-6843` |
| `template_params.contato.telefone2` | Telefone 2 | Padrão: `(48) 99665-7706` |
| `template_params.contato.email` | E-mail | Padrão: `comercial.sc01@ceapbrasil.com` |
| `template_params.contato.site` | Site | Padrão: `www.ceapbrasil.com` |

> **No frontend:** se os campos estiverem vazios, omitir o objeto `contato` inteiro (usa os padrões).

---

## 6. Section Overrides — Ajustes Visuais por Seção

Todos os valores são **strings** que representam **deltas** (ajustes relativos ao valor base).
- Valores positivos (`"3"`) **somam** ao base
- Valores negativos (`"-2"`) **subtraem** do base
- Valor vazio ou não enviado = usa o base sem ajuste

Enviados dentro de `ceap_section_overrides`.

> **Instrução para o frontend:** Cada parâmetro deve ser um campo `<input>` numérico. O label visível é o **Nome no Front**. A **Observação** deve aparecer como tooltip ou texto auxiliar.

---

### 6.1 Seção: Apresentação (`apresentacao`)

> Página 2 do PDF — texto de apresentação do curso + cards "Para quem é?" + informações (Carga Horária, Data, Local).

| Parâmetro | Nome no Front | Observação |
|-----------|---------------|------------|
| `apresentacao.margin_top` | Margem superior (Apresentação) | Aumenta ou diminui o espaçamento no topo da página. Base: 32mm. Ex: `"-5"` → 27mm |
| `apresentacao.font_size` | Tamanho da fonte do texto (Apresentação) | Escala a fonte do texto de apresentação. Base: 13pt. Ex: `"-2"` → 11pt |
| `apresentacao.margin_bottom` | Espaço abaixo do texto (Apresentação) | Espaço entre o texto de apresentação e a seção de cards. Base: 6mm |
| `apresentacao.card_padding` | Padding interno dos cards (Para quem é) | Espaçamento interno vertical de cada card. Base: 3mm |
| `apresentacao.card_spacing` | Espaço entre cards (Para quem é) | Espaço vertical entre cada card. Base: 2mm |
| `apresentacao.card_font_size` | Tamanho da fonte dos cards (Para quem é) | Tamanho do texto dentro dos cards. Base: 12pt. Ex: `"-1"` → 11pt |

---

### 6.2 Seção: Professor (`professor`)

> Página 3 do PDF — card(s) do professor + seção "O que você vai aprender?" com bullets.

| Parâmetro | Nome no Front | Observação |
|-----------|---------------|------------|
| `professor.margin_top` | Margem superior (Professor) | Espaçamento no topo da página do professor. Serve para ajustar o posicionamento vertical |
| `professor.font_scale` | Escala de fontes (Professor) | Escala proporcionalmente nome e texto do professor. Base nome: 18pt |
| `professor.card_margin_bottom` | Espaço abaixo do card (Professor) | Espaço entre o card do professor e a seção "O que vai aprender?" Base: 6mm |
| `professor.learn_font_size` | Tamanho fonte (O que vai aprender) | Tamanho da fonte dos bullets. Base: 13pt |
| `professor.learn_padding` | Espaço entre bullets (O que vai aprender) | Espaço vertical entre cada bullet. Base: 3mm |

---

### 6.3 Seção: Programação (`programacao`)

> Páginas 4+ do PDF — cronograma com datas, módulos e tópicos. Pagina automaticamente quando o conteúdo excede uma página.

| Parâmetro | Nome no Front | Observação |
|-----------|---------------|------------|
| `programacao.date_margin_top` | Margem superior das datas (Programação) | Espaço acima de cada bloco de data. Base: 6mm. Ex: `"3"` → 9mm |
| `programacao.bullet_padding` | Espaço entre tópicos (Programação) | Espaço vertical entre cada tópico/bullet. Base: 2mm |
| `programacao.font_size` | Escala geral de fontes (Programação) | Escala todas as fontes da programação proporcionalmente. Base data: 13pt, título: 12pt, bullet: 11pt. Ex: `"-1"` → 12/11/10pt |

---

### 6.4 Seção: Capa (`capa`)

> Página 1 do PDF — ajustes de posicionamento dos nomes dos professores na capa (layout com 2 professores).

| Parâmetro | Nome no Front | Observação |
|-----------|---------------|------------|
| `capa.professor_font_size` | Tamanho fonte nome (Capa) | Tamanho da fonte do nome do professor na capa |
| `capa.professor_left_margin_left` | Margem esq. do nome esquerdo (Capa) | Ajuste da margem esquerda do nome do professor à esquerda |
| `capa.professor_left_margin_right` | Margem dir. do nome esquerdo (Capa) | Ajuste da margem direita do nome do professor à esquerda |
| `capa.professor_right_margin_left` | Margem esq. do nome direito (Capa) | Ajuste da margem esquerda do nome do professor à direita |
| `capa.professor_right_margin_right` | Margem dir. do nome direito (Capa) | Ajuste da margem direita do nome do professor à direita |

---

## 7. Resposta da API

### Sucesso (200)

```json
{
  "success": true,
  "pdf_url": "https://jdcpglpcwrviotluzfvm.supabase.co/storage/v1/object/public/pdfs/generated/nome-do-curso-uuid-timestamp.pdf",
  "generated_at": "2026-04-16T20:30:00.000Z",
  "course_id": "572c60dd-6591-4c95-b10b-044cc9f9936f"
}
```

### Erros comuns

| Código | Erro                       | Causa                                               |
|--------|----------------------------|------------------------------------------------------|
| 400    | `INVALID_BODY`             | JSON inválido ou campos com tipo errado              |
| 400    | `MISSING_COURSE_ID`        | `course_id` não foi enviado                          |
| 400    | `MISSING_TEMPLATE_PARAMS`  | `template_params` não foi enviado (pelo menos `produto` é obrigatório) |
| 400    | `UNSUPPORTED_TEMPLATE`     | Template não existe no sistema                       |
| 401    | `UNAUTHORIZED`             | Token inválido ou ausente                            |
| 500    | `VALIDATION_ERROR`         | Dados do banco não passaram na validação             |

---

## 8. Exemplos de Requisição

### Requisição mínima (sem ajustes, sem proposta)

```bash
curl -X POST http://77.237.247.129:59542/api/v1/generate-pdf \
  -H "Authorization: Bearer ceap-256bbc0747e87dc50f9fe817e629875b" \
  -H "Content-Type: application/json" \
  -d '{
    "course_id": "572c60dd-6591-4c95-b10b-044cc9f9936f",
    "template_params": {
      "produto": "licittoguru"
    }
  }'
```

### Com proposta comercial

```bash
curl -X POST http://77.237.247.129:59542/api/v1/generate-pdf \
  -H "Authorization: Bearer ceap-256bbc0747e87dc50f9fe817e629875b" \
  -H "Content-Type: application/json" \
  -d '{
    "course_id": "572c60dd-6591-4c95-b10b-044cc9f9936f",
    "template_params": {
      "produto": "plataforma",
      "proposta_comercial": {
        "valor": "1.990,00"
      }
    }
  }'
```

### Com ajustes visuais

```bash
curl -X POST http://77.237.247.129:59542/api/v1/generate-pdf \
  -H "Authorization: Bearer ceap-256bbc0747e87dc50f9fe817e629875b" \
  -H "Content-Type: application/json" \
  -d '{
    "course_id": "572c60dd-6591-4c95-b10b-044cc9f9936f",
    "template_params": {
      "produto": "licittoguru"
    },
    "ceap_section_overrides": {
      "apresentacao": {
        "font_size": "-2",
        "card_font_size": "-1"
      },
      "programacao": {
        "font_size": "-1",
        "date_margin_top": "2"
      }
    }
  }'
```

### Com contato personalizado

```bash
curl -X POST http://77.237.247.129:59542/api/v1/generate-pdf \
  -H "Authorization: Bearer ceap-256bbc0747e87dc50f9fe817e629875b" \
  -H "Content-Type: application/json" \
  -d '{
    "course_id": "572c60dd-6591-4c95-b10b-044cc9f9936f",
    "template_params": {
      "produto": "licittoguru",
      "contato": {
        "telefone1": "(11) 3000-0000",
        "email": "contato@regional.com"
      }
    }
  }'
```

### Preview HTML (modo debug)

```bash
curl -X POST "http://77.237.247.129:59542/api/v1/generate-pdf?debug=true" \
  -H "Authorization: Bearer ceap-256bbc0747e87dc50f9fe817e629875b" \
  -H "Content-Type: application/json" \
  -d '{
    "course_id": "572c60dd-6591-4c95-b10b-044cc9f9936f",
    "template_params": { "produto": "licittoguru" }
  }'
```

O modo debug retorna o HTML renderizado em vez de gerar o PDF. Útil para testar os ajustes rapidamente.

---

## 9. Instruções para o Frontend

### 9.1 Estrutura da Tela

A tela de geração de PDF CEAP deve conter:

1. **Seletor de Curso** — dropdown ou campo de busca para selecionar o curso (`course_id`)
2. **Produto CEAP** — select com 3 opções (licittoguru, plataforma, monicalopes)
3. **Proposta Comercial** — campo de valor (opcional)
4. **Contato** — seção colapsável com telefones, email, site (opcional)
5. **Seções de ajuste visual** — seções colapsáveis para cada grupo de overrides:
   - Capa
   - Apresentação
   - Professor
   - Programação
6. **Botão "Gerar PDF"** — dispara a requisição
7. **Botão "Preview HTML"** — dispara com `?debug=true` e abre em nova aba
8. **Resultado** — exibe o link do PDF gerado ou mensagem de erro

### 9.2 Layout sugerido dos campos

```
┌─────────────────────────────────────────────────────────┐
│  Curso: [dropdown com cursos]                           │
│  Produto CEAP: [licittoguru ▼]                          │
│                                                         │
│  Proposta Comercial (opcional)                          │
│  Valor (R$): [________]                                 │
│  (Se preenchido, exibe o preço na última página)        │
│                                                         │
│  ▼ Contato (opcional — sobrescreve o padrão)            │
│    Telefone 1: [________]  Telefone 2: [________]       │
│    E-mail: [________]      Site: [________]             │
│                                                         │
│  ▼ Ajustes da Capa                                      │
│    Tamanho fonte nome (Capa)                  [_____]   │
│    ...                                                  │
│                                                         │
│  ▼ Ajustes da Apresentação                              │
│    Margem superior (Apresentação)             [_____]   │
│    (Aumenta ou diminui o espaço no topo da página)      │
│    Tamanho da fonte do texto (Apresentação)   [_____]   │
│    (Escala a fonte do texto de apresentação)            │
│    ...                                                  │
│                                                         │
│  ▼ Ajustes do Professor                                 │
│    Margem superior (Professor)                [_____]   │
│    ...                                                  │
│                                                         │
│  ▼ Ajustes da Programação                               │
│    Margem superior das datas (Programação)     [_____]   │
│    ...                                                  │
│                                                         │
│  [Preview HTML]  [Gerar PDF]                            │
└─────────────────────────────────────────────────────────┘
```

### 9.3 Montagem do JSON

Campos vazios **não devem ser enviados** (omitir do JSON).

```typescript
function buildRequestBody(formData: FormData) {
  const body: Record<string, any> = {
    course_id: formData.get('course_id'),
    template_params: {
      produto: formData.get('produto'),
    },
  };

  // Proposta comercial (só se preenchido)
  const valor = formData.get('proposta_comercial_valor') as string;
  if (valor?.trim()) {
    body.template_params.proposta_comercial = { valor: valor.trim() };
  }

  // Contato (só se algum campo preenchido)
  const contato: Record<string, string> = {};
  for (const field of ['telefone1', 'telefone2', 'email', 'site']) {
    const v = formData.get(`contato_${field}`) as string;
    if (v?.trim()) contato[field] = v.trim();
  }
  if (Object.keys(contato).length > 0) {
    body.template_params.contato = contato;
  }

  // Section overrides
  const overrides: Record<string, Record<string, string>> = {};

  // Apresentação
  const apFields = ['margin_top', 'font_size', 'margin_bottom', 'card_padding', 'card_spacing', 'card_font_size'];
  const ap: Record<string, string> = {};
  for (const f of apFields) {
    const v = formData.get(`apresentacao.${f}`) as string;
    if (v?.trim()) ap[f] = v.trim();
  }
  if (Object.keys(ap).length > 0) overrides.apresentacao = ap;

  // Professor
  const profFields = ['margin_top', 'font_scale', 'card_margin_bottom', 'learn_font_size', 'learn_padding'];
  const prof: Record<string, string> = {};
  for (const f of profFields) {
    const v = formData.get(`professor.${f}`) as string;
    if (v?.trim()) prof[f] = v.trim();
  }
  if (Object.keys(prof).length > 0) overrides.professor = prof;

  // Programação
  const progFields = ['date_margin_top', 'bullet_padding', 'font_size'];
  const prog: Record<string, string> = {};
  for (const f of progFields) {
    const v = formData.get(`programacao.${f}`) as string;
    if (v?.trim()) prog[f] = v.trim();
  }
  if (Object.keys(prog).length > 0) overrides.programacao = prog;

  // Capa
  const capaFields = ['professor_font_size', 'professor_left_margin_left', 'professor_left_margin_right', 'professor_right_margin_left', 'professor_right_margin_right'];
  const capa: Record<string, string> = {};
  for (const f of capaFields) {
    const v = formData.get(`capa.${f}`) as string;
    if (v?.trim()) capa[f] = v.trim();
  }
  if (Object.keys(capa).length > 0) overrides.capa = capa;

  if (Object.keys(overrides).length > 0) {
    body.ceap_section_overrides = overrides;
  }

  return body;
}
```

### 9.4 Chamada à API

```typescript
async function generatePdf(body: Record<string, any>, debug = false) {
  const url = `http://77.237.247.129:59542/api/v1/generate-pdf${debug ? '?debug=true' : ''}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ceap-256bbc0747e87dc50f9fe817e629875b',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro ao gerar PDF');
  }

  if (debug) {
    const html = await response.text();
    return { type: 'html', content: html };
  }

  const data = await response.json();
  return { type: 'pdf', url: data.pdf_url, generatedAt: data.generated_at };
}
```

---

## 10. Fluxo Completo

```
1. Usuário seleciona o curso
2. Usuário escolhe o produto CEAP (licittoguru, plataforma ou monicalopes)
3. (Opcional) Preenche valor da proposta comercial
4. (Opcional) Ajusta contato, parâmetros visuais
5. Clica "Preview HTML" para ver rapidamente como ficou
6. Ajusta parâmetros se necessário
7. Clica "Gerar PDF"
8. Frontend envia POST para a API
9. API retorna { success: true, pdf_url: "..." }
10. Frontend exibe o link do PDF ou abre em nova aba
```

---

## 11. Dados que Vêm do Banco (Supabase)

Estes dados **não são enviados na requisição** — são carregados automaticamente pela API a partir do `course_id`:

| Dado                    | Tabela           | Coluna              | Descrição                                       |
|-------------------------|------------------|---------------------|-------------------------------------------------|
| Título do curso         | `lp_courses`     | `title`             | Nome do curso                                   |
| Subtítulo               | `lp_courses`     | `subtitle`          | Subtítulo descritivo                            |
| Texto de apresentação   | `lp_courses`     | `folder_presentation` | Texto que aparece na página de Apresentação     |
| Cronograma detalhado    | `lp_courses`     | `folder_syllabus`   | JSON com datas, horários e tópicos              |
| Cards "O que vai aprender" | `lp_courses`  | `about_cards`       | JSON com ícone + título                         |
| Cards "Para quem é"     | `lp_courses`     | `audience_cards`    | JSON com ícone + título                         |
| Data do curso           | `lp_courses`     | `date_label`        | Ex: "14 a 17 de Abril"                         |
| Local                   | `lp_courses`     | `location_venue`, `location_address`, `location_city` | Venue, endereço e cidade |
| Carga horária           | `lp_courses`     | `workload`          | Ex: "20"                                        |
| Investimento            | `lp_courses`     | `investment_heading`, `investment_subtitle`, `included_items` | Título, subtítulo e itens inclusos |
| Foto do professor       | `lp_courses`     | `cover_image_url`   | URL da foto para a capa                         |
| IDs dos professores     | `lp_courses`     | `instructor_ids`    | JSON array de UUIDs                             |
| Nome do professor       | `lp_instructors`  | `name`              | Nome completo                                   |
| Cargo/título            | `lp_instructors`  | `role`              | Ex: "Advogada"                                  |
| Bio                     | `lp_instructors`  | `bio`               | Texto da biografia                              |
| Foto                    | `lp_instructors`  | `photo_url`         | URL da foto                                     |

---

## 12. Estrutura do PDF Gerado

| Página | Seção | Conteúdo |
|--------|-------|----------|
| 1 | Capa | Logo CEAP + foto professor + título + subtítulo + pill data/local |
| 2 | Apresentação | Texto de apresentação + "Para quem é?" (cards) + Carga Horária/Data/Local |
| 3 | Professor | Card do professor (foto + bio) + "O que você vai aprender?" (bullets) |
| 4+ | Programação | Cronograma com datas, módulos e tópicos (paginação automática) |
| Última | Encerramento | Background estático com header + valor da proposta (se houver) |

---

## 13. Resumo dos Parâmetros (Referência Rápida)

```
template_params (obrigatório)
├── produto                    Produto CEAP (licittoguru/plataforma/monicalopes)
├── proposta_comercial
│   └── valor                  Valor da proposta (ex: "1.990,00")
├── cover_photo_url            URL foto personalizada da capa
├── professor_left_name        Nome prof. esquerda (2 profs)
├── professor_right_name       Nome prof. direita (2 profs)
├── professor_font_size        Tamanho fonte nome na capa
├── professor_left_margins
│   ├── left                   Margem esq. nome esquerdo
│   └── right                  Margem dir. nome esquerdo
├── professor_right_margins
│   ├── left                   Margem esq. nome direito
│   └── right                  Margem dir. nome direito
└── contato
    ├── telefone1              Telefone 1
    ├── telefone2              Telefone 2
    ├── email                  E-mail
    └── site                   Site

ceap_section_overrides (opcional)
├── apresentacao
│   ├── margin_top             Margem superior (Apresentação)
│   ├── font_size              Tamanho da fonte do texto
│   ├── margin_bottom          Espaço abaixo do texto
│   ├── card_padding           Padding interno dos cards
│   ├── card_spacing           Espaço entre cards
│   └── card_font_size         Tamanho da fonte dos cards
├── professor
│   ├── margin_top             Margem superior (Professor)
│   ├── font_scale             Escala de fontes
│   ├── card_margin_bottom     Espaço abaixo do card
│   ├── learn_font_size        Tamanho fonte bullets
│   └── learn_padding          Espaço entre bullets
├── programacao
│   ├── date_margin_top        Margem superior das datas
│   ├── bullet_padding         Espaço entre tópicos
│   └── font_size              Escala geral de fontes
└── capa
    ├── professor_font_size            Tamanho fonte nome
    ├── professor_left_margin_left     Margem esq. nome esquerdo
    ├── professor_left_margin_right    Margem dir. nome esquerdo
    ├── professor_right_margin_left    Margem esq. nome direito
    └── professor_right_margin_right   Margem dir. nome direito
```

Total: **1 obrigatório** (`produto`) + **12 opcionais** (template_params) + **19 ajustes visuais** (section_overrides).


Observação: para fazer as chamadas, criar no Supabase os seguintes secrets:

```
PDF_GENERATOR_URL=http://77.237.247.129:59542
PDF_GENERATOR_API_TOKEN=ceap-256bbc0747e87dc50f9fe817e629875b
```

Esse já é o token oficial do CEAP e deve ser usado para identificação nas requisições.
