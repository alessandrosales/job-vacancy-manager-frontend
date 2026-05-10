import type { Route } from "./+types/landing"
import { LandingPage } from "~/components/landing/landing-page"
import landingEn from "~/locales/en/landing.json"
import landingEs from "~/locales/es/landing.json"
import landingPtBr from "~/locales/pt_br/landing.json"
import { resolveRequestUiLanguage } from "~/lib/i18n/resolve-request-ui-language"

export async function loader({ request }: Route.LoaderArgs) {
  console.error("[landing] loader (deploy smoke)", {
    url: request.url,
    at: new Date().toISOString(),
  })
  const lng = resolveRequestUiLanguage(request)
  const pack =
    lng === "pt_br" ? landingPtBr : lng === "es" ? landingEs : landingEn
  return pack.meta
}

export function meta({ data }: Route.MetaArgs) {
  if (!data) {
    return [{ title: "Hireest" }, { name: "description", content: "" }]
  }
  return [
    { title: data.title },
    { name: "description", content: data.description },
  ]
}

export default function LandingRoute() {
  return <LandingPage />
}
