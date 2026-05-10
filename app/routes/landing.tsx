import type { Route } from "./+types/landing"
import { LandingPage } from "~/components/landing/landing-page"
import { buildLandingMetaDescriptors } from "~/lib/seo/landing-seo"

/**
 * SEO da landing fica travado em inglês — UI continua multilíngue via i18next
 * (`entry.server.tsx` resolve o idioma para o render). Ver
 * `app/lib/seo/landing-seo.ts` para a justificativa e os tags emitidos.
 */
export function meta(_args: Route.MetaArgs) {
  return buildLandingMetaDescriptors()
}

export default function LandingRoute() {
  return <LandingPage />
}
