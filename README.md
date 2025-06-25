# 5 - Function Calling

## 5.1 - Overview

### 🤖 What is Function Calling?

Function calling allows a Large Language Model (LLM) to:

- Parse natural language into structured function calls.
- Match user intent with available functions.
- Format and pass arguments to backend functions.

This `enables AI agents to dynamically call APIs, fetch data, perform actions, and return results back to the user`.

### 🔐 Security Considerations

- `AI can't access anything you don’t expose`.
- `Use scoped functions with proper user ID checks` (e.g., multi-tenant filtering).
- Avoid exposing raw ORMs or overly broad tools.

> Treat tools like any API: secure and permissioned.

### 🔁 Message Flow

1. User sends a message
   `{ role: 'user', content: 'What's the weather in London?' }`

2. AI selects a tool and forms a call

   ```json
   {
     "role": "assistant",
     "content": null,
     "tool_calls": [
       {
         "id": "call_abc123",
         "type": "function",
         "function": {
           "name": "get_weather",
           "arguments": "{\"location\":\"London\"}"
         }
       }
     ]
   }
   ```

3. You execute the function and respond

   ```json
   {
     "role": "tool",
     "content": "{\"temperature\":18,\"condition\":\"cloudy\"}",
     "tool_call_id": "call_abc123"
   }
   ```

4. AI responds with final output
   `{ role: 'assistant', content: 'It’s 18°C and cloudy in London.' }`

### ⚠️ Required Response Format

- Must include:

  - role: "tool"
  - content: stringified JSON or plain string
  - tool_call_id: must match the tool_calls array from assistant’s message

Failure to include a valid tool_call_id will break the flow.

### 🛠 Tool Response & Error Handling

- You can return any string, even complex JSON.

- No schema required for return values.

- Best practice for async tools:

  ```ts
  try {
    const result = await tool();
    return { success: true, data: result };
  } catch (err) {
    return { failed: true, reason: err.message };
  }
  ```

- Train the AI to handle errors gracefully:
  “Sorry, I had an issue performing that action. I’ve notified the engineers.”

### 🧠 Tool Selection Logic

#### Clear vs Ambiguous Intents

- ✅ Clear:
  “What’s the stock price of Apple?” → getstockprice(symbol: "AAPL")

- ⚠️ Ambiguous:
  “How’s Apple doing today?” → unclear (stock? news? sentiment?)

- 🧩 Avoid overlapping tools
  e.g. getWeather() vs getWeatherByCity() → confusing
  → Use one with optional parameters instead.

### ⚙️ Common Function Types

1. Data Retrieval

   - Fetch info from APIs, databases, vector stores.
   - e.g., search, lookups, status checks.

2. Actions

   - Mutate state: send email, submit forms, place orders.
   - ⚠️ Needs human-in-the-loop in many cases.

3. Calculations

   - Use AI to compute answers with given inputs.
   - e.g., calculate mortgage, tax, interest, etc.

### 📐 Function Definition Best Practices

#### ✅ Good

```ts
{
  name: 'send_email',
  description: 'Send an email to the specified address.',
  parameters: {
    type: 'object',
    properties: {
      to: { type: 'string', description: 'Email address of recipient' },
      subject: { type: 'string', description: 'Subject of the email' }
    },
    required: ['to', 'subject']
  }
}
```

#### ❌ Bad

```ts
{
  name: 'email',
  description: 'Emails',
  parameters: {
    to: { type: 'string' },
    subj: { type: 'string' }
  }
}
```

- Be explicit, descriptive, and human-like.
- Treat AI as a junior developer on your team.

### 📊 Examples of Tools

#### 1. Weather

```ts
{
  name: 'get_weather',
  description: 'Get the current weather for a city.',
  parameters: {
    type: 'object',
    properties: {
      location: { type: 'string', description: 'City name' }
    },
    required: ['location']
  }
}
```

#### 2. Stock Price

```ts
{
  name: 'get_stock_price',
  description: 'Get the current stock price.',
  parameters: {
    type: 'object',
    properties: {
      symbol: { type: 'string', description: 'Ticker symbol' }
    },
    required: ['symbol']
  }
}
```

#### 3. Reminder

```ts
{
  name: 'create_reminder',
  description: 'Set a reminder.',
  parameters: {
    type: 'object',
    properties: {
      text: { type: 'string' },
      time: { type: 'string', description: 'ISO timestamp' }
    }
  }
}
```

### 💡 Common Use Cases

- External API calls: weather, stocks, flights
- Database operations: user/product lookup, filtering
- System actions: reminders, calendar events, notifications

### 🧩 Integrating in Code

```ts
if (response.tool_calls?.[0]) {
  const toolCall = response.tool_calls[0];
  const result = await execute(toolCall);

  const finalResponse = await llm.chat({
    messages: [
      ...history,
      {
        role: "tool",
        content: JSON.stringify(result),
        tool_call_id: toolCall.id,
      },
    ],
  });
}
```

## 5.2 – Creating a Tool Runner

### 🛠 Goal and Concept

Build a system that:

- Listens for tool calls from the LLM.
- Executes the appropriate tool.
- Feeds the result back to the LLM.
- Records the result for continued conversation context.

- Tool Runner receives:

  - The tool call from the LLM.
  - The original user message.

- Uses the tool name (toolCall.function.name) to determine which function to execute.
- Handles unknown tool names safely (by throwing an error or returning a fallback).

> You can pass anything (e.g., userId, auth info, etc.) to your tool functions—just extend the input object.

### 🧪 Tool Execution Flow

```ts
// toolRunner.ts
import type OpenAI from "openai";

const getWeather = () => "very cold. 17deg";

export const runTool = async (
  toolCall: OpenAI.Chat.Completions.ChatCompletionMessageToolCall,
  userMessage: string
) => {
  const input = {
    userMessage,
    toolArgs: JSON.parse(toolCall.function.arguments),
  };

  switch (toolCall.function.name) {
    case "weather":
      return getWeather();
    default:
      throw new Error(`Unknown tool: ${toolCall.function.name}`);
  }
};
```

### 🔁 Agent Update to Handle Tool Calls

The agent:

1. Adds the user message to memory.
2. Runs the LLM.
3. Checks if the response includes a tool_calls array.
4. If yes:

   - Runs the appropriate tool.
   - Saves the tool response as a message.

5. Returns the updated message history.

```ts
// agent.ts
if (response.tool_calls) {
  const toolCall = response.tool_calls[0];
  loader.update(`executing: ${toolCall.function.name}`);

  const toolResponse = await runTool(toolCall, userMessage);
  await saveToolResponse(toolCall.id, toolResponse);

  loader.update(`executed: ${toolCall.function.name}`);
}
```

### 💾 Saving Tool Responses

Store the result of the tool as a tool role message:

```ts
// memory.ts
export const saveToolResponse = async (
  toolCallId: string,
  toolResponse: string
) => {
  return await addMessages([
    { role: "tool", content: toolResponse, tool_call_id: toolCallId },
  ]);
};
```

### 💡 Key Behaviors

- OpenAI's API guarantees that a response will either have content or tool_calls, not both.
- Use this to determine:

  - content → Final answer → end loop.
  - tool_calls → Still processing → run tool and loop again.

- Tool calls must be followed by a tool role response with the matching tool_call_id.

### 📦 Run Entry Point

```ts
// index.ts
const messages = await runAgent({
  userMessage,
  tools: [
    {
      name: "weather",
      parameters: z.object().describe("get the weather"),
    },
  ],
});
```

### 🤖 Prompt Design Tip

You can trick the LLM into believing it did something:

- The assistant doesn’t know who inserted the message.
- You can simulate a tool being called (e.g., for approvals) by inserting messages manually.

```ts
[
  {
    role: "assistant",
    tool_calls: [
      { id: "tool_x", function: { name: "book_meeting", arguments: "{}" } },
    ],
  },
  { role: "tool", content: "User must approve", tool_call_id: "tool_x" },
];
```

### 🧠 Handling Repeated Questions

If a similar question is asked:

- LLM might skip the tool call if it already knows the answer from history.
- You can:

  - Instruct the model to always recall tools in the system prompt.
  - Purge tool call messages after a few follow-ups.
  - Dynamically remove tool responses after first use.

### 🧨 Common Error

If you see:

> `"assistant" message with tool_calls must be followed by "tool" messages responding to each tool_call_id"`

It means:

- The message flow is broken.
- You likely started in a broken state (e.g., a leftover tool_call without a corresponding tool message).
- Fix: Clear your message history and restart.

### 🧰 Full File Overview

toolRunner.ts:

- Implements runTool, with a switch on function name.
- Calls getWeather, which returns hardcoded weather.

llm.ts:

- Uses zodFunction to wrap tools.
- Calls openai.chat.completions.create.

agent.ts:

- Manages conversation history.
- Runs LLM and tools.
- Saves tool response to memory.

memory.ts:

- saveToolResponse saves role: "tool" messages to chat history.

index.ts:

- Entry point: parses CLI input and triggers runAgent.