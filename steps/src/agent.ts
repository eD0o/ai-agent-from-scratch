import type { AIMessage } from '../types'
import { runLLM } from './llm'
import { addMessages, getMessages, saveToolResponse } from './memory'
import { runTool } from './toolRunner'
import { logMessage, showLoader } from './ui'

export const runAgent = async ({
  userMessage,
  tools // tools are functions that the agent can call
}: {
  userMessage: string, tools: any[]
}) => {
  await addMessages([
    {
      role: 'user',
      content: userMessage,
    },
  ])

  const loader = showLoader('🤔')

  const history = await getMessages()
  const response = await runLLM({
    messages: history,
    tools,
  })

  await addMessages([response])

  if (response.tool_calls) {
    const toolCall = response.tool_calls[0]
    loader.update(`executing tool: ${toolCall.function.name}`)
    const toolResponse = await runTool(toolCall, userMessage)
    await saveToolResponse(toolCall.id, toolResponse)
    loader.update(`done: ${toolCall.function.name}`)
  }

  logMessage(response)
  loader.stop()
  return getMessages()
}
