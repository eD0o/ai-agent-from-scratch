import 'dotenv/config'
import { runAgent } from './src/agent'
import { z } from 'zod'

const userMessage = process.argv[2]

if (!userMessage) {
  console.error('Please provide a message')
  process.exit(1)
}

const weatherTool = {
  name: 'get_weather',
  description: 'Use this to get the weather. doesnt need a location',
  parameters: z.object({
    reasoning: z.string().describe('Why did you pick this tool?'),
  })
}

await runAgent({ userMessage, tools: [weatherTool] })