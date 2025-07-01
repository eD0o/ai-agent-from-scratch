# 9 - Next Level Agents

## 9.1 - Retrieval Augmented Generation (RAG)

Combine `LLMs with external knowledge using vector embeddings and semantic search`.

| Key Concept            | Description                                                                  |
| ---------------------- | ---------------------------------------------------------------------------- |
| Vector Databases       | Use tools like Pinecone, Weaviate, or ChromaDB to store and retrieve vectors |
| Embedding Generation   | Convert documents and queries into vector representations                    |
| Hybrid Search          | Combine semantic search (vectors) with keyword matching                      |
| Chunking Strategy      | Split large documents into manageable pieces before embedding                |
| Re-ranking & Filtering | Prioritize most relevant results after retrieval                             |

```ts
const embeddedQuery = await embed(query);
const results = await vectorDB.similaritySearch(embeddedQuery, { topK: 5 });
const context = assembleContext(results);
```

## 9.2 - Advanced Memory Management

| Memory Type      | Description                               |
| ---------------- | ----------------------------------------- |
| Working Memory   | Short-term, current turn of conversation  |
| Long-term Memory | Persistent knowledge across sessions      |
| Episodic Memory  | Stores events from previous conversations |
| Declarative      | Stores facts and structured knowledge     |

Storage Strategies:

- Vector DBs for semantic recall
- Key-value DBs for direct lookup
- Graph DBs to manage entities and relationships

```ts
memoryStore.set("user_preferences", { currency: "USD", locale: "en-US" });
const userPrefs = memoryStore.get("user_preferences");
```

## 9.3 - Human-in-the-Loop Function Calling

| Use Case               | Description                                           |
| ---------------------- | ----------------------------------------------------- |
| Approval Steps         | Request user confirmation for critical actions        |
| Progressive Disclosure | Show options in stages to avoid overwhelming the user |
| Delegation             | Let user choose from AI-suggested options             |

Flow Example:

```ts
// 1. Ask user to confirm a decision
askUser({
  question: "Book flight for $200 with layover or $400 direct?",
  options: ["Layover", "Direct"],
});

// 2. Receive user input
onUserResponse("Layover");

// 3. Proceed
callTool("book_flight", { flightId: "123", price: 200 });
```

## 9.4 - Evaluation Frameworks

| Evaluation Type   | Description                                 |
| ----------------- | ------------------------------------------- |
| Task Accuracy     | Whether the task was successfully completed |
| Output Quality    | Relevance, clarity, and tone of responses   |
| Efficiency        | Token and time usage                        |
| User Satisfaction | Based on feedback scores                    |

Tools:

- Braintrust
- Zapier Eval Cookbook

Testing Examples:

- Unit tests for each tool function
- A/B test different system prompts

## 9.5 - Advanced Tool Usage

| Concept       | Description                                       |
| ------------- | ------------------------------------------------- |
| Tool Chaining | Output of one tool feeds into another             |
| Retry Logic   | Automatically retry failed or invalid tool calls  |
| Cost-aware    | Select tools based on price/performance tradeoffs |

TypeScript Chain Example:

```ts
const flightOptions = await callTool("search_flights", { from: "NYC" });
const recommendation = await callTool("rank_options", {
  options: flightOptions,
});
await callTool("book_flight", { flightId: recommendation.id });
```

## 9.6 - Specialized Agents

| Type              | Description                       |
| ----------------- | --------------------------------- |
| Code Assistant    | Help with coding, debugging       |
| Research Agent    | Summarize or search academic work |
| Medical Assistant | Assist with symptoms, triage info |

Multi-Agent Design:

- Planner Agent → breaks down task
- Executor Agent → performs steps
- Validator Agent → checks outputs

## 9.7 - Safety & Control

| Safety Feature        | Description                              |
| --------------------- | ---------------------------------------- |
| Output Validation     | Ensure tool outputs are safe and correct |
| Rate Limiting         | Prevent overuse or runaway loops         |
| Sensitive Info Filter | Remove personal info before processing   |

```ts
if (output.includes("SSN")) throw new Error("Sensitive info detected");
```

## 9.8 - Advanced Conversation Management

| Feature         | Description                     |
| --------------- | ------------------------------- |
| Context Pruning | Remove less relevant turns      |
| Summarization   | Compress older messages         |
| Personalization | Preserve user preferences/goals |

```ts
const summary = summarize(history.slice(0, -5));
const context = [...summary, ...history.slice(-5)];
```

## 9.9 - Custom Datasets

| Source          | Use Case                              |
| --------------- | ------------------------------------- |
| Chat Logs       | Fine-tune intent classification       |
| Tool Usage Logs | Optimize prompts and tool definitions |
| User Feedback   | Adjust tone, memory retention         |

```ts
const dataset = log.map((entry) => ({
  input: entry.prompt,
  output: entry.response,
}));
```

## 9.10 - Integration Patterns

| Pattern             | Description                                       |
| ------------------- | ------------------------------------------------- |
| Background Jobs     | Durable tasks (e.g. QStash, Ingest)               |
| Event-driven Hooks  | Trigger agents from system events                 |
| Streaming Responses | Show progressive answers instead of full response |

Idempotent Design Tip:

```ts
// Safe to re-run multiple times
if (!db.exists("flight_123")) db.save("flight_123", data);
```

## 9.11 - Research Areas

| Topic                 | Description                                 |
| --------------------- | ------------------------------------------- |
| Tool Learning         | Agents that learn how to use new tools      |
| Reflection Mechanisms | Agents improving based on previous outcomes |
| Constitutional AI     | Rule-based alignment and oversight          |

Recommended Tools:

- Hugging Face for open-source models (GitHub of AI Models)
- Transformers.js for local inference
- Braintrust for eval dashboards

# Final Thoughts

Foundational Stack:

- System Prompts
- Tool Use
- Memory Management
- Evaluation Loops

Best Practices:

- Think in roles and approvals
- Design for durability (background jobs)
- Regularly evaluate and update
- Keep feedback loop open

Everyone’s learning, don’t wait for perfection to start using LLMs productively.
