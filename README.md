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