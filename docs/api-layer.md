# Camada HTTP (`app/lib/api`)

Este documento é o **contrato de implementação** dos clientes da API Rails (`/api/v1/...`). Ao adicionar ou alterar integrações, siga estes arquivos e convenções para manter o código previsível e fácil de revisar.

Para fluxo de autenticação, Zustand e bootstrap de sessão, ver também [`api-zustand-integration.md`](./api-zustand-integration.md).

---

## Estrutura de pastas

| Caminho | Função |
|---------|--------|
| [`app/lib/api/client.ts`](../app/lib/api/client.ts) | `fetch` centralizado: URL base, JWT, JSON, query string |
| [`app/lib/api/errors.ts`](../app/lib/api/errors.ts) | `ApiError`, parsing de `{ errors: ... }` do Rails |
| [`app/lib/api/pagination.ts`](../app/lib/api/pagination.ts) | Tipos e `toIndexQuery` para `index` paginado |
| [`app/lib/api/resources/*.ts`](../app/lib/api/resources/) | Um arquivo por **domínio** da API (funções finas por endpoint) |

**Base URL:** [`app/lib/api-base-url.ts`](../app/lib/api-base-url.ts) (`VITE_API_BASE_URL`).  
**Token:** [`app/lib/auth-token.ts`](../app/lib/auth-token.ts) (delega ao store quando aplicável).

---

## Cliente (`client.ts`)

- Use apenas **`apiRequestJson<T>`** para corpo JSON (incluindo `DELETE` com corpo, se existir).
- Use **`apiRequestNoContent`** quando a resposta de sucesso for **`204`** ou sem corpo relevante.
- **`path`:** sempre relativo a `/api/v1/` — ex.: `"roles"`, `"opportunities/uuid"`, `"auth/login"`.
- **`query`:** objeto opcional; chaves em **snake_case** (`paginated`, `page`, `per_page`) para coincidir com `params` do Rails.
- **`auth: false`** em rotas públicas (registro, login, recuperação de senha, etc.). Omitido → envia `Bearer` se houver token.
- **`signal`:** opcional; útil para cancelar requisições ao desmontar componentes ou trocar filtro.

Não use `fetch` direto em componentes para endpoints da API da aplicação — encapsule no recurso correspondente.

---

## Erros (`errors.ts`)

- Falhas HTTP viram **`ApiError`** com `status` e **`fieldErrors`** (`Record<string, string[]>`, chaves alinhadas ao JSON Rails).
- Em UI: `catch (e) { if (e instanceof ApiError) { … } }` e leia `fieldErrors.base` ou campos específicos (ex.: `email`).
- Respostas sem objeto `errors` utilizável recebem mensagem genérica em `fieldErrors.base`.

---

## Paginação e `GET index` (`pagination.ts`)

O backend usa `Api::V1::Paginatable`:

- **Padrão:** corpo `{ data: T[], meta: { current_page, per_page, total_pages, total_count } }`.
- **`?paginated=false`:** corpo é um **array** `T[]` (lista completa no servidor).

No frontend:

- Tipos: **`PaginatedEnvelope<T>`**, **`PaginationMeta`**, **`ApiIndexParams`**.
- **`toIndexQuery(params)`** monta o objeto passado em **`options.query`** do cliente.

Cada recurso com coleção expõe **`listX`** com overloads:

- `listX()` ou `listX({ page?, per_page? })` → `Promise<PaginatedEnvelope<ApiX>>`
- `listX({ paginated: false })` → `Promise<ApiX[]>` (útil para selects ou sincronizar tudo em memória)

---

## Recursos (`resources/`): padrão por arquivo

### 1. Um arquivo por domínio

Nome do arquivo em **kebab-case** espelhando a rota quando fizer sentido: `work-experiences.ts`, `opportunity-statuses.ts`, `reference-links.ts`.

### 2. Tipos de entidade em snake_case

Interfaces que espelham `as_api_json` / tabela devem usar **`snake_case`** nas propriedades (`created_at`, `company_id`, `password_confirmation` nos payloads, etc.), conforme regra do projeto.

### 3. Funções exportadas

Convenção sugerida (ajuste ao que o Rails expõe):

| Função | HTTP | Observação |
|--------|------|------------|
| `listX` | `GET` `collection` | Overloads paginado / `paginated: false` |
| `getX` | `GET` `collection/:id` | |
| `createX` | `POST` | Corpo aninhado `{ thing: payload }` como no Rails |
| `updateX` | `PATCH` | Idem |
| `deleteX` | `DELETE` | Preferir `apiRequestNoContent` se `204` |

Rotas aninhadas (ex.: currículo → skills) continuam no mesmo arquivo do recurso “pai” ou no domínio que o backend agrupa — veja [`resumes.ts`](../app/lib/api/resources/resumes.ts).

### 4. Auth e payloads especiais

- Endpoints que não devem enviar JWT: **`auth: false`**.
- Quando a resposta não for um tipo estável (ex.: login), pode-se usar `apiRequestJson<unknown>` e validar com um parser local (como **`parseAuthSessionPayload`** em [`auth.ts`](../app/lib/api/resources/auth.ts)).

### 5. Imports no restante do app

- Importe **direto** do arquivo do recurso, por exemplo:

  `import { listRoles } from "~/lib/api/resources/roles"`

- **Não** crie `app/lib/api/resources/index.ts` que reexporte tudo — isso prejudica tree-shaking e agrupa dependências sem necessidade (boas práticas de bundle).

---

## Checklist para um recurso novo

1. Confirmar no Rails: rota, verbos HTTP, nome da chave raiz no JSON (`role`, `opportunity`, …), formato de erros e se o `index` usa paginação.
2. Criar `app/lib/api/resources/<domínio>.ts`.
3. Definir `ApiThing` / `ApiThingWrite` (campos permitidos em create/update) em snake_case.
4. Implementar operações só com **`apiRequestJson`** / **`apiRequestNoContent`** + **`toIndexQuery`** no `list`.
5. Tratar erros na UI com **`ApiError`**.
6. Em formulários, evitar submit nativo da página; usar `preventDefault` e estas funções.

---

## Referência rápida de arquivos

| Arquivo | Exemplo de uso |
|---------|----------------|
| [`roles.ts`](../app/lib/api/resources/roles.ts) | CRUD simples + `listRoles` paginado |
| [`opportunities.ts`](../app/lib/api/resources/opportunities.ts) | Mesmo padrão para entidade principal |
| [`auth.ts`](../app/lib/api/resources/auth.ts) | `auth: false`, parsing de sessão |
| [`passwords.ts`](../app/lib/api/resources/passwords.ts) | Mutations públicas relacionadas a senha |
| [`resumes.ts`](../app/lib/api/resources/resumes.ts) | Rotas aninhadas + `sync*` |

---

## Manutenção deste guia

Ao mudar o contrato global (novo header, versão da API, formato de paginação), atualize **`client.ts`**, **`pagination.ts`** ou este documento na mesma alteração para quem implementar recursos novos não divergir do padrão.
