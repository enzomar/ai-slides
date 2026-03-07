# Understanding Artificial Intelligence
### A Visual Journey for Everyone

*By Vincenzo Marafioti · [linkedin.com/in/vincenzo-marafioti](https://www.linkedin.com/in/vincenzo-marafioti/)*

My hands-on journey through modern AI — from fundamentals to autonomous agents.


---

## Chapter 01 · Introduction

Imagine teaching a machine to predict the next word in a sentence — then scaling that up 100 billion times. Suddenly it writes code, translates poetry, and reasons about the world. This chapter unpacks how that miracle works.

### Deterministic vs Probabilistic

**Deterministic**
Same input → Same output. Always.
- SQL query → always same rows
- SHA-256 hash function
- 2 + 2 = 4 (every time)
- Sorting algorithm

**Probabilistic**
Same input → Different possible outputs.
- Coin flip — Heads 50% · Tails 50%
- Dice roll — each face ~16.7% probability
- Weather forecast — 70% chance of rain
- Stock price tomorrow — distribution of possible moves

> **Key takeaway:** LLMs are probabilistic — the same question can produce different, valid answers. This is a feature, not a bug.

### AI Evolution: From Rules to Foundation Models

- **Symbolic AI**: Rule-based reasoning Expert systems Logic and knowledge graphs Examples: MYCIN, SHRDLU → AI = explicit rules written by humans.
- **Statistical Machine Learning**: Probabilistic models Pattern recognition Data-driven learning Key models: Hidden Markov Model, Support Vector Machine, Bayesian network → AI = learn patterns from data.
- **Deep Learning Revolution**: Breakthrough with: Deep learning GPU acceleration Big datasets Milestone: AlexNet wins ImageNet Large Scale Visual Recognition Challenge → AI = learn complex representations.
- **Transformers**: The paper: Attention Is All You Need Introduces: Transformer architecture Key idea: attention replaces recurrence → scalable models for language and multimodal data.
- **Foundation Models**: Massive models trained on internet-scale data. Examples: GPT-4, Claude, Gemini Concept: Large language model → AI = general-purpose intelligence layer.

Rule-based reasoning Expert systems Logic and knowledge graphs Examples: MYCIN, SHRDLU → AI = explicit rules written by humans.

Probabilistic models Pattern recognition Data-driven learning Key models: Hidden Markov Model, Support Vector Machine, Bayesian network → AI = learn patterns from data.

Breakthrough with: Deep learning GPU acceleration Big datasets Milestone: AlexNet wins ImageNet Large Scale Visual Recognition Challenge → AI = learn complex representations.

The paper: Attention Is All You Need Introduces: Transformer architecture Key idea: attention replaces recurrence → scalable models for language and multimodal data.

Massive models trained on internet-scale data. Examples: GPT-4, Claude, Gemini Concept: Large language model → AI = general-purpose intelligence layer.

> **Takeaway:** AI evolved from rules → statistics → deep learning → foundation models.

### Why AI Progress Accelerated (2017–2023)

**Data**
- Internet-scale text: CommonCrawl, Wikipedia, GitHub, books — trillions of tokens
- Digital transformation produced labelled training data en masse
- RLHF: human feedback to align model behaviour

**Compute**
- GPU from gaming to AI: NVIDIA A100/H100, millions of CUDA cores
- Cloud providers (AWS, GCP, Azure) made petaflop compute accessible
- Training cost fell ~10× every 18 months (AI Moore's Law)

**Algorithms**
- Transformers (2017) — parallelisable, scalable, attention-based
- Scaling laws (Kaplan et al. 2020) — bigger = better, predictably
- RLHF + instruct fine-tuning — from autocomplete to assistant

> **The perfect storm:** Data + Compute + Transformers converged simultaneously. No single factor explains the AI boom — all three were necessary.

### Next-Token Prediction

> **LLMs generate text one token at a time — each step samples from a probability distribution over the entire vocabulary.** 

### The Transformer Architecture

Modern AI is essentially this exact pipeline, scaled up to trillions of parameters.

### How the Next Word is Chosen

### Key Parameters

> **Pro tip:** For code/extraction → Temperature 0.2. For brainstorming → Temperature 0.8–1.0. Avoid changing Top-K and Top-P at the same time.

### Workflow Implications

Each conversation starts fresh. The model has no memory of past sessions unless explicitly provided in the context window.

Workaround: external memory stores, RAG, or conversation summaries

Training data has a cutoff date. Models are unaware of events after that date — unless you use RAG or tool use to retrieve current information.

Probabilistic sampling means the same question may give different answers. Critical decisions require deterministic verification or human oversight.

Tip: set temperature=0 for reproducible outputs in production pipelines

Models can only process a fixed number of tokens per request (4K–128K+). Long documents must be chunked, summarised, or handled with RAG.

> **Design principle:** Build around these constraints, not against them. Use RAG for freshness, external memory for persistence, low temperature for consistency, and chunking for long contexts.

### Hardware for AI

Good for inference on small models (≤7B params). Sequential tasks, low throughput.

24 GB VRAM. Fast inference on medium models. Light fine-tuning with LoRA/QLoRA.

80 GB VRAM. Run & fine-tune large models. Multi-GPU clusters for training.

Thousands of chips. Pre-training frontier models (GPT-4, Claude, Gemini). $10M–$100M+ runs.

### AI Tasks & Capabilities

From the HuggingFace task taxonomy — every capability built on top of language models.

> **Key insight:** One model, many capabilities. These are the building blocks that power every AI application.

### Frontier LLMs at a Glance

> **Tip:** There is no single 'best' model. Choose based on your use case: cost, latency, context length, privacy requirements, and task complexity.

### What LLMs Get Wrong

LLMs generate plausible-sounding text, not verified facts. They confidently fabricate citations, API names, statistics, and historical events.

Real case: a lawyer submitted AI-generated briefs citing non-existent cases (US, 2023)

LLMs struggle with multi-step arithmetic, logic puzzles, and spatial reasoning. They 'feel' the answer rather than compute it.

A model may generate perfectly formatted code using functions that don't exist. Always verify generated code against official documentation.

> **Takeaway:** Never trust LLM output blindly — always add verification layers: RAG for facts, code linters for code, human review for critical decisions.

### Modern AI System — Architecture Overview

*This diagram shows the full architecture of a modern production AI system. At the top, three actors interact with the system: end users who send requests and receive responses, developers who build and maintain the system, and external services that integrate as data sources or consumers. Requests flow down through the application layer — web/mobile front-ends and API backends — into the AI orchestration layer. The orchestration layer is the brain: an agent or planner coordinates everything, calling tools, building prompts, managing context, and routing memory. Below orchestration, three pillars operate in parallel: the model layer (foundation LLM plus an embedding model for similarity search), the tools layer (external APIs, databases, search engines, code execution), and the data and knowledge layer (vector stores, documents, RAG retrieval). A dedicated memory subsystem provides short-term conversation history, long-term per-user memory, and semantic vector-based memory. Underpinning the entire stack is the infrastructure and LLMOps layer: model serving, monitoring, evaluation, logging, safety guardrails, caching, and cost control. Every AI product you use today is some variation of this architecture.*

### Key Takeaways

**Probabilistic, not deterministic**

**Attention is the superpower**

**Parameters shape behaviour**

**No single 'best' model**

LLMs don't look up answers — they predict the most likely next token. Same prompt, different output. Understand sampling to control behaviour.

The transformer's self-attention mechanism lets every token look at every other token simultaneously. That's why context matters — and why longer context windows are valuable.

Temperature controls creativity vs precision. Top-p limits the candidate pool. Context window determines memory. Know these three and you control the model.

Choose based on your use case: cost, latency, context length, privacy, and task complexity. GPT-4o for reasoning, Gemini for multimodal, Claude for long context, local models for privacy.

> **Next up:** Now you know how the model thinks — Chapter 2 shows you how to talk to it effectively.


---

## Chapter 02 · Prompt Engineering

The best AI in the world gives mediocre results with poor instructions. Master the 4-part anatomy of a prompt and you'll get dramatically better outputs from the same model — starting today.

### Anatomy of a Prompt

- Role / System
- Context
- Task / Instruction
- Format & Constraints

```
You are a helpful travel planner. Be friendly and concise.
```

### Prompting Patterns

**Zero-Shot**

**Few-Shot**

**Chain-of-Thought**

```
Classify this review as positive or negative:
```

```
Solve this. Think step by step.
Step 1: identify the variables…
Step 2: apply the formula…
```

No examples given. Direct instruction.

✓ Best for: simple, well-known tasks

Provide 2-5 examples to guide the model.

✓ Best for: custom formats, niche tasks

Ask the model to reason step by step.

✓ Best for: math, logic, complex reasoning

> **Rule of thumb:** Start with zero-shot. If the output isn't right, add examples (few-shot). For reasoning tasks, always use chain-of-thought.

### Advanced Techniques

```
Act as a cybersecurity auditor with 15 years of experience…
```

```
Return a JSON object with keys: title, summary, score (1-10), tags[]
```

```
Rewrite this prompt to be clearer, more specific, and get better results…
```

### Do's & Don'ts

**✓ Do**
- Be specific and explicit
- Provide context and examples
- Specify output format (JSON, table…)
- Break complex tasks into steps
- Iterate and refine your prompt

**✗ Don't**
- Use vague instructions ('do something good')
- Send multiple unrelated tasks at once
- Assume the model remembers past chats
- Trust output blindly (always verify!)
- Share sensitive data in prompts

### Bad Prompt vs Good Prompt

**✅ Structured Prompt**

"We are happy to announce our new product. It is a great solution that helps users. We hope you enjoy it. Please let us know what you think…"

"Finance teams are drowning in manual invoices — we built a way out. Our AI invoice processor cuts accounts payable workload by 60%, integrating with SAP and NetSuite in under a day. See it live at booth 14B, or request a demo at [link]."

### Real-World Examples

**For Managers**

**For Architects**

**For Developers**

```
Summarize this 20-page report in 5 bullet points. Focus on budget impact and key risks.
```

```
Act as a cloud architect. Compare 3 approaches for real-time order processing: Kafka vs SQS vs EventBridge. Return a Markdown comparison table.
```

```
Review this Python function for: 1) bugs 2) performance 3) security. For each issue, show the fix. Think step by step.
```

→ Zero-shot, format constraint

→ Role + format + specificity

→ CoT + structured output

> **Remember:** Prompt engineering is iterative. Your first prompt is never your best. Refine, test, and improve progressively.

### Parameter Playground

**Adjust Parameters**

**Model Output**

Controls randomness: at 0 the model always picks the most likely token (deterministic); higher values let less probable tokens through, producing more creative but less predictable output.

Nucleus sampling: only tokens whose cumulative probability reaches P are considered. A low value (e.g. 0.1) restricts output to the safest words; 1.0 considers the full vocabulary.

> **Experiment:** Move the Temperature slider from 0 to 2 and watch how the output changes from precise and repetitive to wildly creative.

### 🛠️ Hands-On Exercise

Start with the naive prompt below. Iteratively improve it using patterns from this chapter until the output quality is excellent.

### Key Takeaways

**The 4-part anatomy**

**Start simple, add complexity**

**System prompts are invisible power**

**Prompting is iterative**

Every great prompt has: Role (who is the model?), Context (what's the situation?), Task (what do you want?), Format (how should it respond?). Miss any one and quality drops.

Zero-shot first. If the output isn't right, add 2-5 examples (few-shot). For reasoning tasks, ask the model to 'think step by step' (chain-of-thought). Each technique has its use case.

System prompts define the model's persona, rules, and guardrails — users never see them. They are your primary lever for reliable, consistent AI behaviour in production applications.

Your first prompt is never your best. Write → test → analyse the failure mode → refine. The best prompt engineers treat prompts the same way developers treat code: version them, test them, improve them.

> **Next up:** You can prompt fluently — Chapter 3 shows how to use that skill to supercharge your development workflow.


---

## Chapter 03 · AI-Assisted Coding

In 2022, writing a REST API from scratch took hours. In 2025, it takes minutes. This chapter shows you exactly how — and how to stay the human who directs the machine, not the one replaced by it.

### What is AI-Assisted Coding?

- Describe what you want
- AI generates the code
- You review & iterate

AI-assisted coding spans a wide spectrum — from intelligent autocomplete to fully conversational development. Karpathy's 'vibe-coding' (Feb 2025) captures the most radical end:

> **Spectrum:** ① Autocomplete (Copilot) → ② Chat-assisted edits (Cursor, Copilot Chat) → ③ Fully conversational 'vibe-coding'. The skill shifts from writing code to reviewing and directing it.

### The AI-Assisted Coding Loop

**Traditional Coding**
- Write every line yourself
- Search Stack Overflow
- Hours to scaffold a project

**AI-Assisted Coding**
- Describe intent, AI writes code
- Context-aware inline suggestions
- Minutes for full scaffolds

### The Tools Landscape

**IDE Extensions**
- GitHub Copilot
- Amazon CodeWhisperer
- Tabnine
- Codeium / Supermaven

**AI-Native IDEs**
- Cursor
- Windsurf (Codeium)
- Void (open source)
- Zed (AI panel)

**Chat & App Builders**
- ChatGPT / Gemini
- v0 by Vercel
- Bolt.new / Lovable
- Replit Agent

Autocomplete, inline chat, explain code

Full codebase context, multi-file edits, agents

Generate full apps from a single prompt

> **Trend:** The boundary between 'IDE' and 'AI assistant' is disappearing. In 2025+, every editor is an AI editor.

### When It Shines & When It Doesn't

**✓ Works Great**
- CRUD operations & boilerplate
- Unit tests & test data generation
- Regex, SQL, config files
- Prototyping & MVPs
- Documentation & comments

**⚠ Be Careful**
- Complex business logic (domain-specific)
- Security-critical code
- Performance-sensitive algorithms
- Legacy codebase with poor docs
- Compliance & regulated systems

> **Golden rule:** Never ship AI-generated code you don't understand. Vibe-coding amplifies your skills — it doesn't replace them.

### Measured Impact

GitHub Copilot study (2022): developers completed an HTTP server task 55% faster with Copilot.

Copilot generates an average of 46% of code in files where it is enabled (Octoverse 2024).

76% of developers use or plan to use AI coding tools (Stack Overflow Developer Survey 2024).

> **Bottom line:** Vibe-coding is not a fad — it's the new baseline for software development. Teams not adopting it risk falling behind.

### 🛠️ Hands-On Exercise

Your company wants an internal AI assistant that answers employee questions about HR policies, IT procedures, and company guidelines.

What documents go into the knowledge base?

> **A. Draw the architecture diagram: Data Sources → Chunking → Embedding → Vector DB → Retriever → LLM → Response** B. Choose your tech stack — e.g. OpenAI text-embedding-3-small + Pinecone + GPT-4o-mini

### Key Takeaways

**AI codes faster, you code smarter**

**Right tool, right task**

**AI fails at the edges**

**The vibe-coding workflow**

Studies show 35–55% productivity gains in real-world settings. The gains come from eliminating boilerplate, speeding up research, and accelerating the test-debug cycle — not from removing developers.

GitHub Copilot for inline completion, Cursor for full-file refactoring, Claude/ChatGPT for architecture conversations. The tools differ in how much context they can hold and how deeply they integrate with your editor.

AI-assisted coding struggles with: large codebases it hasn't seen, security-critical logic, novel algorithms, and concurrency bugs. Always review security-sensitive output. AI is a junior developer without production experience — you are the senior.

Spec in natural language → generate skeleton → iterate with AI → review diff → commit. The skill isn't writing code — it's writing clear specifications and critically reviewing AI-generated output before it ships.

> **Next up:** AI can write code, but it can't read your internal documents. Chapter 4 introduces RAG — how to give any model access to your private knowledge.


---

## Chapter 04 · RAG Architecture

ChatGPT knows everything that was on the internet before its training cutoff — but nothing about your internal docs, last week's meeting notes, or your proprietary data. RAG is the bridge that changes that.

### Why LLMs Need External Knowledge

**LLM Limitations**
- Knowledge frozen at training cutoff
- No access to private / enterprise data
- Can hallucinate outdated facts
- Context window limits large corpora

**RAG Solution**
- Retrieve relevant chunks at query time
- Ground answers in real, citable sources
- Works on proprietary documents
- Always up-to-date (live index)

> **Core idea:** Instead of retraining the model, inject relevant documents into the prompt at runtime.

### The RAG Pipeline

> **Why it works:** The model never needs to memorise your data. It reads the relevant passages fresh at every query — so the knowledge base can be updated in real time without touching the model.

### Embeddings & Vector Databases

**What is an Embedding?**

A numerical vector that captures the semantic meaning of text.

Similar sentences → similar vectors (close in space)

### Chunking Strategies

**Fixed Size**

**Semantic**

**Hierarchical**

Split every N tokens with a sliding overlap window.

✓ Simple, fast, predictable

✗ May cut sentences mid-thought

Split on sentence / paragraph / heading boundaries.

✓ Preserves meaning, respects structure

✗ Variable sizes, needs structure in source

Large parent chunks for context + small child chunks for precision.

✓ High precision retrieval + rich context

✗ More storage, complex pipeline

> **Rule of thumb:** Start with RecursiveCharacterTextSplitter (chunk 512, overlap 64). Switch to Semantic or Hierarchical when retrieval recall drops below 80%.

### Chunking in Action — Before & After

**✅ Chunk 512 tok + vector retrieval**

Query: "What is our parental leave policy for adoptive parents?"

### RAG in Production

**Enterprise Search**

**Support & Docs**

**Legal & Compliance**

Ask questions over internal wikis, SharePoint, Confluence, HR policies.

Customer-facing chatbots that answer from product docs with source citations.

Contract analysis, regulation lookup, policy Q&A with full traceability.

> **Key advantage:** Every answer can cite its source. Users and auditors can verify. This is the trust layer AI needs in regulated industries.

### 🛠️ Hands-On Exercise

- What documents go into the knowledge base?
- How do you chunk a 50-page HR handbook?
- Which embedding model? (cost vs quality)
- How do you handle access control (HR Manager vs Intern)?
- What happens when a document is updated?

Your company wants an internal AI assistant that answers employee questions about HR policies, IT procedures, and company guidelines.

### Key Takeaways

**RAG solves frozen knowledge**

**The pipeline: chunk → embed → retrieve → generate**

**Chunk size changes everything**

**RAG > fine-tuning for facts**

LLMs know nothing beyond their training cutoff and nothing about your private data. RAG retrieves relevant documents at query time and injects them into the context window — giving the model up-to-date, private knowledge without retraining.

Documents are split into chunks, converted to vector embeddings, stored in a vector database. At query time: embed the query, find the top-k closest chunks, append them to the prompt, generate a grounded answer.

Too large: you retrieve irrelevant noise. Too small: you lose context. The sweet spot is typically 256–512 tokens with 10–20% overlap. Evaluate with recall@k — how often does the right chunk appear in the top-k results?

Fine-tuning teaches the model new skills (style, domain vocabulary). RAG gives it new facts. For enterprise use cases — QA on internal docs, contract review, policy search — RAG is faster to deploy, cheaper to maintain, and more explainable.

> **Next up:** RAG gives the model context. Chapter 5 gives it autonomy — AI agents that plan, use tools, and complete multi-step tasks without human intervention at every step.


---

## Chapter 05 · AI Agents & MCP

An LLM answers questions. An AI agent actually does things. This chapter shows how models evolve from passive responders into autonomous workers that plan, use tools, and complete multi-step tasks on your behalf.

### What is an AI Agent?

- Perceive
- Reason
- Act
- Observe & Loop

An AI agent is an LLM that can observe its environment, reason, decide, and take actions to reach a goal — in a loop.

### Andrew Ng's 4 Agentic Design Patterns

> **Andrew Ng, DeepLearning.AI — 'Agentic Design Patterns' series, 2024. These patterns can be combined: an agent can plan, use tools, reflect on results, and collaborate with other agents.** 

### Reason + Act: The ReAct Loop

```
Example: Book me Paris flights for next Tuesday
```

### Tool Use & Function Calling

- 🔍 Search — web, vector DB, SQL queries
- 💻 Code execution — Python sandbox, shell
- 🌐 APIs — weather, maps, CRM, ERP, Slack
- 📂 File system — read, write, create, delete
- 📧 Communication — send email, calendar, Slack
- 🧪 Testing — run tests, deploy, CI/CD triggers

You describe tools as JSON schemas. The model decides when and how to call them.

### Model Context Protocol (MCP)

- GitHub — repos, PRs, issues, commits
- Slack — read channels, send messages
- PostgreSQL / SQLite — query databases
- Google Drive / Docs — read & write files
- Brave Search — real-time web search
- Docker — manage containers
- Jira / Linear — project management
- + 1000s of community servers

An open protocol that standardises how AI applications connect to external tools, data sources, and services — like USB-C for AI integrations.

### Multi-Agent Systems

Complex tasks split across specialised agents that collaborate, verify each other, and hand off work. A supervisor agent orchestrates the flow.

Models agent workflows as a state machine graph: nodes are LLM calls or tool invocations; edges are conditional transitions. A supervisor node routes tasks to specialist worker nodes.

> **Recommendation:** Start with LangGraph for anything going to production. Use CrewAI for fast demos. AutoGen for peer-review agent patterns.

### Key Takeaways

**LLM → Agent: the key difference**

**ReAct: reason then act**

**MCP: the USB-C of AI tools**

**Agents fail differently than LLMs**

An LLM answers questions in a single call. An agent runs in a loop: it observes, reasons, chooses a tool, acts, observes the result, and repeats — until the task completes. This loop is what makes agents autonomous.

The ReAct pattern interleaves Thought (internal reasoning) with Action (tool call) and Observation (tool result). This creates a transparent audit trail — you can see why the agent made every decision, which is critical for debugging and trust.

Model Context Protocol standardises how AI models connect to tools, data sources, and APIs. Before MCP, every integration was custom. Now: build one MCP server, connect any compatible agent. It's the standardisation moment for the agentic ecosystem.

LLM failures: bad text output, easy to spot. Agent failures: runaway actions, cost explosions, prompt injection attacks, and irreversible real-world effects (sent email, deleted file, charged card). Always define a kill switch and scope agent permissions carefully.

> **Next up:** With autonomous agents come serious responsibilities. Chapter 6 explores AI ethics, governance frameworks, and how to deploy AI that the world can trust.


---

## Chapter 06 · Ethics & Future

The same technology that summarises medical records can reinforce a doctor's biases. The same agent that books flights can be manipulated to leak your data. Power demands wisdom — this chapter shows how to wield it responsibly.

### Bias & Hallucination

**Bias**
- Gender stereotypes in job descriptions
- Under-representation of minorities
- Geographic & cultural bias (Western-centric data)
- Recency bias from training window

**Hallucination**
- Invented citations and papers
- Wrong legal / medical / technical facts
- Confident errors in code logic
- Mitigated by: RAG, grounding, verification

Models learn patterns from human-generated data — including human prejudices.

Models generate plausible-sounding but false content with full confidence.

> **Rule:** Never use AI output without human review in high-stakes decisions (hiring, medicine, law, finance).

### EU AI Act & Governance

- 🇺🇸 USA — Executive Order on AI Safety (Oct 2023). Voluntary commitments by major labs.
- 🇨🇳 China — Generative AI Regulations since 2023. Strong state oversight.
- 🇬🇧 UK — Principles-based approach. Sector-specific regulators lead.

The world's first comprehensive AI law. Risk-based approach with four tiers.

### Real-World AI Failures

**Amazon Hiring Tool (2018)**

**COMPAS Recidivism (2016)**

**Lawyer Cites Fake Cases (2023)**

**Deepfake Fraud ($25M, 2024)**

CV screening model penalised female candidates. Trained on 10 years of male-dominated hiring data — learned gender was a negative signal.

Criminal risk scoring system was twice as likely to falsely flag Black defendants as high-risk compared to white defendants.

A New York attorney used ChatGPT for legal research. The AI invented six fake case citations — complete with made-up judges and rulings. Sanctions followed.

Hong Kong firm employee tricked by AI-generated video call impersonating the CFO. Result: $25 million wire transfer to scammers.

> **Lesson:** Every failure above was preventable with proper governance: bias audits, human oversight, output verification, and authentication protocols.

### Real-World AI Failures (cont.)

**Healthcare AI Misdiagnosis (2023)**

**Air Canada Chatbot Refund (2024)**

**NYT vs. OpenAI Copyright (2023–)**

**Biden Deepfake Robocall (2024)**

UnitedHealth's AI tool denied elderly patients' claims for nursing home care with a 90% error rate. The algorithm overrode physician recommendations, affecting millions of Medicare Advantage patients.

Air Canada's chatbot invented a bereavement fare policy that didn't exist. A tribunal ruled the airline liable — you can't blame your own AI for misinformation.

The New York Times sued OpenAI and Microsoft for training on copyrighted articles without permission. The case tests whether AI training constitutes fair use — a question that could reshape the entire industry.

An AI voice clone of President Biden told New Hampshire Democrats not to vote. ~25,000 robocalls were sent. The FCC subsequently banned AI-generated voices in robocalls.

> **Pattern:** AI failures cluster around hallucinated outputs, regulatory blind spots, and lack of human verification. Every deployment needs guardrails before scale.

### AI Governance Frameworks

- Four functions: Govern · Map · Measure · Manage
- De facto US standard — mirrors NIST Cybersecurity Framework
- First certifiable AI management standard — aligns with ISO 27001
- Covers full AI lifecycle: design → deploy → retire
- Risk tiers: Unacceptable · High · Limited · Minimal
- Banned: social scoring, real-time biometric surveillance
- Fines: up to €35M or 7% global annual turnover

### Responsible AI in Practice

**Transparency**
- Disclose when AI is in use
- Explain model decisions (XAI)
- Document training data sources

**Fairness**
- Audit for demographic bias
- Diverse training data and teams
- Measure disparate impact

**Safety & Control**
- Human-in-the-loop for high stakes
- Kill switch & rollback plan
- Red-team before deployment

> **Principle:** Responsible AI is not a compliance checkbox — it is a product quality standard. Users deserve to know when and how AI affects them.

### The Road Ahead

- 🤖 Autonomous AI agents become mainstream in enterprise
- 🔊 Multi-modal AI: text, voice, image, video in one model
- 📉 Smaller, faster, on-device models (edge AI)
- ⚖️ AI regulation expands globally (post-EU AI Act)
- 🧠 Reasoning AI: models that genuinely plan and verify (o3-class)
- 💊 AI in drug discovery, materials, climate simulation
- 🎓 Personalised education at scale
- 🤝 Human-AI collaboration as default work mode

> **The constant:** Technology will keep accelerating. The skill that endures is knowing how to work with AI — critically, creatively, and responsibly.

### Key Takeaways

**Bias & hallucination are predictable**

**The EU AI Act sets the global bar**

**Responsible AI is a quality standard**

**The constant: accelerating change**

Amazon's hiring tool, COMPAS, the Mata v. Avianca case, the $25M deepfake fraud — every failure was preventable with proper governance. Bias audits, human oversight, output verification, and authentication protocols are not optional extras; they are baseline engineering.

Four risk tiers: Unacceptable (banned), High (heavy regulation), Limited (transparency required), Minimal (free to use). Penalties up to €35M or 7% global turnover. Other jurisdictions are following — this is the direction of travel worldwide.

Transparency (disclose when AI is in use), Fairness (audit for bias, measure disparate impact), Safety (human-in-the-loop, kill switch, red-team before launch). These are not compliance checkboxes — they are the engineering standards of trustworthy AI products.

By 2027: autonomous agents mainstream, multimodal AI standard, edge AI ubiquitous. By 2030: AI in drug discovery, personalised education, and human-AI collaboration as the default work mode. The skill that endures: knowing how to work with AI — critically, creatively, and responsibly.

> **You've completed all six chapters.** Next up: a recap of key insights, curated learning resources, and the Annex with model comparisons and technical deep-dives.

### AI Use Cases by Industry

> **⚠ High maturity ≠ low risk. Finance and healthcare have production deployments but require rigorous validation, auditability, and regulatory compliance before going live.** 


---

## Conclusion

Six chapters, one journey. Let's revisit the core ideas, restate the key insights, and send you off with the right resources to keep learning.

### Summary

LLMs are probabilistic token predictors trained on massive text corpora. They don't 'know' facts — they encode statistical patterns. Scale (data + compute + architecture) is what unlocked capabilities.

How you ask matters as much as what you ask. Clear role, context, format instructions, and examples dramatically improve output quality. Use Chain-of-Thought for complex reasoning.

AI coding tools boost productivity for boilerplate, test generation, and refactoring. They are unreliable for novel algorithms, security-critical code, and unfamiliar codebases. Always review AI-generated code.

RAG connects LLMs to your private data via vector search. It solves the knowledge cutoff problem and reduces hallucinations in knowledge-intensive tasks. Retrieval quality determines answer quality.

Agents combine LLMs with tools, memory, and planning to execute multi-step tasks autonomously. MCP standardises how models connect to external tools and data. Human oversight remains essential.

AI amplifies existing biases and creates new risks (hallucinations, deepfakes, job displacement). Responsible AI requires transparency, fairness audits, human oversight, and policy frameworks. The technology is neutral — the choices are ours.

> **Above all:** AI is a powerful tool, not magic. Understanding its mechanics, limitations, and risks makes you a better builder, user, and decision-maker.

### Key Insights to Remember

They predict next tokens, not truth. Treat every output as a confident draft that needs verification — not a fact.

Structured prompts with role, context, constraints, and examples consistently outperform vague questions. Invest in prompt craft.

Whether code, text, or analysis — AI is a co-pilot, not autopilot. The human in the loop is what separates useful AI from dangerous AI.

RAG lets you ground any model in your own data. The quality of what you retrieve determines the quality of what you get back. Invest in your data pipeline.

AI agents that plan, use tools, and act are powerful — and risky. Always scope their authority, validate their actions, and maintain human oversight.

AI amplifies intent. Build with transparency, test for bias, design for fairness and include diverse perspectives. The choices behind AI matter more than the AI itself.

# Understanding Artificial Intelligence
### A Visual Journey for Everyone

*By Vincenzo Marafioti · [linkedin.com/in/vincenzo-marafioti](https://www.linkedin.com/in/vincenzo-marafioti/)*

AI is a tool. The intent and judgment behind the tool is yours.


---

## Annex

You've completed the six chapters. This section is your permanent reference: compare models side-by-side, run AI on your own hardware, and explore the curated resources that will keep you current as the field accelerates.

### Self-Attention in Action

> **Insight:** Each row shows which words a token 'pays attention to'. Brighter = stronger connection. This is how 'it' resolves to 'cat', not 'mat'.

### Prompt Engineering Patterns Cheat Sheet

**🎭 Role**

**🔗 Chain-of-Thought**

**📋 Few-Shot**

**📐 Structured Output**

**⚡ ReAct**

**🔄 Meta-Prompting**

**🚫 Negative Constraints**

**📌 Grounding**

Assign an expert persona to improve depth and style.

✓ Tone, expertise, vocabulary

Force step-by-step reasoning before the final answer.

✓ Math, logic, complex analysis

Show 2–5 examples to define the expected format and style.

✓ Custom formats, niche tasks

Specify exact format: JSON, table, YAML, Markdown. Enables machine parsing.

✓ APIs, pipelines, automation

Reason → Act → Observe → Repeat. Used in agents with tool access.

“Improve this prompt to be clearer&hellip;” &mdash; let the model optimise its own instructions.

“Do NOT use bullet points. Never mention competitors.” Explicit guardrails improve reliability.

Provide reference text: “Answer ONLY using the document below.” Reduces hallucinations.

### A Typical AI Workflow

👤 Human Validation Review, verify, approve or refine

E.g. ChatGPT, Claude.ai direct chat — ideal for writing, summarisation, Q&A.

E.g. RAG pipeline, Copilot coding assistant, autonomous agents — iterate over external data.

### The Modern AI Stack

> **Key principle:** The LLM is just one layer. Production AI systems need a full stack — orchestration, retrieval, monitoring, and human validation.

### The Full AI Ecosystem

### The Cost of AI

Larger models (GPT-4, Claude Sonnet 4) cost 10–100× more per call than smaller ones (GPT-4o mini, Haiku).

Pricing is per token. Long context windows, large documents, or verbose prompts all increase cost. Output tokens cost 3–5× more.

1M users × 10 messages/day × 1k tokens = 10B tokens/day. At $1/1M tokens that's $10k/day.

Embedding + vector search add latency and cost for every RAG query. Caching reduces repeated costs.

GPT-4o mini for classification, GPT-4o for complex reasoning only.

Remove boilerplate, use structured context, define output schema up front.

GPTCache, Langchain cache: FAQs and common queries avoid repeated LLM calls entirely.

One-time fine-tuning cost replaces ongoing inference cost for high-volume use cases.

### PlantUML Diagram Library

Source-controlled PlantUML diagrams for the deck — links are resolved at runtime from the generated .link files.

> **Repository tip:** PlantUML links are loaded at runtime from diagrams/*.link files — run npm run build:index to regenerate them from the .puml sources.

### HuggingFace & GGUF Format

- Models — 900k+ pretrained model checkpoints
- Datasets — curated training & benchmark data
- Spaces — hosted Gradio / Streamlit demos
- Transformers library — unified API for 100+ architectures
- Inference API — run models via HTTP without GPU

### Running LLMs Locally

> **Why run locally?** 🔒 Privacy — data never leaves your machine 📶 Offline — no internet connection required 💰 Free — no API costs after setup 🔧 Dev-friendly — custom fine-tunes, no rate limits


---

## References & Further Reading


**Conclusion**

- [deeplearning.ai](https://www.deeplearning.ai/)
- [Karpathy.ai](https://karpathy.ai/)
- [promptingguide.ai](https://www.promptingguide.ai/)
- [LangGraph](https://langchain-ai.github.io/langgraph/)
- [modelcontextprotocol.io](https://modelcontextprotocol.io/)
- [@karpathy](https://x.com/karpathy)

---

*This article was drawn from the "Understanding Artificial Intelligence" slide guide by Vincenzo Marafioti — six chapters of hands-on AI experience, shared openly. The full interactive presentation is publicly available on GitHub.*
