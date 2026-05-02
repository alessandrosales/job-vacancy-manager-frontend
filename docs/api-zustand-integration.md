# Integração com a API Rails e Zustand

Este guia descreve como o frontend (`job-vacancy-manager-layout`) conversa com o backend Rails (`job-vacancy-manager-backend`) e como o estado global é organizado com **Zustand**, para acelerar novas integrações.

## Visão geral

| Camada | Pasta principal | Responsabilidade |
|--------|-----------------|------------------|
| HTTP | `app/lib/api/` | URL base, JWT, JSON, erros Rails (`422`, etc.) |
| Recursos | `app/lib/api/resources/*.ts` | Um arquivo por domínio da API (`roles`, `auth`, …) |
| Estado global | `app/stores/` | JWT, perfil de sessão, sincronização com `/auth/me` |
| Bootstrap | `app/components/layout/authenticated-session-bootstrap.tsx` | Após reidratar o persist, chama `GET /auth/me` no layout autenticado |

Fluxo típico após login:

1. `POST /api/v1/auth/login` → guarda o JWT no store de auth (persist).
2. Navegação para rota com `AppLayout` → `AuthenticatedSessionBootstrap` espera `rehydrateAppStores()`, depois opcionalmente `GET /api/v1/auth/me` e atualiza o perfil no store de sessão.

---

## 1. Camada HTTP

Guia focado na pasta **`app/lib/api`** (estrutura, recursos, checklist): [`api-layer.md`](./api-layer.md).

### 1.1 Cliente (`app/lib/api/client.ts`)

- **`apiRequestJson<T>(options)`** — `GET` / `POST` / `PATCH` / `DELETE` com corpo JSON quando aplicável.
- **`query`** opcional — objeto com chaves **snake_case** (`paginated`, `page`, `per_page`) anexadas à URL.
- **`apiRequestNoContent(options)`** — respostas `204 No Content` ou sem corpo útil.
- **`path`** é sempre **relativo a** `/api/v1/` (ex.: `"roles"`, `"auth/me"`).
- **`auth: false`** — não envia `Authorization` (login, registro, recuperação de senha, etc.). Omitindo ou `true`, envia `Bearer` se existir token em memória (via `getAuthToken()` → store).

### 1.2 Erros (`app/lib/api/errors.ts`)

- Respostas Rails com **`{ errors: { campo: ["mensagem"] } }`** viram **`ApiError`** com `status` e `fieldErrors`.
- Nos componentes: `err instanceof ApiError` e leitura de `fieldErrors` / `base`.

### 1.3 URL base

- Variável **`VITE_API_BASE_URL`** (ex.: `http://localhost:3000`).
- Fallback no código: ver `app/lib/api-base-url.ts`.

---

## 2. Convenção **snake_case** (API e estado persistido)

Regra do projeto: propriedades que espelham o banco ou payloads Rails devem estar em **`snake_case`** (`full_address`, `reset_token`, `created_at`, …).

- Tipos em **`app/lib/api/resources/*`** e **`SessionUser`** em `app/stores/session-user-store.ts` seguem isso.
- Funções e variáveis locais em componentes podem continuar em camelCase.

---

## 3. Novo recurso na API (passo a passo)

1. **Confirmar no Rails** o path (`config/routes.rb`), método HTTP, envelope do JSON (`params.require(:role).permit(...)`, etc.) e formato de `as_api_json` no model.
2. **Criar** `app/lib/api/resources/<nome>.ts` (ex.: já existe `roles.ts`).
3. Definir interfaces TypeScript em **snake_case** alinhadas ao JSON.
4. Exportar funções finas que chamam apenas `apiRequestJson` / `apiRequestNoContent` — **sem** `fetch` solto no restante do app.

**Index REST (`GET` coleção):** no Rails, `Api::V1::Paginatable` responde por padrão com **`{ data, meta }`** (`meta`: `current_page`, `per_page`, `total_pages`, `total_count`). Com **`?paginated=false`** o corpo volta a ser um **array** cru. No frontend, tipos compartilhados e `toIndexQuery` ficam em `app/lib/api/pagination.ts`; cada `listX` usa overloads: chamada sem `paginated: false` → `PaginatedEnvelope<T>`; `listX({ paginated: false })` → `T[]`. Para lista completa em memória (ex.: selects), prefira `{ paginated: false }`.

Exemplo mínimo (lista autenticada alinhada ao backend atual):

```ts
import { apiRequestJson } from "~/lib/api/client"
import type { ApiIndexParams, PaginatedEnvelope } from "~/lib/api/pagination"
import { toIndexQuery } from "~/lib/api/pagination"

export interface ApiThing {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export async function listThings(params: { paginated: false }): Promise<ApiThing[]>
export async function listThings(
  params?: { paginated?: true; page?: number; per_page?: number }
): Promise<PaginatedEnvelope<ApiThing>>
export async function listThings(
  params?: ApiIndexParams
): Promise<PaginatedEnvelope<ApiThing> | ApiThing[]> {
  const query = toIndexQuery(params)
  if (params?.paginated === false) {
    return apiRequestJson<ApiThing[]>({
      path: "things",
      method: "GET",
      query,
    })
  }
  return apiRequestJson<PaginatedEnvelope<ApiThing>>({
    path: "things",
    method: "GET",
    query,
  })
}
```

5. No componente ou rota, importar **direto** do recurso (`~/lib/api/resources/things`) — evitar barrel `index.ts` que reexporta tudo (melhor para tree-shaking).

---

## 4. Zustand — stores existentes

### 4.1 Auth (`app/stores/auth-store.ts`)

- Estado: **`token`** (JWT).
- **`setToken` / `clearToken`** — também invalidam a marcação de sync do `/me` no store de sessão (novo login ou logout).
- **Persist** + **devtools** em desenvolvimento.

### 4.2 Sessão / perfil (`app/stores/session-user-store.ts`)

- Estado: **`user`** (`SessionUser`: campos de UI + `id`, `created_at`, `updated_at` vindos da API após `/me` ou após login/registro/troca de senha quando aplicável).
- **`me_synced_for_token`** — só em memória; evita chamar `/me` em toda troca de rota com o mesmo JWT.
- **`hydrateFromAuthMeResponse(token, apiUser)`** — mescla resposta de `ApiSessionUser` sem apagar campos extras de UI.
- **`rehydrateAppStores()`** (`app/stores/rehydrate-app-stores.ts`) — reidrata auth + session a partir do `localStorage` uma vez por carga (Promise compartilhada).

### 4.3 Logout

- **`clearAuthSession()`** (`app/stores/clear-auth-session.ts`) — limpa token e reseta perfil.

---

## 5. Layout autenticado e `/auth/me`

- **`SessionUserProvider`** (`app/components/providers/session-user-provider.tsx`) chama `rehydrateAppStores()` no mount.
- **`AuthenticatedSessionBootstrap`** dentro de **`AppLayout`** aguarda `rehydrateAppStores()`, lê o token, e se ainda não houve sync para esse token, chama **`fetchAuthMe`** e **`hydrateFromAuthMeResponse`**. Em **`401`**, faz logout e redireciona para `/`.

Ao implementar uma tela que **não** usa `AppLayout`, não há bootstrap automático do `/me`; nesse caso você pode chamar `fetchAuthMe` manualmente ou reutilizar o mesmo padrão em um wrapper cliente.

---

## 6. Quando criar um **novo** store Zustand

Use quando precisar de estado **global** além de auth + perfil (ex.: cache de filtros, wizard multi-etapa, flags de feature).

1. Criar `app/stores/<nome>-store.ts`.
2. Preferir **`persist`** só se o dado deve sobreviver ao refresh; definir **`version`** e `partialize` para não persistir caches grandes ou dados sensíveis sem necessidade.
3. Em desenvolvimento, opcionalmente envolver com **`devtools`** e `name` descritivo (como nos stores atuais).
4. Evitar **importar** o cliente HTTP dentro do store se isso gerar **dependência circular** (ex.: cliente → `auth-token` → auth store). Nesse caso, faça o **fetch no componente** ou num módulo `~/lib/...` que não feche o ciclo, e o store só guarda o resultado.

O **`AppDataProvider`** (Kanban / dados locais) ainda é Context + `localStorage`; integrações futuras podem migrar trechos para Zustand seguindo o mesmo padrão de persist/versionamento.

---

## 7. Formulários e mutações

- **`method="post"`** no `<form>` e **`preventDefault` + `stopPropagation`** no submit para não navegar de forma nativa.
- Para rotas públicas da API, use **`auth: false`** nas funções do recurso.
- Sucesso com JWT: **`setAuthToken`** +, se a resposta já trouxer `user`, **`hydrateFromAuthMeResponse`** para não depender de um segundo round-trip.

Referências no código: `login-form.tsx`, `register-form.tsx`, `recover-password-form.tsx`, `reset-password-form.tsx`.

---

## 8. Checklist rápido

- [ ] Recurso novo em `app/lib/api/resources/<domínio>.ts` com tipos snake_case.
- [ ] Chamadas apenas via `apiRequestJson` / `apiRequestNoContent`.
- [ ] Rotas públicas com `auth: false`.
- [ ] Erros tratados com `ApiError`.
- [ ] Formulários sem submit HTML “cru”.
- [ ] Se afetar sessão: token/perfil via stores existentes; logout com `clearAuthSession`.

---

## 9. Referências no repositório

| Tópico | Arquivo |
|--------|---------|
| Cliente HTTP | `app/lib/api/client.ts` |
| Paginação / envelope index | `app/lib/api/pagination.ts` |
| Erros | `app/lib/api/errors.ts` |
| Auth + `/me` | `app/lib/api/resources/auth.ts` |
| Exemplo REST CRUD | `app/lib/api/resources/opportunities.ts` |
| Auth store | `app/stores/auth-store.ts` |
| Session store | `app/stores/session-user-store.ts` |
| Reidratação | `app/stores/rehydrate-app-stores.ts` |
| Bootstrap `/me` | `app/components/layout/authenticated-session-bootstrap.tsx` |

Para convenções de pastas de componentes, ver `.cursor/rules/component-organization.mdc`.
