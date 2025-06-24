import type { AIMessage } from '../types'
import { openai } from './ai'
import { zodFunction } from 'openai/helpers/zod.mjs';


export const runLLM = async ({
  messages, tools
}: { messages: AIMessage[], tools: any[] }) => {

  const formattedTools = tools.map(zodFunction) // Convert tools to the format expected by OpenAI

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.1, // how creative the response should be - value between 0 and 2
    messages,
    tools: formattedTools, // tools to use in the response
    tool_choice: 'auto', // auto or required
    parallel_tool_calls: false, // whether to call tools in parallel or sequentially
  }) 

  return response.choices[0].message
}