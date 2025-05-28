import type { AIMessage } from '../types'
import { openai } from './ai'


export const runLLM = async ({
  userMessage
}: { userMessage: string }) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.1, // how creative the response should be - value between 0 and 2
    messages: [
      { role: 'user', content: userMessage },
    ]
  })

  return response.choices[0].message.content
}