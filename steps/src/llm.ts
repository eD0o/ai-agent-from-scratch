import { zodFunction } from 'openai/helpers/zod'
import { z } from 'zod'
import type { AIMessage } from '../types'
import { openai } from './ai'
import { systemPrompt } from './systemPrompt'

export const runLLM = async ({
  model = 'gpt-4o-mini',
  messages,
  temperature = 0.1,
  tools,
}: {
  messages: AIMessage[]
  temperature?: number
  model?: string
  tools?: { name: string; parameters: z.AnyZodObject }[]
}) => {
  const formattedTools = tools?.map((tool) => zodFunction(tool))
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.1, // how creative the response should be - value between 0 and 2
    messages: [{ role: 'system', content: systemPrompt }, ...messages], // messages to send to the model
    tools: formattedTools, // tools to use in the response
    tool_choice: 'auto', // auto or required
    parallel_tool_calls: false, // whether to call tools in parallel or sequentially
  })

  return response.choices[0].message
}