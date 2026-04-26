# Dados e integração com o backend

Voltar ao [índice](./README.md).

## Fonte da verdade hoje: `AppDataProvider`

O arquivo [`app/components/providers/app-data-provider.tsx`](../../app/components/providers/app-data-provider.tsx) concentra:

- Interfaces de domínio (`Company`, `Opportunity`, `ResumeDocument`, …).
- Estado em React + reducers/handlers para `add*`, `update*`, `delete*`.
- Persistência em **`localStorage`** com chave versionada (`job-vacancy-app-data-v4`) e migração a partir de chaves legadas.

Comentário relevante no código (resumo): as propriedades multi-palavra usam **`snake_case`** para alinhar ao contrato esperado de uma API Rails / JSON. Isso facilita portar os tipos TypeScript para o mesmo formato que `params` e serializers Ruby produzem.

## O que muda com Inertia

| Aspecto | Layout atual | Alvo Rails + Inertia |
|---------|----------------|----------------------|
| Lista de registros | `useAppData().companies` | Prop `companies` (ou `companies` paginado) no `render inertia` |
| Criação / edição | `addCompany` / `updateCompany` no cliente | `POST /companies`, `PATCH /companies/:id` no controller |
| Exclusão | `deleteCompany(id)` | `DELETE /companies/:id` ou formulário com `_method` |
| IDs | `crypto.randomUUID()` no cliente | `id` gerado pelo banco (bigint/uuid) no model |

## Serialização e strong parameters

- Prefira um contrato JSON **explícito** (Alba, `Blueprint`, hash manual) alinhado aos tipos já em `snake_case` no front deste repo.
- No controller, use **strong parameters** para mass assignment seguro; valide no model (`validates`).

Exemplo mental de props Inertia para o index de empresas:

```ruby
render inertia: "Companies/Index", props: {
  companies: CompanyBlueprint.render_as_hash(@companies, view: :list),
  flash: { notice: flash[:notice] }
}
```

Os nomes exatos dos componentes Inertia dependem da convenção do projeto (`Pages::` vs caminho de arquivo).

## Formulários

Neste repositório, os formulários usam `<form onSubmit={...}>` com estado local e chamadas síncronas ao Context.

No Inertia, o padrão recomendado é:

- **`<Form>`** do pacote Inertia React para POST/PATCH com tratamento de erros de validação, CSRF e redirects.
- Ou form HTML clássico com `data-turbo="false"` se o time não usar Turbo da mesma forma; siga a documentação do **inertia-rails** do seu projeto.

Mapeamento:

- `e.preventDefault()` + `addCompany(payload)` → submit que envia `company[name]`, `company[url]`, … ao Rails.
- Erros de validação → `errors` nas props ou no objeto de formulário, conforme versão do adapter; a UI pode reutilizar os mesmos componentes `Field` com `data-invalid` / `aria-invalid` (ver [04-ui-shadcn-e-padroes.md](./04-ui-shadcn-e-padroes.md)).

## Flash e feedback

Hoje não há equivalente a `flash[:notice]` centralizado; ações são instantâneas no mock.

No Rails:

- Use **`flash`** para mensagens de sucesso/erro após redirect.
- Exponha flash via **`inertia_share`** ou merge nas props para toasts (`sonner`) no layout.

Evite manter mensagens “para sempre” em props compartilhadas sem limpar; o flash Rails já é de um ciclo.

## `SessionUserProvider` e “meus dados”

[`session-user-provider.tsx`](../../app/components/providers/session-user-provider.tsx) guarda perfil em `localStorage` com campos em **camelCase** (`fullAddress`, `relationshipStatus`).

No Rails:

- O **User** (ou `Profile`) vem do banco; `Current.user` no request.
- Compartilhe um subconjunto seguro via Inertia (`user: current_user.as_json(only: [...])`) ou endpoint dedicado de perfil.
- Se quiser **snake_case** unificado no JSON, padronize serializers e ajuste os tipos TypeScript da página `my-data` na migração.

## Busca e scroll infinito (`useInfiniteScrollList`)

As listas (ex.: [`companies.tsx`](../../app/routes/companies.tsx)) filtram no cliente e usam [`useInfiniteScrollList`](../../app/hooks/use-infinite-scroll-list.ts) para “janelas” de itens.

Opções no backend:

1. **Paginação server-side** (`page`, `per`) com `Link` preservando query string ou `router.get` ao mudar filtro.
2. **`router.reload({ only: [:companies] })`** após mutações que alteram a lista, se usar partial reloads.
3. Manter infinite scroll **só no cliente** se todos os registros já vierem na prop (aceitável só para volumes pequenos); para muitos registros, prefira cursor/offset no servidor.

Documente a decisão no projeto alvo; o skill Inertia desaconselha um segundo cache tipo React Query para dados que já vêm por página.

## Partial reloads e dados relacionados

Quando uma tela precisa de várias coleções (empresas, cargos, status para o formulário de oportunidade), no Rails você pode:

- Carregar tudo na mesma action (simples).
- Usar **props deferidas / opcionais** (recursos inertia-rails) para não bloquear o primeiro paint.

Evite `useEffect` + `fetch` só para “completar” a página se o servidor puder enviar os dados na primeira visita.

## Anti-padrões (reforço)

1. Não reimplementar `AppDataProvider` como store global de CRUD no React quando o ActiveRecord já é a fonte da verdade.
2. Não confiar em “usuário logado” apenas no Context React; use sessão/cookie e `before_action :authenticate_user!` (ou equivalente).
3. Não usar `fetch` para submits de CRUD simples se `<Form>` Inertia atende redirect, erros e CSRF.

## Próximo passo

Padrões de UI e shadcn: [04-ui-shadcn-e-padroes.md](./04-ui-shadcn-e-padroes.md).
