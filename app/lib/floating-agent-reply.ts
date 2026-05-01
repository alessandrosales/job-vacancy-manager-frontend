/**
 * Local reply for the floating assistant (prototype).
 * Replace with an API / LLM call when a backend is available.
 */
export async function replyFromFloatingAgent(userMessage: string): Promise<string> {
  await new Promise((r) => setTimeout(r, 500 + Math.random() * 500))
  const trimmed = userMessage.trim()
  if (!trimmed) {
    return "Send a message to continue."
  }
  const preview =
    trimmed.length > 280 ? `${trimmed.slice(0, 280)}…` : trimmed
  return `Got your request:\n\n“${preview}”\n\n(This is a simulated reply. Wire up a real agent via API when ready.)`
}
