# UI, shadcn e padrões de composição

Voltar ao [índice](./README.md).

## Stack visual

- **Tailwind CSS v4** em [`app/app.css`](../../app/app.css) (`@import "tailwindcss"`, tokens de tema).
- **shadcn/ui** (estilo “nova” / Radix) em [`app/components/ui/`](../../app/components/ui/).
- **lucide-react** para ícones.

Ao portar para Rails, mantenha a mesma árvore `components/ui` para reduzir diffs; apenas ajuste o alias de import e o pipeline Vite conforme o template do projeto.

## Pastas de componentes (reuso direto)

| Pasta | Papel | Notas na migração |
|-------|--------|-------------------|
| `components/ui/` | Primitivos (Button, Card, Dialog, Field, Table, …) | Copiar/adaptar; seguir upgrades do shadcn com cuidado |
| `components/layout/` | `AppLayout`, sidebar, breadcrumbs, assistente | Persistent layout Inertia ou wrapper importado |
| `components/listing/` | Cabeçalho de lista, card com tabela, busca, sentinel de scroll | Continua “burro” em relação à origem dos dados: recebe props |
| `components/auth/` | Shell de páginas de auth e formulários | Actions Rails de sessão/registro |
| `components/shared/` | Ex.: `PostSaveDialog`, pickers compartilhados | Sem dependência de router específico quando possível |
| `components/opportunities/`, `resume/`, `work-experience/` | Domínio | Podem importar apenas `@inertiajs/react` para `Link`/`router` |

## Formulários: `Field`, `FieldGroup`, `FieldLabel`

As páginas de cadastro (ex.: [`company.tsx`](../../app/routes/company.tsx)) usam composição de **Field** do shadcn local, com **`flex flex-col gap-*`** (não `space-y-*`), alinhado às regras do projeto.

Na migração:

- Preserve a **acessibilidade** (`htmlFor`, `id`, `aria-invalid` quando houver erro).
- Mapeie erros Rails (`errors.full_messages` ou hash por campo) para `data-invalid` no `Field` e `aria-invalid` no controle, como já prevê o guia shadcn do repositório (`.agents/skills/shadcn`).

## Diálogos

- **Confirmação de exclusão:** `AlertDialog` nas páginas de listagem (ex.: companies).
- **Pós-cadastro:** [`post-save-dialog.tsx`](../../app/components/shared/post-save-dialog.tsx) pergunta se volta à lista ou cadastra outro; estado continua sendo React local — no Inertia, após `create` você pode **redirect** com flash em vez de dialog, ou manter o dialog com dados já persistidos (sem segunda gravação ao fechar).

Sempre inclua **título acessível** (`DialogTitle` / `AlertDialogTitle`); use `sr-only` se o design esconder o texto.

## Ícones em botões

O projeto segue o padrão **`data-icon="inline-start"`** (ou `inline-end`) no ícone dentro de `Button`, sem classes manuais de tamanho no ícone quando o componente já estiliza.

## Listagens e tabelas

Padrão típico:

- `ListingPageHeader` (título, descrição, ação “Add …” como `Button asChild` + `Link`).
- `ListingTableCard` (busca, stats, área scrollável).
- `Table` + ações por linha (editar, excluir).

No Inertia, `Link` aponta para rotas Rails nomeadas; URLs podem diferir ligeiramente das atuais (`/companies/company` → `/companies/new`).

## Regras do repositório

Existem regras em `.cursor/rules/` (por exemplo organização de componentes e convenção **snake_case** no banco). Este documento não as duplica: use-as como checklist ao gerar models e serializers no Rails.

## Próximo passo

Modelo de entidades e casos especiais (Kanban, FKs): [05-entidades-e-casos-especiais.md](./05-entidades-e-casos-especiais.md).
