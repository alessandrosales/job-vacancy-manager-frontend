/**
 * Resposta local para o assistente flutuante (protótipo).
 * Substitua por chamada a API / LLM quando houver backend.
 */
export async function replyFromFloatingAgent(userMessage: string): Promise<string> {
  await new Promise((r) => setTimeout(r, 500 + Math.random() * 500))
  const trimmed = userMessage.trim()
  if (!trimmed) {
    return "Envie uma mensagem para continuar."
  }
  const preview =
    trimmed.length > 280 ? `${trimmed.slice(0, 280)}…` : trimmed
  return `Recebi o seu pedido:\n\n“${preview}”\n\n(Isto é uma resposta simulada. Conecte um agente real via API quando estiver pronto.)`
}
