"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"

import { replyFromFloatingAgent } from "~/lib/floating-agent-reply"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Textarea } from "~/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip"
import { BotIcon, Loader2Icon, SendIcon } from "lucide-react"
import { cn } from "~/lib/utils"
import { pagesI18nNs } from "~/lib/i18n/config"

type ChatRole = "user" | "assistant"

type ChatMessage = {
  id: string
  role: ChatRole
  content: string
}

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function FloatingAgentAssistant() {
  const { t } = useTranslation(pagesI18nNs)
  const [open, setOpen] = React.useState(false)
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [draft, setDraft] = React.useState("")
  const [pending, setPending] = React.useState(false)
  const listRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return
    const el = listRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, open, pending])

  async function sendMessage() {
    const text = draft.trim()
    if (!text || pending) return
    setDraft("")
    const userMsg: ChatMessage = { id: createId(), role: "user", content: text }
    setMessages((m) => [...m, userMsg])
    setPending(true)
    try {
      const reply = await replyFromFloatingAgent(text)
      setMessages((m) => [
        ...m,
        { id: createId(), role: "assistant", content: reply },
      ])
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            size="icon-lg"
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-label={t("agent.fab_aria")}
            className={cn(
              "fixed end-4 bottom-20 z-40 size-11 rounded-full shadow-lg sm:end-6 sm:bottom-6 sm:size-14",
              "ring-2 ring-background/80 hover:shadow-md"
            )}
            onClick={() => setOpen(true)}
          >
            <BotIcon className="size-5 sm:size-6" aria-hidden />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-[12rem]">
          {t("agent.tooltip")}
        </TooltipContent>
      </Tooltip>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton
          className="flex max-h-[min(90vh,560px)] max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
        >
          <div className="flex flex-col gap-3 border-b border-border p-4 pb-3">
            <DialogHeader className="gap-1">
              <DialogTitle>{t("agent.title")}</DialogTitle>
              <DialogDescription>{t("agent.description")}</DialogDescription>
            </DialogHeader>
          </div>

          <div
            ref={listRef}
            className="min-h-44 flex-1 space-y-3 overflow-y-auto p-4"
            role="log"
            aria-live="polite"
            aria-relevant="additions"
          >
            {messages.length === 0 ? (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t("agent.empty_thread")}
              </p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[min(100%,28rem)] rounded-xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    )}
                  >
                    {msg.role === "assistant" ? (
                      <span className="block pb-1 text-xs font-medium text-muted-foreground">
                        {t("agent.reply_label")}
                      </span>
                    ) : null}
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            {pending ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2Icon
                  className="size-3.5 shrink-0 animate-spin"
                  aria-hidden
                />
                {t("agent.replying")}
              </div>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-col gap-2 border-t border-border bg-muted/30 p-3">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t("agent.placeholder")}
              rows={3}
              disabled={pending}
              className="min-h-0 resize-none"
              onKeyDown={(e) => {
                if (e.key !== "Enter" || e.shiftKey) return
                e.preventDefault()
                void sendMessage()
              }}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpen(false)}
              >
                {t("agent.close")}
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={pending || !draft.trim()}
                onClick={() => void sendMessage()}
              >
                {pending ? (
                  <Loader2Icon
                    className="size-4 animate-spin"
                    data-icon="inline-start"
                    aria-hidden
                  />
                ) : (
                  <SendIcon data-icon="inline-start" aria-hidden />
                )}
                {t("agent.send")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
