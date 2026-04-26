# Entidades de domínio e casos especiais

Voltar ao [índice](./README.md).

## Onde estão definidas

Tipos e estado inicial estão em [`app/components/providers/app-data-provider.tsx`](../../app/components/providers/app-data-provider.tsx). Labels e enums de oportunidade em [`app/lib/labels.ts`](../../app/lib/labels.ts). Seeds para desenvolvimento mock em [`app/lib/mock-seed.ts`](../../app/lib/mock-seed.ts).

## Entidades principais (resumo)

| Entidade (TS) | Campos / relações notáveis | Models Rails sugeridos |
|---------------|----------------------------|-------------------------|
| `Company` | `name`, `url`, `description`, `interest_level` | `Company` |
| `Role` | idem estrutura similar a Company | `Role` |
| `Skill` | `name`, `description` | `Skill` |
| `ReferenceLink` | `title`, `url` | `ReferenceLink` ou `Bookmark` |
| `WorkExperience` | `company_name`, `is_remote`, datas, **`skill_ids`** (N-N) | `WorkExperience`, `join_table` work_experience_skills |
| `Certification` | `name`, `date_from`, `date_to` | `Certification` |
| `Education` | `institution_name`, `degree`, `field_of_study`, datas | `Education` |
| `ResumeDocument` | `role_id` (1), arrays **`work_experience_ids`**, `certification_ids`, `education_ids`, `skill_ids`, `updated_at` | `Resume` + associações `has_many :through` ou HABTM |
| `Opportunity` | **`company_id`**, **`role_id`**, `url`, `description`, **`status`**, `interest_level`, **`board_column_id`** opcional | `Opportunity`, FKs para Company/Role, status |
| `OpportunityStatusDefinition` (em labels/provider) | `label`, `description`, **`variant`** (badge) | `OpportunityStatus` ou coluna em pipeline |
| `KanbanCustomColumn` | colunas extras do board | tabela dedicada ou config JSON versionada |

Nomes de tabelas no Rails devem seguir **snake_case** pluralizado; o repositório já nomeia atributos em JSON no mesmo padrão para a maior parte das entidades.

## Oportunidades e Kanban

- A UI em `components/opportunities/` e rotas `opportunities*` mistura **lista**, **diálogo de criação** e **board Kanban** (dnd-kit).
- `board_column_id` permite que um card fique em uma coluna customizada; caso contrário deriva do `status`.

No Rails:

- **Mover card** entre colunas costuma ser `PATCH` parcial (`update` só de `board_column_id` ou `status`) ou endpoint dedicado `Opportunities::MovesController#create` (padrão “resource controller para mudança de estado”, alinhado a boas práticas Rails).
- Após mover, prefira **redirect/partial reload** para sincronizar props em vez de manter dois estados (servidor + otimista) sem reconciliação.

## Status de oportunidade

Definições editáveis (`opportunity-status.tsx`, lista em `opportunity-statuses.tsx`) impactam colunas do Kanban e valores de `Opportunity#status`. No backend, trate **id estável** (como no comentário da página de status) para não quebrar FKs: migrations cuidadosas ao renomear/remover estágios.

## `mock-seed` e `localStorage`

- `generateLargeMockDataset` e chaves `job-vacancy-app-data-v*` existem para **protótipo local**.
- No Rails, use **seeds** (`db/seeds.rb`) ou **fixtures** em testes; não persista domínio crítico só em `localStorage`.

## Currículo (`ResumeDocument`) e IA

- O formulário de resume agrega várias coleções e inclui diálogo de “gerar descrição com IA” ([`resume-description-ai-dialog.tsx`](../../app/components/resume/resume-description-ai-dialog.tsx)).
- No produto Rails, a chamada a um modelo de linguagem deve ser **endpoint dedicado** (job ou controller API) com autenticação, limites e auditoria — fora do ciclo Inertia padrão de props, conforme a matriz “quando precisa de API separada” no skill Inertia.

## Checklist rápido de migração por entidade

1. Criar model + migração + associações.
2. Controller REST (ou aninhado) com strong params alinhados aos nomes `snake_case` do TypeScript atual.
3. Página Inertia: copiar JSX de `app/routes/<entidade>.tsx`, trocar `useAppData` por `usePage().props`.
4. Testes de request/controller para `create`/`update`/`destroy` e políticas.

Fim do pacote `docs/rails-integration/`.
