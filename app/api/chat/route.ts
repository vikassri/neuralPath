import { openai } from "@ai-sdk/openai"
import { streamText, convertToCoreMessages } from "ai"
import { getModuleBySlug } from "@/lib/modules"

export const maxDuration = 30

interface ChatMessage {
  role: "assistant" | "user"
  content: string
}

interface ChatRequest {
  messages: ChatMessage[]
  moduleSlug?: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isChatRequest(value: unknown): value is ChatRequest {
  if (!isRecord(value) || !Array.isArray(value.messages) || value.messages.length === 0 || value.messages.length > 50) {
    return false
  }
  if (value.moduleSlug !== undefined && (typeof value.moduleSlug !== "string" || value.moduleSlug.length > 100)) {
    return false
  }

  let totalContentLength = 0
  return value.messages.every((message): message is ChatMessage => {
    if (!isRecord(message)) return false
    if ((message.role !== "assistant" && message.role !== "user") || typeof message.content !== "string") {
      return false
    }

    totalContentLength += message.content.length
    return message.content.length <= 10_000 && totalContentLength <= 50_000
  })
}

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 })
  }

  if (!isChatRequest(body)) {
    return Response.json({ error: "Invalid chat request." }, { status: 400 })
  }

  const learningModule = body.moduleSlug ? getModuleBySlug(body.moduleSlug) : undefined
  const systemPrompt = learningModule
    ? learningModule.systemPrompt
    : "You are an expert AI/ML tutor. Answer questions clearly and accurately with practical examples."

  const result = await streamText({
    model: openai("gpt-4o-mini"),
    system: systemPrompt,
    messages: convertToCoreMessages(body.messages),
    temperature: 0.7,
    maxTokens: 1024,
  })

  return result.toDataStreamResponse()
}
