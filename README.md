# 4 - AI Agents

An AI Agent is an `LLM augmented with memory, tool use, and loops`, enabling autonomous multi-step task execution.

## 4.1 - Types of AI Agents

| Type                          | Examples                                                                           | Capabilities                                                                                                                                                                                              |
| ----------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Customer Service Agents       | - Intercom's Resolution Bot <br> - HubSpot's Service Hub <br> - Zendesk Answer Bot | - Issue classification and triage <br> - FAQ handling <br> - Documentation search <br> - Escalation to humans <br> - Context management <br> - Tool usage (e.g., check order status)                      |
| Developer Assistants          | - GitHub Copilot <br> - Amazon CodeWhisperer <br> - Tabnine                        | - Code completion <br> - Bug detection <br> - Refactoring <br> - Code documentation <br> - Test case generation <br> - Code review <br> - Tool usage (linters, compilers, API testers)                    |
| Research & Analysis Agents    | - Market research <br> - Academic research <br> - Data analysis                    | - Info gathering (APIs, web, docs) <br> - Data synthesis & summarization <br> - Trend analysis <br> - Report drafting <br> - Tool usage (scrapers, databases, spreadsheets) <br> - Memory across sessions |
| Personal Task-Oriented Agents | - AutoGPT <br> - BabyAGI <br> - Personal AI                                        | - Task management <br> - Schedule organization <br> - Email writing <br> - Research and reminders <br> - Persistent memory <br> - Decision-making for tool usage (APIs, plugins, databases)               |

### 🔥 Key Agent Capabilities Across Applications

| Capability                 | Description                                                                                              |
| -------------------------- | -------------------------------------------------------------------------------------------------------- |
| Tool Usage                 | Ability to call APIs, databases, web tools, or other software to perform actions beyond text generation. |
| Memory                     | Short-term (context window) and long-term (persistent) memory to maintain context over time.             |
| Loops & Recursion          | Iteratively refine outputs or retry tasks until a goal is achieved.                                      |
| Autonomous Decision-Making | Planning steps, choosing tools, and executing tasks with minimal human intervention.                     |

### 🚀 Future Trends in AI Agents

| Trend                    | Description                                                                            |
| ------------------------ | -------------------------------------------------------------------------------------- |
| Multi-agent Systems      | Multiple specialized agents collaborating (e.g., scheduler, researcher, communicator). |
| Smarter Tool Integration | Deeper connections to APIs, SaaS, cloud services, and internal tools.                  |
| Improved Reasoning       | Models with better step-by-step decision-making, error handling, and self-correction.  |
| Advanced Memory Systems  | Systems that summarize, store, and retrieve information more intelligently over time.  |
| Domain-specific Agents   | Smaller, faster, and more efficient agents tailored to specific tasks or industries.   |

## 4.2 - Building an AI Agent

### 🏗️ Agent Structure

- Build an abstraction called runAgent on top of the existing LLM function.
- runAgent:

  - Accepts a userMessage and an array of tools.
  - Adds the user message to the database (addMessages).
  - Shows a loading spinner (showLoader).
  - Fetches message history (getMessages).
  - Calls the LLM (runLLM) with:

    - The message history.
    - Available tools (with Zod schema validation).

  - Logs the AI response (logMessage).
  - Adds the AI response back to the database.
  - Stops the loader.
  - Returns the updated message history.

```ts
//agent.ts
import type { AIMessage } from "../types";
import { runLLM } from "./llm";
import { addMessages, getMessages } from "./memory";
import { logMessage, showLoader } from "./ui";

export const runAgent = async ({
  userMessage,
  tools, // tools are functions that the agent can call
}: {
  userMessage: string;
  tools: any[];
}) => {
  await addMessages([
    {
      role: "user",
      content: userMessage,
    },
  ]);

  const loader = showLoader("🤔");

  const history = await getMessages();
  const response = await runLLM({
    messages: history,
    tools,
  });

  if (response.tool_calls) {
    console.log(response.tool_calls);
  }

  await addMessages([response]);

  logMessage(response);
  loader.stop();
  return getMessages();
};
```

### 🛠️ Tool Integration

- Tools are `functions the AI can call` (e.g., "get weather").
- Tools are defined with Zod schemas for:

  - Name
  - Description
  - Parameters

- Tools are passed to OpenAI's API using ZodFunction helpers.
- tool_choice: 'auto' lets the AI decide which tool to call.
- Parallel tool calls are disabled to avoid complexity.

### 🔄 Tool Call Flow

- After the AI requests a tool (tool_calls), the next response must be a message with:

  - role: 'tool'
  - The result in content
  - The same tool_call_id

- Failure to follow this order leads to errors (the AI gets "confused").

```ts
// llm.ts
import type { AIMessage } from "../types";
import { openai } from "./ai";
import { zodFunction } from "openai/helpers/zod.mjs";

export const runLLM = async ({
  messages,
  tools,
}: {
  messages: AIMessage[];
  tools: any[];
}) => {
  const formattedTools = tools.map(zodFunction); // Convert tools to the format expected by OpenAI

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.1, // how creative the response should be - value between 0 and 2
    messages,
    tools: formattedTools, // tools to use in the response
    tool_choice: "auto", // auto or required
    parallel_tool_calls: false, // whether to call tools in parallel or sequentially
  });

  return response.choices[0].message;
};
```

```ts
// index.ts
import "dotenv/config";
import { runAgent } from "./src/agent";
import { z } from "zod";

const userMessage = process.argv[2];

if (!userMessage) {
  console.error("Please provide a message");
  process.exit(1);
}

const weatherTool = {
  name: "get_weather",
  parameters: z.object({}),
};

const response = await runAgent({ userMessage, tools: [weatherTool] });

console.log(response);
```

### 💡 Prompt Design Tips

- Keep tool descriptions clear but concise, too much detail reduces reasoning ability.
- Adding a "reasoning" field improves decision-making:

  - Forces the AI to explain why it chose a tool.
  - Helps reduce errors and hallucinations.

### 🔢 Token Management

- Use tokenizers (e.g., [gpt-tokenizer](https://www.npmjs.com/package/gpt-tokenizer)) to:

  - Estimate input/output token counts.
  - `Prevent exceeding context limits`.

- Important for:

  - Cost control
  - Error prevention
  - Usage-based pricing models

### 🚫 Max Tokens Limit

- max_tokens applies to the output only, not input.
- Truncates output but doesn't help the model "think shorter."
> Better alternative: Use structured outputs (JSON) with schemas for reliable control.
