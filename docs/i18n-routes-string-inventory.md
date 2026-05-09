# Inventário de strings para i18n — `app/routes`

Este documento mapeia **textos de interface** presentes nos arquivos de rota sob [`app/routes/`](../app/routes/) que devem migrar para `react-i18next` (ou equivalente): títulos, breadcrumbs, labels, placeholders, mensagens de lista/vazio/erro, botões, `aria-label`, textos em diálogos embutidos na rota, e fallbacks de mensagens da API concatenadas no código.

## Escopo e limitações

- **Incluído:** strings literais e interpolações de UI definidas **nestes arquivos de rota**.
- **Parcialmente no escopo:** textos vindos só de **componentes filhos importados** (formulários, diálogos, fieldsets). Eles aparecem na UI dessas rotas, mas **não** foram varridos arquivo a arquivo aqui — ver secção [Componentes externos relevantes](#componentes-externos-relevantes).
- **Dados dinâmicos:** nomes de empresas, cargos, labels de status vindos da API **não** são traduzíveis aqui (são conteúdo do usuário).
- **Datas formatadas:** ex. `Intl.DateTimeFormat` em [`resumes.tsx`](../app/routes/resumes.tsx) usam locale do runtime; apenas prefixos como `Updated ` precisam de chave.

## Padrões que se repetem (consolidar em chaves globais)

Sugestão de namespaces: `common` (ações genéricas), `listing` (tabelas), `crud_form` (formulários novo/editar), mais um namespace por domínio (`opportunities`, `resume`, …) se quiser granularidade.

| Padrão | Onde aparece | Exemplos / notas |
|--------|----------------|------------------|
| Breadcrumb pai | Quase todas as rotas autenticadas | `Dashboard` |
| Breadcrumb entidade pai | Forms filhos | `Opportunities`, `Companies`, `Resumes`, `Languages`, … |
| Crumb “Edit” / “New” | Forms | `Edit`, `New` |
| Cabeçalho de página | `AppLayout title` duplicando listing | mesmo texto que `ListingPageHeader title` em muitos casos |
| Coluna da tabela | Listagens | `Actions` |
| Botão recuperar erro | Listagens em tabela | `Try again`; em algumas telas `Retry` ([`dashboard.tsx`](../app/routes/dashboard.tsx), [`opportunities.tsx`](../app/routes/opportunities.tsx), [`resumes.tsx`](../app/routes/resumes.tsx)) — unificar chave ou aceitar duas variantes |
| Estado vazio de busca | Listagens | `No matches for your search.` |
| Estado vazio “nenhum registro” | Listagens | `No … yet. Add one to get started.` (variação por entidade) |
| Botões de formulário | Forms | `Cancel`, `Save`, `Save changes`, `Saving…` |
| Exclusão (AlertDialog) | Listagens | `Cancel`, `Delete`, `Deleting…` + título “Delete …?” + descrição |
| Mensagens fallback API | Helpers `apiErrorText` / `formErrorMessage` | `Could not load …`, `Could not delete …`, `Could not save …` |
| Stats de lista infinita | `ListingTableCard` + uso na rota | `Showing {{loaded}} of {{total}}` |
| Stats Kanban/oportunidades | [`opportunities.tsx`](../app/routes/opportunities.tsx) | `X opportunity` / `X opportunities`; texto longo quando não há status |
| Texto da tabela “link” em URL | [`opportunities.tsx`](../app/routes/opportunities.tsx) | `Link` (célula) |
| `aria-label` ações ícone | Linhas das tabelas | `Edit …`, `Delete …` (+ entidade) |
| Chips booleanos | [`work-experiences.tsx`](../app/routes/work-experiences.tsx) | `Yes` / `No` para remoto |

### Componente [`InfiniteScrollSentinelRow`](../app/components/listing/infinite-scroll-sentinel-row.tsx)

**Status:** ✅ implementado (`pages.infinite_scroll.*` no componente compartilhado).

Usado pelas rotas de listagem: contém **`Load more`**, **`End of list · N record(s)`** — traduzir no componente (fora da pasta routes, mas impacta todas as páginas de lista).

---

## Por arquivo de rota

**Listagens em tabela/card** (`ListingPageHeader` + dados): onde aparece linha **Status: ✅**, títulos, cabeçalhos de coluna, botões, placeholders, estados vazios/erro e diálogos de exclusão usam **`namespace pages`** (`*.title`, `*.description`, …) e **`shared.*`** para rótulos reutilizáveis. O crumb raiz quando não há `breadcrumbs` customizados vem de **`common.breadcrumb_dashboard`**, derivado da rota (`pathname === '/dashboard'` → um único segmento).

### [`login.tsx`](../app/routes/login.tsx) / [`register.tsx`](../app/routes/register.tsx) / [`recover-password.tsx`](../app/routes/recover-password.tsx) / [`reset-password.tsx`](../app/routes/reset-password.tsx)

Apenas compõem `AuthPageShell` + formulário. **Todas as strings visíveis estão nos componentes** [`LoginForm`](../app/components/auth/login-form.tsx), [`RegisterForm`](../app/components/auth/register-form.tsx), etc. — incluir inventário desses componentes num doc de `app/components/auth/`.

---

### [`home.tsx`](../app/routes/home.tsx)

**Status:** ✅ migrado (`namespace pages` · chaves `home.*`).

| Tipo | Texto |
|------|--------|
| Título | Hireest |
| Parágrafo | Páginas de exemplo com shadcn: login e painel com sidebar. |
| Botões link | Login, Cadastro, Painel |

---

### [`dashboard.tsx`](../app/routes/dashboard.tsx)

**Status:** ✅ migrado (`namespace pages` · `dashboard.*` e `shared.*` onde aplicável).

| Tipo | Texto |
|------|--------|
| `AppLayout` title | Dashboard |
| Erro lista | Could not load dashboard. |
| Botão | Retry |
| Loading | Loading dashboard… |
| `aria-label` estrelas | Interest level {{level}} of 5 |
| Gráfico pie config label | Opportunities |
| Gráficos | By Status · Opportunities distribution |
| Estado vazio pie | No opportunities yet. |
| Gráficos | By Day · New opportunities created this week (Mon–Sun) |
| Gráficos | Trend by Status · Opportunities created per week (last 4 weeks), by status |
| Estado vazio trend | No trend data yet. |
| Card tabela | Top jobs · Up to 10 roles: … |
| Card tabela | Recent opportunities · Last 10 by last update… |
| `TableHead` | Company, Role, **Interesse** (PT misturado com EN), Hourly rate, Annual salary, Status |
| Estado vazio tabelas | No opportunities yet. Add some under Opportunities. |

_Config do gráfico (`ChartConfig`) usa labels dinâmicos de status — só `count: Opportunities` é string fixa na rota._

---

### [`opportunities.tsx`](../app/routes/opportunities.tsx)

**Status:** ✅ migrado (`namespace pages` · `opportunities.*` + `shared.*`).

| Tipo | Texto |
|------|--------|
| Títulos / header | Opportunities · All tracked job opportunities |
| `ListingViewModeToggle` | groupLabel Opportunity view · listLabel List view · kanbanLabel Kanban board |
| CTA | Add opportunity |
| Erros/fallback | Could not load opportunities. · Could not load data. |
| Retry | Retry |
| Stats lista | Showing X of Y |
| Stats Kanban composito | pluralização opportunity / opportunities |
| Busca placeholder | Search opportunities… |
| Loading lista | Loading opportunities… |
| Vazio Kanban / instruções | Bloco longo “No opportunity statuses yet…” · New opportunity status |
| Vazios lista | No opportunities yet… · No matches… |
| `TableHead` | Actions, Company, Role, Description, URL, Hourly rate, Annual salary, Status, Interest |
| Link célula | Link |
| `aria-label` | Edit opportunity · Delete opportunity |
| Erro interesse | Could not update interest. |
| Diálogo excluir | Delete opportunity? · descrição · Cancel · Delete · Deleting… |
| Fallback delete | Could not delete opportunity. |

---

### [`opportunity.tsx`](../app/routes/opportunity.tsx)

**Status:** ✅ migrado (`pages` para textos da rota + breadcrumbs em `common`; `PostSaveDialog` com `entityLabel={t('entity.opportunity')}`).

| Tipo | Texto |
|------|--------|
| Breadcrumbs / title | Dashboard · Opportunities · Edit/New · Edit opportunity / New opportunity |
| Loading / erro listas | Loading form… · Could not load form data (…) · fallback Could not load form data. |
| Loading registro | Loading opportunity… |
| `CardTitle` / descrição | Update this job opportunity. / Add a job opportunity… |
| Form erro genérico | Could not save opportunity. |
| Rodapé | Cancel · Saving… / Save changes / Save |
| `PostSaveDialog` | entityLabel Opportunity |

_Strings dos campos do formulário estão em [`OpportunityFormFields`](../app/components/opportunities/opportunity-form-fields.tsx)._

---

### [`opportunity-statuses.tsx`](../app/routes/opportunity-statuses.tsx)

**Status:** ✅ migrado (`opportunity_statuses.*` + `shared.*`; níveis aria move up/down inclusos).

| Tipo | Texto |
|------|--------|
| Título página | Opportunity statuses |
| Subtítulo | Configure pipeline stages — … Kanban … |
| CTA | Add status |
| Erro lista | Could not load statuses. |
| Busca placeholder | Search statuses… |
| `TableHead` | Actions, Order, Label, Description, Style |
| Loading | Loading statuses… |
| Try again | Try again |
| Vazios | No statuses… · No matches… |
| `aria-label` | Edit status · Delete status · Move up · Move down |
| Diálogo | Delete this status? · descrição longa … |
| Fallbacks | Could not reorder statuses. · Could not delete status. |

---

### [`opportunity-status.tsx`](../app/routes/opportunity-status.tsx)

**Status:** ✅ formulário CRUD migrado (`opportunity_status.*`, `shared.*`, `entity.status` no `PostSaveDialog`, breadcrumbs com `opportunity_status.crumb_statuses`).

| Tipo | Texto |
|------|--------|
| Breadcrumbs intermediários | Opportunities · Statuses |
| Títulos / crumbs | Edit status / New status · Loading status… |
| Descrições card | texto longo edição vs criação |
| Labels campos | Label · Description · Badge style |
| Placeholders | e.g. Phone screen · texto longo stage |
| Select placeholder | Style |
| Variantes badge | valores `secondary`, `outline`… (rótulos técnicos; decidir se exibe traduzido) |
| Botões | Cancel · Save · Saving… |
| Erros | Could not save status. |
| `PostSaveDialog` | entityLabel Status |

---

### [`companies.tsx`](../app/routes/companies.tsx)

**Status:** ✅ migrado (`companies.*` + `shared.*`).

| Tipo | Texto |
|------|--------|
| Listing | Companies · Companies you are tracking… · Add company |
| Busca | Search companies… |
| `TableHead` | Actions, Name, URL, Description, Interest Level |
| Estados | Loading… · Try again · vazios |
| erro interesse | Could not update interest level. |
| Diálogo | Delete company? · This removes… |
| Fallbacks API | Could not load companies. · Could not delete company. |
| `aria-label` | Edit company · Delete company |

---

### [`company.tsx`](../app/routes/company.tsx)

**Status:** ✅ formulário CRUD migrado (`company.*`, `shared.*`, `entity.company`, breadcrumbs `common`).

| Tipo | Texto |
|------|--------|
| Títulos | Edit company / New company · Loading company… |
| Descrições card | Update this company. / Add a company… |
| Labels | Name, URL, Description, Interest level |
| Placeholders | https:// · Optional |
| Botões | Cancel · Saving… / Save changes / Save |
| Erro | Could not save company. |
| `PostSaveDialog` | entityLabel Company |

---

### [`roles.tsx`](../app/routes/roles.tsx)

**Status:** ✅ migrado (`roles.*` + `shared.*`).

Análogo a companies: **Roles**, descrição, **Add role**, **Search roles…**, **Interest Level**, **Edit/Delete role**, diálogo **Delete role?**, mensagens Could not load/delete/update…

---

### [`role.tsx`](../app/routes/role.tsx)

**Status:** ✅ formulário CRUD migrado (`role.*`, `shared.*`, `entity.role`, breadcrumbs `common`).

| Tipo | Texto |
|------|--------|
| Títulos / loading | Edit role / New role · Loading role… |
| Card | Update this role. / Add a job role… |
| Labels | Name, Description, Interest level · placeholder Optional |
| Botões / erros | Idem company |
| `PostSaveDialog` | entityLabel Role |

---

### [`skills.tsx`](../app/routes/skills.tsx)

**Status:** ✅ migrado (`skills.*` + `shared.*`).

| Tipo | Texto |
|------|--------|
| Listing | Skills · Technical skills… · Add skill · Search skills… |
| Colunas | Actions, Name, Description |
| Diálogo | Delete skill? |
| Fallbacks | Could not load skills. |

---

### [`skill.tsx`](../app/routes/skill.tsx)

**Status:** ✅ formulário CRUD migrado (`skill.*`, `shared.*`, `entity.skill`).

Títulos **Edit/New skill**, **Loading skill…**, descrições, labels Name/Description **Optional**, **Could not save skill.**, **PostSaveDialog** Skill.

---

### [`languages.tsx`](../app/routes/languages.tsx)

**Status:** ✅ migrado (`languages.*`, `language_level.*`, `shared.*`; coluna nível não usa mais `languageLevelLabel` hardcoded).

| Tipo | Texto |
|------|--------|
| Função **`languageLevelLabel`** | Beginner, Intermediate, Advanced, Native (duplicados em [`language.tsx`](../app/routes/language.tsx) em **LEVEL_OPTIONS**) |
| Listing | Languages · descrição longa · Add language · Search languages… |
| Colunas | Actions, Name, Level |
| Diálogo | Delete language? |
| Mensagens típicas lista | Loading… Try again Empty search |

---

### [`language.tsx`](../app/routes/language.tsx)

**Status:** ✅ formulário CRUD migrado (`language.*`, `language_level.*`, `shared.*`, `entity.language`).

LEVEL_OPTIONS labels; títulos **Edit/New language**; descrições; **Name**; placeholder **e.g. English, Portuguese**; **Proficiency**; Select **Level**; **Could not save language.**; **PostSaveDialog** Language.

---

### [`links.tsx`](../app/routes/links.tsx)

**Status:** ✅ migrado (`links.*` + `shared.*`).

| Tipo | Texto |
|------|--------|
| Listing | Links · Bookmarks… · Add link · Search links… |
| Colunas | Actions, Title, URL |
| Diálogo | Delete link? |

---

### [`reference-link.tsx`](../app/routes/reference-link.tsx)

**Status:** ✅ formulário CRUD migrado (`reference_link.*`, `shared.*`, `entity.link`, breadcrumbs `common`).

| Tipo | Texto |
|------|--------|
| Títulos | Edit link / New link · Loading link… |
| Card | Update / Save intro text |
| Labels | Title, URL · placeholder https:// or domain.com |
| Erro | Could not save link. |
| `PostSaveDialog` | entityLabel Link |

---

### [`certifications.tsx`](../app/routes/certifications.tsx)

**Status:** ✅ migrado (`certifications.*` + `shared.*`).

Listing **Certifications**, **Professional certifications**, **Add certification**, **Search certifications…**, colunas **Valid from/to**, diálogo **Delete certification?**, mensagens típicas.

---

### [`certification.tsx`](../app/routes/certification.tsx)

**Status:** ✅ formulário CRUD migrado (`certification.*`, `shared.*`, `entity.certification`).

**Edit/New certification**, **Loading…**, labels **Name**, **Date from**, **Date to**, **Could not save certification.**, **PostSaveDialog** Certification.

---

### [`educations.tsx`](../app/routes/educations.tsx)

**Status:** ✅ migrado (`educations.*` + `shared.*`).

| Tipo | Texto |
|------|--------|
| Título (**AppLayout** vs header) | Education (ambos) |
| Sub | Degrees and academic programs |
| CTA | Add education |
| Busca placeholder | Search education… |
| Colunas | Institution, Degree, Field of study, From, To |
| Vazio | No education entries yet… |
| Diálogo | Delete education? · This removes the entry… |
| Fallbacks | Could not load education entries. · Could not delete education entry. |

---

### [`education.tsx`](../app/routes/education.tsx)

**Status:** ✅ formulário CRUD migrado (`education.*`, `shared.*`, `entity.education`, crumb lista `nav_education`).

**Edit/New education**, crumbs **Education**, labels **Institution name**, Degree, Field of study, Date from/to **Optional**, **Could not save education.**, **PostSaveDialog** Education.

---

### [`work-experiences.tsx`](../app/routes/work-experiences.tsx)

**Status:** ✅ migrado (`work_experience.list_*`, `shared.yes` / `shared.no`, demais `shared.*` para colunas).

| Tipo | Texto |
|------|--------|
| Títulos | Work experience · Roles and employers… |
| CTA | Add experience · Search experience… |
| Colunas remotas etc. | Title, Company, Description, Remote, From, To, Skills |
| Células | Yes / No |
| Diálogo | Delete work experience? |

---

### [`work-experience.tsx`](../app/routes/work-experience.tsx)

**Status:** ✅ formulário CRUD migrado (`work_experience.*`, `shared.*`, `entity.work_experience`). Textos padrão do **`WorkExperienceSkillFieldset`** podem ainda estar no componente.

| Tipo | Texto |
|------|--------|
| Títulos / crumbs | Edit/New work experience · Loading work experience… |
| Card descrições | Update position… / Add role… |
| Labels | Title, Company name, Description (placeholder longo responsibilities…), Remote, Date from/to |
| Subtext | Loading skills… |
| **`WorkExperienceSkillFieldset`** | textos dentro do componente |

---

### [`resumes.tsx`](../app/routes/resumes.tsx)

**Status:** ✅ migrado (lista em cards + `resumes.*` + `shared.*`; resumo por card via `work_exp_count`, `cert_count`, etc.).

| Tipo | Texto |
|------|--------|
| Listing | Resumes · Saved CV versions… · Import PDF · Add resume |
| Erro + Retry | Could not load data. |
| Stats | Showing X of Y · N saved |
| Busca | Search resumes… |
| Loading | Loading resumes… |
| Vazio | No resumes yet. · Add your first resume |
| Card descrição | Updated {{date}}{{roleSuffix}} |
| Contagem ítens | {{n}} work experiences · certifications · education · skills (frase inteira interpolada) |
| Botões card | Delete · Duplicate (`aria-label` com nome) · Edit (`sr-only`) |
| Diálogo | Delete resume? · Removes saved resume |

---

### [`resume.tsx`](../app/routes/resume.tsx)

**Status:** ✅ rota migrada para `pages.resume.*`, `shared.*`, `roles.add` (aria + cargo), `entity.resume`; opções de idioma do currículo via `resume.output_lang.*`. **Pendente / fora desta rota:** textos dentro de `ResumeDescriptionAiDialog`, `ResumeCompileMarkdownDialog`, `ResumeCompiledDownloadMenu`, `QuickAdd*Dialog` (continuam nos respectivos componentes).

Conjunto **grande**. Destaques:

| Tipo | Texto |
|------|--------|
| Erros página | Could not load resume data. · Could not save resume. · Something went wrong. |
| Loading | Loading… |
| Estado not_found | Resume not found (title + Card) · CardDescription · Back to resumes |
| Crumb | Not found |
| Card descrições | dois parágrafos longos create vs edit |
| Labels / campos | Resume language · placeholder Language for generated resume · FieldDescription longo inglês · Title · placeholder e.g. Full stack · Description · Generate with AI · Role · placeholders Select one role · Nenhum cargo cadastrado. (**PT**) |
| Ajuda campo role | FieldDescription EN + texto destaque erro EN |
| `ResumeLinkedMultiFieldset` múltiplos | legends EN + mensagens PT vazios (**mistura idiomática** — priorizar unificar para chaves i18n) |
| **`WorkExperienceSkillFieldset`** | emptyMessage / emptyHint em PT na rota |
| Rodapé | Cancel (`aria-label`) · Saving… Save/Save changes · `Resume` fallback para título vazio |
| Diálogo quick-add WE | props **emptySkillsMessage**/**Hint** PT |
| `PostSaveDialog` | entityLabel Resume |

**Lib compartilhada:** [`app/lib/resume-preferred-language.ts`](../app/lib/resume-preferred-language.ts) — labels English, Português (Brasil), Español nos options do currículo (alinhar ao i18n e a possível página “Meus dados”).

---

### [`my-data.tsx`](../app/routes/my-data.tsx)

**Status:** ✅ migrado: título/layout em `common`, demais cópias e validações em `pages.my_data.*` + `shared.*` (cancel, saving, save_changes).

| Tipo | Texto |
|------|--------|
| Título + breadcrumbs | `common.my_data_title`, `breadcrumb_dashboard` |
| Formulário | `my_data.card_description`, `loading_profile`, campos OpenAI/endereço, etc. |

Mensagens de erro **`formErrorMessage`**: fallback `my_data.form_error_fallback` · `my_data.age_invalid` · `my_data.profile_not_loaded`.

---

### [`well-known.chrome-devtools.tsx`](../app/routes/well-known.chrome-devtools.tsx)

Sem texto de usuário na UI (`return null`).

---

## Componentes externos relevantes

Strings destes arquivos aparecem **nas páginas** das rotas; vale um segundo inventário (ou mover traduções para os parents via props):

| Componente | Rotas que afetam |
|------------|------------------|
| `OpportunityDialog`, `OpportunityFormFields`, Kanban boards, quick-add status | [`opportunities.tsx`](../app/routes/opportunities.tsx), [`opportunity.tsx`](../app/routes/opportunity.tsx) |
| `PostSaveDialog` | quase todas as telas novo/edit CRUD — ✅ strings do diálogo em `pages.post_save.*`; cada rota deve passar `entityLabel={t('entity.…')}` traduzido |
| `ListingPageHeader`, `ListingTableCard` | todas as listas (podem só receber `title` já traduzido) |
| `ResumeImportPdfDialog`, `ResumeCompiledDownloadMenu`, `ResumeCompileMarkdownDialog`, `ResumeDescriptionAiDialog` | [`resumes.tsx`](../app/routes/resumes.tsx), [`resume.tsx`](../app/routes/resume.tsx) |
| Dialogs QuickAdd* (`role`, work experience, cert, edu, skill) | [`resume.tsx`](../app/routes/resume.tsx) |
| Auth forms | login, register, recover, reset |
| `WorkExperienceSkillFieldset` | work-experience route, resume route |
| `NavUser`, `AppLayout` (se tiver strings internas) | todas as páginas com layout |

---

## Notas para implementação

1. **Prioridade:** unificar **PT/EN misturados** em [`resume.tsx`](../app/routes/resume.tsx) (`Nenhum cargo cadastrado.`, mensagens dos fieldsets).
2. **Constantes duplicadas:** níveis de idioma (**Beginner/Intermediate…**) aparecem em `languages.tsx` e `language.tsx` — uma única origem (`t('language_level.native')`, etc.).
3. **Pluralização:** stats `Showing …`, `… opportunit{y|ies}`, **End of list · record(s)** — usar pluralização ICU do i18next.
4. **Mensagens de API:** vindas do Rails em inglês ou traduzidas no backend — o inventário marca fallbacks apenas no cliente.
5. **Alinhamento com `preferred_language`:** após migração, garantir que opções iguais (ex. inglês/pt/es) **compartilhem chaves** entre `my-data`, `resume` e outros selects de língua.

---

*Gerado por varredura estática dos arquivos listados em `app/routes/`. Para manter atualizado ao adicionar rotas ou alterar JSX, repetir revisão nos diffs.*
