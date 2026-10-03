import { openai } from "@ai-sdk/openai"
import { streamText, convertToCoreMessages } from "ai"
import { getModuleBySlug } from "@/lib/modules"

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages, moduleSlug } = await req.json()

  const module = getModuleBySlug(moduleSlug)

  const systemPrompt = module
    ? module.systemPrompt
    : "You are an expert AI/ML tutor. Answer questions clearly and accurately with practical examples."

  const result = await streamText({
    model: openai("gpt-4o-mini"),
    system: systemPrompt,
    messages: convertToCoreMessages(messages),
    temperature: 0.7,
    maxTokens: 1024,
  })

  return result.toDataStreamResponse()
}
