# 2 - LLM Overview

## 2.1 - Overview

### 2.1.1 - What is an LLM?

#### Definition

- A Large Language Model (LLM) is a `deep learning model trained on massive amounts of text`.
- It learns to `predict the next most likely token in a sequence using statistical patterns` in language.
- Despite their impressive output, `LLMs are fundamentally next-token predictors` — not sentient or conscious.

#### 🤖 Key Characteristics

- Built on the Transformer architecture (from the “Attention Is All You Need” paper, 2017).
- Trained on hundreds of billions of tokens.
- Uses attention mechanisms to track context and relationships.
- Capable of `few-shot, zero-shot, and task-agnostic` language generation.

### 2.1.2 - How LLMs Work

#### 🔢 Tokens

- LLMs operate on tokens, which are usually 3–4 characters long.

- Before processing:

  1. Text is tokenized.
  2. Tokens are embedded into vectors (e.g., 1536-dimensional).
  3. Vectors go through multiple transformer layers.

- Why this matters:

  - `Tokens determine cost, latency, and context length`.
    > Exceeding the model’s context window results in truncation or errors.

#### 🧠 Pattern Recognition

- Through training, LLMs learn:

  - Grammar & syntax
  - Logic & reasoning patterns
  - Domain-specific language
  - Statistical correlations (sometimes hallucinations)

#### 🧱 Transformer Architecture (Core Components)

- Self-attention layers —> weigh importance of tokens relative to others
- Feed-forward layers —> build complex representations
- Layer normalization —> stabilize training
- Positional encodings —> provide order awareness

### 2.1.3 - Training LLMs

#### ⚙️ Pretraining Phase

- Trained with a next-token prediction objective.
- Trained on broad internet-scale datasets (textbooks, forums, code, etc.).
- Uses gradient descent to optimize prediction accuracy.

#### 🛠️ Fine-Tuning Phase (Optional)

- Instruction tuning: teaches the model to follow instructions better.
- RLHF (Reinforcement Learning from Human Feedback):

  - Humans rank outputs.
  - A reward model is trained to reflect those preferences.
  - The LLM is fine-tuned to maximize that reward.

### 2.1.4 - LLMs in Practice

#### 📦 Model Outputs

- You input a prompt → Model generates probabilities for next tokens → It samples one → Repeats until completion.
- `All output is based on token probability distributions`, not facts or external understanding.

#### 💰 Token Costs & Limits

- LLM APIs (like OpenAI or Anthropic) `charge per token, both input and output`.
- Each model has a context window:

  - Smaller (2K–8K tokens) = faster, cheaper
  - Larger (32K–128K+) = handles long documents, but more expensive

### 2.1.5 - Key Takeaways

- `LLMs are powerful prediction engines`, not databases or calculators.
- `Transformers and tokens are at the heart` of everything.
- Understanding `vectorization, attention, and token limits` gives you a massive edge when building with LLMs.
- You don’t need to train your own — but `you do need to understand how they work to use them well`.

## 2.2 - Types of LLMs

### 2.2.1 - Base Models (Foundational)

- Trained on diverse internet-scale data
- Task-agnostic (no instruction fine-tuning)
- Power tools for research, fine-tuning, or APIs

> 🟦 Raw completion capability, not instruction-following

### 2.2.2 - Instruction-Tuned Models

Fine-tuned versions of base models that are taught to follow human instructions more reliably.

#### 🛠 Examples

- ChatGPT = GPT + Instructions + Guardrails
- Claude – Chat-focused with alignment layers

#### ✅ Benefits

- Better intent understanding
- Safer, more consistent outputs
- Role-based alignment (e.g., "You’re a helpful assistant")

### 2.2.3 - Domain-Specific Models

Tailored models fine-tuned on niche datasets (e.g., medical, finance, code).

#### 🔍 Examples

- Code LLaMA – Programming
- Med-PaLM – Medical QA
- FinGPT – Finance insights

#### 🎯 Use Cases

- Software development, scientific research, healthcare
- Specialized search, analysis, and classification

### 2.2.4 - Model Sizes & Parameters

LLMs vary in size, measured by parameter count — the internal values that define the model’s knowledge and complexity.

| Size    | Description                                 |
| ------- | ------------------------------------------- |
| 2B–7B   | Efficient, good for edge devices            |
| 13B–65B | Balanced for local or enterprise            |
| >100B   | Cloud-scale, state-of-the-art (e.g., GPT-4) |

> ⚠️ More parameters → higher accuracy, but increased cost and latency

### 2.2.5 - Under the Hood: Weights

Weights are the learned values that define how a model processes inputs. Think of them as the `memories encoded in a neural net`.

#### 🧠 Analogy

> Model = Brain
> Weights = Memories from schooling
> Training = The “education” process

### 2.2.6 - - Practical Considerations

#### ❗ Limitations

| Type               | Description                                                 |
| ------------------ | ----------------------------------------------------------- |
| 🧠 Hallucinations  | Confidently wrong outputs (not "lying")                     |
| ⏳ Context Windows | Token limits restrict memory (e.g., GPT-4 = 8k–128k tokens) |
| ⚡ Compute Cost    | Training requires millions in GPUs                          |
| ⚖️ Bias            | Reflects biases in data and alignment process               |

#### 🧩 Best Practices

| Practice              | Why It Matters           |
| --------------------- | ------------------------ |
| ✅ Clear Prompts      | Reduces ambiguity        |
| 🔥 Temperature Tuning | Controls randomness      |
| 🧵 Context Management | Efficient memory use     |
| 🛑 Error Handling     | Catch unreliable outputs |

#### 🖥️ Resource Requirements

| Factor     | Notes                                  |
| ---------- | -------------------------------------- |
| 💾 Memory  | High for large models                  |
| ⚙️ GPU/CPU | Required for local inference           |
| 🚀 Latency | Bigger model = slower responses        |
| 📈 Scaling | Auto-scaling often needed for prod use |

### 2.2.7 - Integration Patterns & Use Cases

#### 🔌 API Access

> You don’t need to train or host models — just access them via API.

#### Options:

- OpenAI, Anthropic, HuggingFace, Replicate
- REST APIs or WebSockets
- Batch or streaming responses

#### 💡 Common Use Cases

| Use Case           | Examples                           |
| ------------------ | ---------------------------------- |
| 📝 Text Generation | Blog posts, product descriptions   |
| 📊 Analysis        | Sentiment, trends, data extraction |
| 🧠 Classification  | Moderation, sorting                |
| 🌍 Translation     | Cross-lingual content              |
| 💻 Code Generation | Auto-completion, refactoring       |

## 2.3 - OpenAI Hello World

### ✅ 1. Setup: Add Your API Key

- `Create a .env file` in your project root.
- Add your [OpenAI API key ](https://platform.openai.com/api-keys) like this (without brackets):

```env
OPENAI_API_KEY='your_key_here'
```

> Use .gitignore to keep your API key secret and ensure it doesn't get uploaded to GitHub.

### ✅ 2. Install Dependencies

- Run `npm install` to install the required packages from package.json.
- You can use `npm start` to run the app (or use bun if you prefer).

### ✅ 3. Project Structure Overview

- index.ts: Processes user input and runs the main app logic.
- src/ai/index.ts: Initializes and exports the OpenAI client.
- UI code: Just for terminal display; not the focus here.
- Goal: Keep it simple and CLI-based so you focus on learning AI so far.

### ✅ 4. Create a Basic AI Call: runLLM Function

You’ll write a function that:

- Takes an user message.
- Sends it to OpenAI using openai.chat.completions.create.
- Returns the model’s response.

```ts
import type { AIMessage } from "../types";
import { openai } from "./ai";

export const runLLM = async ({ userMessage }: { userMessage: string }) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini", // Smaller, cheaper, fast model
    temperature: 0.1, // Controls creativity (0 = logical, 2 = chaotic)
    messages: [{ role: "user", content: userMessage }],
  });

  return response.choices[0].message.content;
};
```

### ✅ 5. Use It in Your `index.ts` File

Example usage:

```ts
import "dotenv/config";
import { runLLM } from "./src/llm";

const userMessage = process.argv[2];

if (!userMessage) {
  console.error("Please provide a message");
  process.exit(1);
}

const response = await runLLM({ userMessage });

console.log(response);
```

### 🧠 Important Concepts

- LLMs are stateless by default: If you ask it "What’s my name?" it won’t remember earlier messages unless you include them again.
- `No memory unless you implement it manually`.

> That’s why building agents (smart apps with memory) is more complex — and a big part of AI development.

### ❌ LangChain? Not Recommended (For JS Devs)

Scott’s take:

- LangChain was helpful in early LLM days (especially for Python).
- Today, `OpenAI has native support for things LangChain used to solve` (structured outputs, tool calling, schemas).
- `LangChain's TypeScript API is confusing` and feels like auto-translated Python.
- In practice, most production teams just call the OpenAI API directly — no frameworks.

---

> You now have working AI in your app — the rest is just how far you want to go with memory, agents, and features.

## Additional Resources

- ["Attention Is All You Need" paper (original Transformer paper)](https://arxiv.org/abs/1706.03762)
- [Hugging Face documentation](https://huggingface.co/docs)
- [OpenAI API documentation](https://platform.openai.com/docs/api-reference/introduction)
- [Anthropic Claude documentation](https://docs.anthropic.com/en/docs/welcome)
