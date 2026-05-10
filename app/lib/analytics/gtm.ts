/**
 * Google Tag Manager — container do site público.
 *
 * O ID é público (visível no HTML que o navegador baixa), por isso fica
 * em código mesmo. Caso queira separar containers de prod/preview,
 * troque por `import.meta.env.VITE_GTM_ID` aqui.
 */
export const GTM_ID = "GTM-KPSFMJPB"

/**
 * Snippet oficial recomendado pelo Google: insere o `gtm.js` de forma
 * assíncrona e empilha o evento `gtm.start` no `dataLayer` para
 * pageviews. Deve ser executado o mais cedo possível dentro do `<head>`.
 */
export function gtmInlineScript(gtmId: string = GTM_ID): string {
  const id = JSON.stringify(gtmId)
  return (
    "(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':" +
    "new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0]," +
    "j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=" +
    "'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);" +
    `})(window,document,'script','dataLayer',${id});`
  )
}

export function gtmNoscriptIframeSrc(gtmId: string = GTM_ID): string {
  return `https://www.googletagmanager.com/ns.html?id=${gtmId}`
}
