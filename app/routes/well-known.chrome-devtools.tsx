import type { Route } from "./+types/well-known.chrome-devtools"

/** Chrome DevTools faz GET neste URL; sem rota o servidor RR lança e pode derrubar o dev. */
export async function loader(_args: Route.LoaderArgs) {
  return Response.json(
    {},
    {
      status: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    }
  )
}

export default function WellKnownChromeDevtools() {
  return null
}
