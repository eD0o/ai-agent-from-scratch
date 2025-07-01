# 7 - Real Tools

## 7.1 - System Prompts

- Set clear boundaries and capabilities
- Define personality and tone
- Establish task-specific guidelines

### Examples

```ts
// Generic Agent ❌ Too vague
export const systemPrompt = "You are a helpful AI assistant...";
```

```ts
// Optimized Agent ✅ Clear and specific
export const systemPrompt = \`
You are a helpful AI assistant called Dudu. Follow these instructions:

- Don't use celebrity names in your responses.
- Don't use the word "I" in your responses.
- Be friendly but efficient.
- Never make up order information.

context: { today_date: '2025-07-01' }
\`
```

## 7.2 - Tool Descriptions

### Basic Description

```ts
{
  name: 'search_orders',
  description: 'Search for orders'  // ❌ Vague
}
```

### Optimized Description

```ts
{
  name: 'search_orders',
  description: 'Search for customer orders using order_id or customer_email. Returns full order details including status, items purchased, and shipping information.'  // ✅ Clear and specific
}
```

```ts
// ✅ Clear Use Case
{ name: 'track_order', description: 'Track shipping status using tracking_id or order_id.' }
```

```ts
// ✅ With Output Expectation
{ name: 'get_user_profile', description: 'Returns user profile details such as name, email, and preferences.' }
```

## 7.3 - Loop Protection

### Basic Protections

- Maximum turns limit
  - Limit to 10 turns per user interaction
- Time limits
  - Abort after 30 seconds if no progress
- Cost limits
  - Stop if same tool is used with same input 3 times in a row

### Advanced Protections

- Progress monitoring
- Duplicate action detection
- Circular logic detection
- Task complexity estimation

## 7.4 - Intent Classification

### Purpose

- Route requests to specialized agents
- Choose appropriate tools
- Optimize response strategy

### Example Categories

- Information queries
- Action requests
- Complex problem-solving
- Clarification needed

```ts
// Input: "How much is shipping to Brazil?"
// → Intent: Information query
```

```ts
// Input: "Cancel my last order"
// → Intent: Action request
```

```ts
// Input: "Wait, which order are we talking about?"
// → Intent: Clarification needed
```

## 7.5 - Evaluation Methods

### Automated Evals

- Response accuracy
- Task completion rate
- Time to completion
- Resource usage
- Error rates

```ts
// ✅ Accuracy: "Capital of Australia" → "Canberra"
// ❌ Error: "France is in South America"
```

```ts
// ✅ Task completed: "Email sent to user@x.com"
// ❌ Task failed: Retry limit exceeded on tool
```

```ts
// Token cost: 3,000 for a basic query ❌
// Completion time: 2 seconds ✅
```

### User Feedback

- Satisfaction scores
- Task success rates
- Number of retries
- Clarity of responses

```ts
// Rating: 5/5 → User satisfied
// Task success: "Yes, my issue was resolved"
// Retried 4 times to clarify user intent ❌
```

## 7.6 - Context Management

### Token Optimization

- Remove redundant information
- Keep critical context
- Summarize long histories
- Prioritize recent interactions

### Example

```ts
// Before: Full History ❌
[message1, message2, message3, message4, message5, ...]

// After: Optimized Context ✅
{
  critical_info: "Customer order #12345, Issue: late delivery",
  last_actions: ["checked_status", "contacted_shipping"],
  current_goal: "resolve delivery delay"
}
```

## 7.7 - Tool Selection

### Basic Approach

- List all available tools // ❌ Inefficient

### Optimized Approach

- Group tools by purpose
- Tag tools with use cases
- Provide tool selection hints
- Include performance costs

```ts
// ❌ Listing all tools: ["search_orders", "update_address", "cancel_order", ...]
// ✅ Grouped: Orders (search, cancel), Shipping (track, update)
// ✅ With hints: use 'cancel_order' if user says "I want to cancel"
```

## 7.8 - Error Recovery

### Basic Error Handling

- Retry on failure
- Report error to user

### Optimized Error Handling

- Understand error types
- Have fallback strategies
- Learn from failures
- Adapt approach based on error patterns

```ts
// ❌ Only shows: "An error occurred"
// ✅ Retry failed call with exponential backoff
```

```ts
// Fallback strategy: If 'track_order' fails, ask user for more details and retry
```

```ts
// Learn from failure: Log repeated errors and update prompt/tool accordingly
```

## 7.9 - Performance Monitoring

### Key Metrics

- Response time
- Token usage
- Function call frequency
- Success rates
- Cost per task

```ts
// ✅ Track: 95% task completion, 300 tokens avg, 2.1 sec avg response
// ❌ Poor: 20% retries needed, 8 tool calls per task
```

```ts
// Optimization: Reduce duplicate tool calls, cache similar results
```

### Optimization Targets

- Reduce unnecessary tool calls
- Minimize token usage
- Improve task completion speed
- Enhance accuracy

## 7.10 - User Experience

### Response Quality

- Clear communication
- Appropriate detail level
- Progress updates
- Error transparency

```ts
// ✅ Clear: "I’ve submitted your return request."
// ❌ Confusing: "Return workflow initiated with code X"
```

```ts
// ✅ Progress updates: "Checking availability..." → "Found 3 options"
// ✅ Interim: Show partial data if full tool response is delayed
```

```ts
// ✅ Allow: "Would you like to continue or cancel?" before taking final action
```

### Interaction Flow

- Minimize clarification requests
- Provide interim results
- Allow user intervention
- Maintain conversation context

## 7.11 - Specialized Techniques

### Chain of Thought

```ts
// Basic Prompt ❌
"Book a flight to NYC"

// Chain of Thought Prompt ✅
"Let's approach this step by step:"
1. First, check available flights
2. Then, compare prices
3. Consider user preferences
4. Make recommendations"
```

### Memory Management

- Short-term working memory (current chat context)
- Long-term knowledge storage (external DB)
- Important fact persistence
- Context summarization

```ts
// Short-term: Current session history (last 5 turns)
// Long-term: "User prefers window seat" stored in DB
// Context summary: "User is rebooking due to flight cancellation"
```

## 7.12 - Best Practices

### Regular Testing

- Run standard test cases
- Monitor performance metrics
- Gather user feedback
- Update optimization strategies

### Continuous Improvement

- Analyze failure patterns
- Update system prompts
- Refine tool descriptions
- Improve error handling

### Resource Efficiency

- Optimize token usage
- Reduce unnecessary calls
- Cache common results
- Balance cost vs performance
