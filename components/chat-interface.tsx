"use client"

import { useRef, useEffect } from "react"
import type { FormEvent } from "react"
import { useChat } from "ai/react"
import { Send, Bot, User, Loader2, Sparkles, RefreshCw } from "lucide-react"

interface ChatInterfaceProps {
  moduleSlug: string
  moduleTitle: string
  suggestedQuestions?: string[]
}

export function ChatInterface({
  moduleSlug,
  moduleTitle,
  suggestedQuestions = [
    "Explain the key concept with an analogy I can remember",
    "What are the most common production pitfalls?",
    "Compare the main approaches and their tradeoffs",
    "Give me a concrete code example",
    "What should I learn next after this?",
  ],
}: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, input, handleInputChange, handleSubmit, append, isLoading, error, reload } = useChat({
    api: "/api/chat",
    body: { moduleSlug },
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content: `Hi! I'm your AI tutor for **${moduleTitle}**.\n\nAsk me anything — concepts, code examples, architecture tradeoffs, or real-world applications. I'll give you clear, practical answers.\n\nWhat would you like to explore?`,
      },
    ],
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    handleSubmit(e)
  }

  const handleSuggestionClick = (question: string) => {
    void append({ role: "user", content: question })
  }

  const hasUserMessages = messages.some((m) => m.role === "user")

  return (
    <div className="flex flex-col rounded-2xl overflow-hidden"
      style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-default)", height: "680px" }}>

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b flex-shrink-0"
        style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-elevated)" }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, var(--indigo), var(--cyan))" }}>
          <Sparkles size={14} className="text-white" />
        </div>
        <div>
          <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>AI Tutor</div>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>Expert in {moduleTitle}</div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {hasUserMessages && (
            <button onClick={() => reload()} title="Regenerate"
              className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
              style={{ color: "var(--text-muted)" }}>
              <RefreshCw size={13} />
            </button>
          )}
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>Live</span>
          </div>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {messages.map((message) => (
          <div key={message.id}
            className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
            {/* Avatar */}
            <div className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center mt-0.5"
              style={{
                background: message.role === "user"
                  ? "rgba(79,142,247,0.15)"
                  : "linear-gradient(135deg, var(--indigo), var(--cyan))",
              }}>
              {message.role === "user"
                ? <User size={13} style={{ color: "var(--blue)" }} />
                : <Bot  size={13} className="text-white" />}
            </div>

            {/* Bubble */}
            <div className={`max-w-[78%] px-4 py-3 rounded-2xl ${message.role === "user" ? "rounded-tr-sm" : "rounded-tl-sm"}`}
              style={message.role === "user"
                ? { backgroundColor: "rgba(79,142,247,0.1)", border: "1px solid rgba(79,142,247,0.2)", color: "var(--text-primary)", fontSize: "15px" }
                : { backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-body)", fontSize: "15px" }
              }>
              <div>
                {message.content.split(/(\*\*[^*]+\*\*|`[^`]+`|\n)/g).map((part, index) => {
                  if (part.startsWith("**") && part.endsWith("**")) {
                    return <strong key={index} style={{ color: "var(--text-primary)" }}>{part.slice(2, -2)}</strong>
                  }
                  if (part.startsWith("`") && part.endsWith("`")) {
                    return (
                      <code key={index} style={{
                        background: "var(--bg-elevated)",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontFamily: "monospace",
                        fontSize: "13px",
                        color: "var(--cyan)",
                      }}>
                        {part.slice(1, -1)}
                      </code>
                    )
                  }
                  return part === "\n" ? <br key={index} /> : part
                })}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, var(--indigo), var(--cyan))" }}>
              <Bot size={13} className="text-white" />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm"
              style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
              <div className="flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                <Loader2 size={13} className="animate-spin" />
                <span style={{ fontSize: "14px" }}>Thinking…</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="px-4 py-3 rounded-xl text-sm"
            style={{ backgroundColor: "rgba(251,113,133,0.07)", border: "1px solid rgba(251,113,133,0.2)", color: "#fca5a5" }}>
            <strong>Connection error.</strong> Add your <code className="px-1 rounded" style={{ background: "var(--bg-elevated)" }}>OPENAI_API_KEY</code> to{" "}
            <code className="px-1 rounded" style={{ background: "var(--bg-elevated)" }}>.env.local</code> and restart.
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Suggested questions ── */}
      {!hasUserMessages && (
        <div className="px-5 pt-3.5 pb-3 flex flex-wrap gap-2 flex-shrink-0"
          style={{ borderTop: "1px solid var(--border-subtle)" }}>
          {suggestedQuestions.map(q => (
          <button key={q} onClick={() => handleSuggestionClick(q)} disabled={isLoading}
              className="text-xs px-3 py-1.5 rounded-full transition-all hover:bg-white/5"
              style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-secondary)" }}>
              {q}
            </button>
          ))}
        </div>
      )}

      {/* ── Input ── */}
      <form id="chat-form" onSubmit={handleFormSubmit}
        className="flex items-center gap-3 px-5 py-3.5 border-t flex-shrink-0"
        style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-elevated)" }}>
        <input value={input} onChange={handleInputChange}
          placeholder={`Ask about ${moduleTitle}…`}
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: "var(--text-primary)", caretColor: "var(--indigo)", fontSize: "15px" }}
          disabled={isLoading} />
        <button type="submit" disabled={!input.trim() || isLoading}
          className="flex items-center justify-center w-8 h-8 rounded-xl transition-all disabled:opacity-30"
          style={{ background: input.trim() && !isLoading ? "linear-gradient(135deg,var(--indigo),var(--cyan))" : "var(--bg-elevated)" }}>
          <Send size={13} className="text-white" />
        </button>
      </form>
    </div>
  )
}
