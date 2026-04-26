# Rotas e páginas: `app/routes.ts` → Rails + Inertia

Voltar ao [índice](./README.md).

## Origem no repositório

As rotas estão declaradas em [`app/routes.ts`](../../app/routes.ts) usando a API `@react-router/dev/routes` (`index`, `route`). Cada string aponta para um módulo em `app/routes/`.

## Padrão `:id?` (new e edit na mesma página)

Várias rotas usam parâmetro opcional, por exemplo:

- `companies/company/:id?` → sem `id` é criação; com `id` é edição.

No Rails, o equivalente mais idiomático costuma ser **rotas separadas**:

- `GET /companies/new` + `POST /companies`
- `GET /companies/:id/edit` + `PATCH /companies/:id`

Manter **uma única** página Inertia para new/edit continua possível: o controller passa `company: nil` ou `company: {...}` e a página React ramifica como hoje com `Boolean(id)`.

## Tabela de mapeamento sugerida

A coluna “Sugestão Rails” é uma convenção REST comum; ajuste namespaces (`opportunities`, `settings`) ao domínio do produto.

| URL atual (path) | Arquivo da página | Sugestão Rails (verbos e path) | Notas |
|------------------|-------------------|-------------------------------|--------|
| `/` (index) | `routes/login.tsx` | `GET /login` → sessão; `POST /session` | Auth é server-side no Rails |
| `/home` | `routes/home.tsx` | `GET /home` ou redirect pós-login | |
| `/register` | `routes/register.tsx` | `GET /users/new`, `POST /users` | |
| `/recover-password` | `routes/recover-password.tsx` | fluxo de password reset Rails | |
| `/dashboard` | `routes/dashboard.tsx` | `GET /dashboard` | |
| `/opportunities` | `routes/opportunities.tsx` | `GET /opportunities` | Lista + Kanban na mesma view |
| `/opportunities/opportunity` ou `.../:id` | `routes/opportunity.tsx` | `GET/POST` new; `GET/PATCH` edit | Ver prop `id` |
| `/opportunities/statuses` | `routes/opportunity-statuses.tsx` | `GET /opportunity_statuses` ou nested | |
| `/opportunities/status` ou `.../:id` | `routes/opportunity-status.tsx` | CRUD de definição de status | |
| `/resumes` | `routes/resumes.tsx` | `GET /resumes` | |
| `/resumes/resume` ou `.../:id` | `routes/resume.tsx` | CRUD `Resume` | Relações N-N no servidor |
| `/companies` | `routes/companies.tsx` | `GET /companies` | |
| `/companies/company` ou `.../:id` | `routes/company.tsx` | CRUD `Company` | |
| `/roles` | `routes/roles.tsx` | `GET /roles` | |
| `/roles/role` ou `.../:id` | `routes/role.tsx` | CRUD `Role` | |
| `/skills` | `routes/skills.tsx` | `GET /skills` | |
| `/skills/skill` ou `.../:id` | `routes/skill.tsx` | CRUD `Skill` | |
| `/links` | `routes/links.tsx` | `GET /reference_links` | Nome do model a definir |
| `/links/link` ou `.../:id` | `routes/reference-link.tsx` | CRUD link | |
| `/work-experiences` | `routes/work-experiences.tsx` | `GET /work_experiences` | |
| `/work-experiences/work-experience` ou `.../:id` | `routes/work-experience.tsx` | CRUD + `skill_ids` | |
| `/certifications` | `routes/certifications.tsx` | `GET /certifications` | |
| `/certifications/certification` ou `.../:id` | `routes/certification.tsx` | CRUD | |
| `/educations` | `routes/educations.tsx` | `GET /educations` | |
| `/educations/education` ou `.../:id` | `routes/education.tsx` | CRUD | |
| `/my-data` | `routes/my-data.tsx` | `GET/PATCH /profile` ou `users#edit` | Perfil do usuário autenticado |

## Navegação

| Hoje | Inertia |
|------|---------|
| `import { Link } from "react-router"` | `import { Link } from "@inertiajs/react"` |
| `useNavigate()` + `navigate("/path")` | `import { router } from "@inertiajs/react"` → `router.visit("/path")` |
| `navigate(-1)` | `window.history.back()` ou link explícito para o index (preferível para UX previsível) |

Redirects após `create`/`update`/`destroy` vêm do **controller** (`redirect_to ...`) ou de resposta Inertia com `location`; evite duplicar regra de “para onde ir” só no React.

## `AppLayout`, breadcrumbs e título

Hoje [`AppLayout`](../../app/components/layout/app-layout.tsx) recebe `title`, `breadcrumbs` e envolve `SidebarProvider`, sidebar e conteúdo.

Opções no Inertia:

1. **Props compartilhadas** (`inertia_share`) com `breadcrumbs` e `title` calculados no controller ou helper.
2. **Layout persistente** que lê `usePage()` e monta o mesmo shell para todas as páginas autenticadas.
3. Manter `AppLayout` como componente React importado por cada página, passando props vindas do servidor.

A escolha afeta apenas organização; o importante é que **título e trilha** possam ser determinados no servidor quando fizer sentido para SEO ou consistência.

## Exemplo mínimo de correspondência mental

**React Router (hoje):** rota `companies/company/:id?` renderiza `CompanyPage`, que usa `useParams().id` para decidir `isEdit`.

**Rails + Inertia (alvo):**

- `CompaniesController#new` renderiza a mesma página com `company: null`.
- `CompaniesController#edit` renderiza com `company: CompanySerializer.new(@company).as_json`.

A página React pode permanecer quase idêntica, trocando `useParams` por `usePage().props.company` (ou nomes que o time padronizar).

## Próximo passo

Como essas páginas obtêm e alteram dados hoje: [03-dados-e-backend.md](./03-dados-e-backend.md).
