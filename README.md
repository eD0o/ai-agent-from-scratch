# 6 - Agent Loops

## 6.1 - Overview

### 🧠 Why Loops Are Essential

Agents need loops to complete multi-step tasks. `When an LLM calls a function (like fetch weather), it doesn’t automatically respond to the user, the result must be fed back to the LLM to produce a final answer`.

This back-and-forth between:

1. LLM deciding what to do
2. Function running and returning results
3. LLM deciding again -> `the loop that transforms a static chatbot into an interactive agent`.

### 🔁 When Do You Need a Loop?

#### ✅ Multi-Step Workflows

- Searching for flights → then booking hotels → then sending confirmation.

#### ✅ Dependent Actions

- Verifying funds → then making payment.
- Checking inventory → then placing order.

#### ✅ Clarification & Retry

- If the LLM needs more context (as location).
- If a tool fails and a retry is necessary.

### 🧩 Loop Example – Booking Travel

#### Message Flow:

```ts
// 1. User asks:
{ role: 'user', content: 'Find cheap flights to NYC and book a hotel nearby' }

// 2. Assistant triggers tool:
{ role: 'assistant', tool_calls: [{ id: '1', function: { name: 'search_flights', arguments: '{"to": "NYC"}' } }] }

// 3. Tool responds:
{ role: 'tool', content: '{"flights": [...]}', tool_call_id: '1' }

// 4. Assistant triggers next tool:
{ role: 'assistant', tool_calls: [{ id: '2', function: { name: 'search_hotels', arguments: '{"location": "NYC"}' } }] }

// 5. Tool responds:
{ role: 'tool', content: '{"hotels": [...]}', tool_call_id: '2' }

// 6. Assistant replies:
{ role: 'assistant', content: 'I found a flight for $299 and a hotel for $199. Want to book them?' }
```

### 🧪 Basic Loop Structure

```ts
while (!taskComplete) {
  // 1. Get LLM response
  const response = await llm.chat(messages);

  // 2. If LLM wants to call a function
  if (response.tool_calls) {
    const result = await executeFunction(response.tool_calls);
    messages.push(toolResponse(result));
    continue;
  }

  // 3. If LLM gives final answer
  if (isTaskComplete(response)) {
    taskComplete = true;
  }
}
```

### 📌 Loop Exit Conditions

```ts
shouldStop =
  taskIsComplete || // LLM indicates task is done
  maxTurnsReached || // Prevent infinite loops
  errorOccurred || // Something went wrong
  userCancelled; // User stopped the process
```

> Important: Always end on a valid assistant message with content, never leave the history ending on a tool call without its response.

### 🧱 Design Strategies

#### 🔒 Guarding Dependent Tools

Use validation logic to ensure sequences like:

```text
✅ verify_funds ➝ make_payment
❌ make_payment without verify_funds
```

For example, in a loop:

- On detecting a make_payment tool call,
- Check if verify_funds was called two messages earlier.
- If not, reject the payment step.

### 💬 Handling User Interruptions

Let users cancel ongoing loops (e.g., via WebSocket):

```ts
if (userSaysStop) {
  messages.push({
    role: "assistant",
    content: "Task cancelled. Let me know if you need anything else!",
  });
  break;
}
```

> Avoid serverless for this. Use persistent servers with WebSocket support.

### ⚠️ Challenges & Solutions

| Challenge          | Solution                                         |
| ------------------ | ------------------------------------------------ |
| Missing context    | Keep chat history updated and correctly ordered. |
| Tool call failures | Retry logic or fallback responses.               |
| Loop never ends    | Max loop turns, or content detection.            |
| Invalid tool calls | Validate against tool schema and history.        |

### ✅ Best Practices & Use Cases

| Category             | Subcategory          | Details                                                               |
| -------------------- | -------------------- | --------------------------------------------------------------------- |
| Best Practices       | 🧭 Clear Intent      | - Define task goals and boundaries <br> - Align tools and prompts     |
|                      | 🧯 Soft Failures     | - End loops with a safe assistant message <br> - Avoid dangling calls |
|                      | 🧠 Human-Like Logic  | - Mirror human workflows <br> - Treat agent like a human assistant    |
| Real-World Use Cases | 🛎 Personal Assistant | - Schedule meetings <br> - Summarize emails <br> - Follow up on tasks |
|                      | 🛍 E-commerce Support | - Handle refunds <br> - Track orders <br> - Recommend alternatives    |
|                      | 📊 Data Pipelines    | - Collect data <br> - Run analysis <br> - Deliver reports             |

### 🧠 Final Thought

> Build loops like you're working with a real human.
> Think psychology first, then code — that's how you design reliable agent systems with LLMs.

## 6.2 - Coding The Agent Loop

The agent loop is not just about fetching information and responding. It also represents a `control structure that keeps the agent "alive" and running until it knows for sure that it's time to stop`.

### ✅ What the Loop Actually Does

#### 🔁 1. Repeat as Needed for Reasoning

- In each iteration, the LLM decides:

  - Should I call a tool?
  - Do I have the final answer?
  - Should I continue or stop?

#### ⛔ 2. Controlled Exit Conditions

- The loop only exits when:

  - `response.content exists → final answer`
  - The maxTurns limit is reached
  - A user cancels the task (if supported)
  - A critical error happens

#### 💬 3. Feels "Alive"

- It runs as while (true), making it always ready to react.
- But it’s `not truly infinite — it relies on smart, safe stopping conditions`.
- It can even listen for cancel events (e.g. via WebSockets), and gracefully stop with a message like:
  “Task was interrupted. Here’s what I’ve done so far.”

### 📌 Summary Table

| Loop Purpose                | Description                                                                |
| --------------------------- | -------------------------------------------------------------------------- |
| 🔄 Info Processing          | Retrieves data, processes results, responds, and repeats if needed         |
| 🔂 Multi-Step Task Handling | Executes chains like “search flights → find hotel → book”                  |
| ⏹ Safe Stop                 | Ends on response.content, errors, cancellation, or loop count limit        |
| 🔒 State Management         | Reloads updated history every turn to keep context fresh                   |
| 🌐 Event-Aware Cancellation | Can stop on external events like "user canceled" if the system supports it |

```ts
// agent.ts

import type { AIMessage } from "../types";
import { runLLM } from "./llm";
import { addMessages, getMessages, saveToolResponse } from "./memory";
import { runTool } from "./toolRunner";
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

  while (true) {
    const history = await getMessages();
    const response = await runLLM({
      messages: history,
      tools,
    });

    await addMessages([response]);

    if (response.content) {
      loader.stop();
      logMessage(response);
      return getMessages();
    }

    if (response.tool_calls) {
      const toolCall = response.tool_calls[0];
      loader.update(`executing tool: ${toolCall.function.name}`);
      const toolResponse = await runTool(toolCall, userMessage);
      await saveToolResponse(toolCall.id, toolResponse);
      loader.update(`done: ${toolCall.function.name}`);
    }
  }
};
```

So in short:

> The loop isn't just for function-calling logic — it's the heartbeat of the agent, keeping it responsive and persistent until the task is truly complete or intentionally stopped.
