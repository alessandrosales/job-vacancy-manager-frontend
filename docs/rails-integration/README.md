# Integração Rails + Inertia a partir deste layout

Este pacote documenta a **estrutura e os padrões** da pasta `app/` deste repositório (React Router v7, estado mock em Context, shadcn/ui) e como **mapear** para um projeto **Ruby on Rails** com **Inertia.js**, **React** e **shadcn**, sem assumir que o backend já existe.

## Objetivo

- Servir de **referência de migração**: o que hoje vive no cliente vira props, rotas Rails e respostas Inertia.
- Alinhar decisões ao modelo **server-driven** do Inertia (dados e auth no servidor, navegação via Inertia, formulários com `<Form>` onde aplicável).

## Pré-requisitos no projeto alvo

- Rails 7.1+ (ou versão adotada pelo time) com **inertia-rails** (ou stack equivalente documentada pelo time).
- Bundler de front-end (Vite + `inertia_rails` ou convênção do gerador) e React.
- shadcn/ui (ou componentes já portados) compatíveis com a versão de Tailwind do projeto Rails.

## Índice dos documentos

| Documento | Descrição |
|-----------|-----------|
| [01-estrutura-app.md](./01-estrutura-app.md) | Organização de `app/`, alias `~/`, providers e fluxo de renderização. |
| [02-rotas-e-paginas.md](./02-rotas-e-paginas.md) | `app/routes.ts` → rotas Rails, actions e páginas Inertia. |
| [03-dados-e-backend.md](./03-dados-e-backend.md) | Substituição de `useAppData` / `SessionUserProvider` por props, forms e flash. |
| [04-ui-shadcn-e-padroes.md](./04-ui-shadcn-e-padroes.md) | Pastas de UI, layout, listagens e padrões a preservar. |
| [05-entidades-e-casos-especiais.md](./05-entidades-e-casos-especiais.md) | Modelo de domínio, FKs, Kanban e oportunidades. |

## Tabela-resumo: conceito atual → equivalente Rails / Inertia

| Neste repositório | No projeto Rails + Inertia |
|-------------------|----------------------------|
| `app/routes.ts` + arquivos em `app/routes/` | `config/routes.rb` + controllers + `render inertia: "NomeDaPagina", props: {...}` |
| `Link` / `useNavigate` do `react-router` | `Link` / `router.visit` de `@inertiajs/react` |
| `useParams()` (`:id?` para new/edit) | Rotas distintas (`/companies/new`, `/companies/:id/edit`) ou um único form com prop `company` opcional — decisão de roteamento Rails |
| `useAppData()` (Context + `localStorage`) | Props por página + models ActiveRecord; **não** replicar como store global de domínio |
| `SessionUserProvider` + `localStorage` | `Current.user` + `inertia_share` ou props explícitas na resposta |
| `handleSubmit` + `add*` / `update*` / `delete*` em memória | `create` / `update` / `destroy` no controller + `<Form>` ou redirect com flash |
| `root.tsx` (providers globais) | Layout Inertia persistente + partials compartilhados conforme documentação inertia-rails |
| Tipos com atributos `snake_case` | Manter o mesmo contrato JSON (Alba, `as_json`, strong params) |

## Anti-padrões na migração

1. **Não** portar `AppDataProvider` como fonte única da verdade no Rails: isso duplica o que o ActiveRecord e a resposta Inertia já resolvem.
2. **Não** usar `useEffect` + `fetch` para carregar dados da página quando o Inertia já entrega props na visita (evita estado obsoleto e duplica ciclo de vida).
3. **Não** substituir envio de formulário por `fetch`/`axios` onde `<Form>` do Inertia cobre CSRF, erros de validação e redirects.
4. Conferir auth e políticas **no servidor**; estado de “logado” só no React não substitui `before_action` e políticas no Rails.

## Leitura complementar no repositório

- Skill interna: [inertia-rails-architecture/SKILL.md](../../.agents/skills/inertia-rails-architecture/SKILL.md) (matriz de decisão Inertia vs padrões SPA).
- Código-fonte principal: [`app/routes.ts`](../../app/routes.ts), [`app/root.tsx`](../../app/root.tsx), [`app/components/providers/app-data-provider.tsx`](../../app/components/providers/app-data-provider.tsx).
