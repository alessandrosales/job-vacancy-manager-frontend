import { PassThrough } from "node:stream"
import type { AppLoadContext, EntryContext } from "react-router"
import { createReadableStreamFromReadable } from "@react-router/node"
import { ServerRouter } from "react-router"
import { isbot } from "isbot"
import type { RenderToPipeableStreamOptions } from "react-dom/server"
import { renderToPipeableStream } from "react-dom/server"

import i18n, { awaitI18nReady } from "~/lib/i18n/config"
import { resolveRequestUiLanguage } from "~/lib/i18n/resolve-request-ui-language"

export const streamTimeout = 5_000

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  loadContext: AppLoadContext
) {
  if (request.method.toUpperCase() === "HEAD") {
    return new Response(null, {
      status: responseStatusCode,
      headers: responseHeaders,
    })
  }

  if (request.method === "GET") {
    try {
      const { pathname } = new URL(request.url)
      if (pathname === "/" || pathname === "") {
        console.error("[deploy-smoke] SSR GET /", new Date().toISOString())
      }
    } catch {
      /* ignore */
    }
  }

  return (async () => {
    await awaitI18nReady()
    await i18n.changeLanguage(resolveRequestUiLanguage(request))

    return await new Promise<Response>((resolve, reject) => {
      let shellRendered = false
      const userAgent = request.headers.get("user-agent")

      const readyOption: keyof RenderToPipeableStreamOptions =
        (userAgent && isbot(userAgent)) || routerContext.isSpaMode
          ? "onAllReady"
          : "onShellReady"

      let timeoutId: ReturnType<typeof setTimeout> | undefined = setTimeout(
        () => abort(),
        streamTimeout + 1_000
      )

      const { pipe, abort } = renderToPipeableStream(
        <ServerRouter context={routerContext} url={request.url} />,
        {
          [readyOption]() {
            shellRendered = true
            const body = new PassThrough({
              final(callback) {
                clearTimeout(timeoutId)
                timeoutId = undefined
                callback()
              },
            })
            const stream = createReadableStreamFromReadable(body)

            responseHeaders.set("Content-Type", "text/html")

            pipe(body)

            resolve(
              new Response(stream, {
                headers: responseHeaders,
                status: responseStatusCode,
              })
            )
          },
          onShellError(error: unknown) {
            reject(error)
          },
          onError(error: unknown) {
            responseStatusCode = 500
            if (shellRendered) {
              console.error(error)
            }
          },
        }
      )
    })
  })()
}
