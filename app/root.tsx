import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useLoaderData,
} from "react-router"

import type { Route } from "./+types/root"
import {
  GTM_ID,
  gtmInlineScript,
  gtmNoscriptIframeSrc,
} from "~/lib/analytics/gtm"
import { AppDataProvider } from "~/components/providers/app-data-provider"
import { SessionUserProvider } from "~/components/providers/session-user-provider"
import { preferredLanguageToHtmlLang } from "~/lib/i18n/preferred-language"
import { resolveRequestUiLanguage } from "~/lib/i18n/resolve-request-ui-language"
import { themeBootstrapInlineScript } from "~/lib/theme"
import { TooltipProvider } from "~/components/ui/tooltip"
import "./app.css"

export async function loader({ request }: Route.LoaderArgs) {
  const lng = resolveRequestUiLanguage(request)
  return { htmlLang: preferredLanguageToHtmlLang(lng) }
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { htmlLang } = useLoaderData<typeof loader>()
  return (
    <html lang={htmlLang} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          dangerouslySetInnerHTML={{
            __html: gtmInlineScript(),
          }}
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" href="/icon-p.png" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta
          name="theme-color"
          content="#ffffff"
          media="(prefers-color-scheme: light)"
        />
        <meta
          name="theme-color"
          content="#0a0a0a"
          media="(prefers-color-scheme: dark)"
        />
        <Meta />
        <Links />
        <script
          dangerouslySetInnerHTML={{
            __html: themeBootstrapInlineScript(),
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <noscript>
          <iframe
            src={gtmNoscriptIframeSrc()}
            title={`Google Tag Manager (${GTM_ID})`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <TooltipProvider>
          <AppDataProvider>
            <SessionUserProvider>{children}</SessionUserProvider>
          </AppDataProvider>
        </TooltipProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!"
  let details = "An unexpected error occurred."
  let stack: string | undefined

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error"
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message
    stack = error.stack
  }

  return (
    <main className="container mx-auto p-4 pt-16">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full overflow-x-auto p-4">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  )
}
