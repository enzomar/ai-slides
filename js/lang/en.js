/* ═══════════════════════════════════════════════════════════
   AI SLIDES — English Language Strings
   All translatable UI and slide content for the presentation.
   Used by setLang('en') via window.LANG_EN lookup.
   ═══════════════════════════════════════════════════════════ */
window.LANG_EN = {

  /* ── COVER SLIDE ───────────────────────────────────────── */
  "cover.eyebrow":    "A Visual Journey for Everyone",
  "cover.h1":         "Understanding<br>Artificial Intelligence",
  "cover.author":     "Vincenzo MARAFIOTI",
  "cover.start":      "Start →",
  "cover.agenda":     "Jump to Agenda ↓",

  /* ── AGENDA ────────────────────────────────────────────── */
  "agenda.h2":        "What We'll Cover",

  "agenda.c1.num":    "01",
  "agenda.c1.title":  "Introduction to AI",
  "agenda.c1.desc":   "How LLMs work, key parameters, hardware, and the AI landscape.",

  "agenda.c2.num":    "02",
  "agenda.c2.title":  "Prompt Engineering",
  "agenda.c2.desc":   "From zero-shot to chain-of-thought — craft prompts that get results.",

  "agenda.c3.num":    "03",
  "agenda.c3.title":  "AI-Assisted Coding",
  "agenda.c3.desc":   "Copilots, AI-native IDEs, measured productivity gains and best practices.",

  "agenda.c4.num":    "04",
  "agenda.c4.title":  "RAG Architecture",
  "agenda.c4.desc":   "Retrieval-Augmented Generation — giving LLMs access to your knowledge.",

  "agenda.c5.num":    "05",
  "agenda.c5.title":  "AI Agents & MCP",
  "agenda.c5.desc":   "Autonomous agents, the ReAct loop, tool use, and the Model Context Protocol.",

  "agenda.c6.num":    "06",
  "agenda.c6.title":  "Ethics & Future",
  "agenda.c6.desc":   "Bias, hallucination, the EU AI Act, governance frameworks, and what's ahead.",

  "agenda.ca.num":    "A",
  "agenda.ca.title":  "Annex",
  "agenda.ca.desc":   "Glossary, model comparison, HuggingFace &amp; GGUF guide, local LLM tools, and learning resources.",

  /* ── CHAPTER 1 COVER ───────────────────────────────────── */
  "c1.cover.eyebrow": "Chapter 01",
  "c1.cover.h1":      "Introduction<br>to AI",
  "c1.cover.p":       "From bits to brains — how language models think, predict, and surprise us.",

  /* ── CH1 SLIDE 1: Deterministic vs Probabilistic ──────── */
  "c1.s1.eyebrow":    "Slide 01 · Foundations",
  "c1.s1.h2":         "Deterministic vs<br>Probabilistic Systems",
  "c1.s1.det.badge":  "Deterministic",
  "c1.s1.det.p":      "Same input → always same output. No surprise, fully predictable.",
  "c1.s1.det.li1":    "Calculator: 2+2 = always 4",
  "c1.s1.det.li2":    "Compiler: same code → same binary",
  "c1.s1.det.li3":    "Sorting algorithm: same array → same result",
  "c1.s1.prob.badge": "Probabilistic",
  "c1.s1.prob.p":     "Same input → different output each time, sampled from a probability distribution.",
  "c1.s1.prob.li1":   "Language model: 'The sky is ___' → blue / dark / vast / clear",
  "c1.s1.prob.li2":   "Image generator: same prompt → different images",
  "c1.s1.prob.li3":   "Recommendation engine: same history → varied suggestions",
  "c1.s1.why.label":  "Why does this matter?",
  "c1.s1.why.p":      "AI outputs are <strong>not facts</strong> — they are <strong>high-probability guesses</strong> based on patterns in training data. This is why two identical prompts can return different answers, and why human review matters.",

  /* ── CH1 SLIDE 2: Timeline ─────────────────────────────── */
  "c1.s2.eyebrow":    "Slide 02 · History",
  "c1.s2.h2":         "AI Timeline:<br>1950s to Today",

  /* ── CH1 SLIDE 3: Transformer Architecture ─────────────── */
  "c1.s3.eyebrow":    "Slide 03 · Architecture",
  "c1.s3.h2":         "The Transformer<br>Architecture",
  "c1.s3.p":          "Every major LLM today — GPT, Claude, Gemini, Llama — is built on the <strong>Transformer</strong> architecture introduced by Google in 2017.",
  "c1.s3.steps.title":"How it processes text:",
  "c1.s3.step1":      "<strong>Tokenise</strong> — split text into tokens (words or sub-words)",
  "c1.s3.step2":      "<strong>Embed</strong> — map each token to a vector in high-dimensional space",
  "c1.s3.step3":      "<strong>Attend</strong> — multi-head self-attention weighs relationships between tokens",
  "c1.s3.step4":      "<strong>Feed-Forward</strong> — deep layers transform representations",
  "c1.s3.step5":      "<strong>Predict</strong> — output layer gives probability over the next token",
  "c1.s3.insight":    "<strong>Key insight:</strong> Attention lets the model relate any token to any other regardless of distance — no forgetting unlike RNNs.",

  /* ── CH1 SLIDE 3b: Animated Token Prediction ───────────── */
  "c1.s3b.eyebrow":   "Slide 03b · Live Demo",
  "c1.s3b.h2":        "Animated: Token Prediction",

  /* ── CH1 SLIDE 3c: Animated Attention Heatmap ──────────── */
  "c1.s3c.eyebrow":   "Slide 03c · Live Demo",
  "c1.s3c.h2":        "Animated: Attention Heatmap",

  /* ── CH1 SLIDE 4: Key Parameters ───────────────────────── */
  "c1.s4.eyebrow":    "Slide 04 · Configuration",
  "c1.s4.h2":         "Key Model Parameters",
  "c1.s4.temp.name":  "Temperature",
  "c1.s4.temp.desc":  "Controls randomness. Low = deterministic &amp; precise. High = creative &amp; unpredictable.",
  "c1.s4.temp.range": "Range: 0.0 (deterministic) → 2.0 (chaotic). Recommended: 0.7 for balanced tasks.",
  "c1.s4.maxt.name":  "Max Tokens",
  "c1.s4.maxt.desc":  "Maximum length of the model's response in tokens (≈ ¾ of a word).",
  "c1.s4.maxt.range": "Typical limits: 4K–200K tokens. 1 page ≈ 500 tokens.",
  "c1.s4.topk.name":  "Top-K",
  "c1.s4.topk.desc":  "Considers only the top K most probable next tokens at each step.",
  "c1.s4.topk.range": "Example: Top-K=5 → only 5 candidates. Reduces hallucination risk.",
  "c1.s4.topp.name":  "Top-P (Nucleus)",
  "c1.s4.topp.desc":  "Considers smallest set of tokens whose cumulative probability ≥ P.",
  "c1.s4.topp.range": "Example: Top-P=0.9 → model picks from tokens summing to 90% probability.",

  /* ── CH1 SLIDE 5: Hardware ──────────────────────────────── */
  "c1.s5.eyebrow":    "Slide 05 · Infrastructure",
  "c1.s5.h2":         "Hardware &amp; Infrastructure",
  "c1.s5.cpu.title":  "CPU Inference",
  "c1.s5.cpu.p":      "Small models (≤ 7B) with quantisation (GGUF/llama.cpp). Slow but accessible.",
  "c1.s5.cgpu.title": "Consumer GPU",
  "c1.s5.cgpu.p":     "RTX 3090/4090 (24 GB VRAM) runs 7B–70B models. Ideal for local dev.",
  "c1.s5.dcgpu.title":"Data Centre GPU",
  "c1.s5.dcgpu.p":    "NVIDIA A100/H100 (80 GB HBM). Industry standard for training &amp; inference at scale.",
  "c1.s5.tpu.title":  "Cloud TPU",
  "c1.s5.tpu.p":      "Google TPU v5. Purpose-built for matrix multiply. Powers Gemini training.",

  /* ── CH1 SLIDE 6: Word Cloud ────────────────────────────── */
  "c1.s6.eyebrow":    "Slide 06 · Capabilities",
  "c1.s6.h2":         "What Can LLMs Do?",
  "c1.s6.legend.gen":    "Generation",
  "c1.s6.legend.nlp":    "NLP",
  "c1.s6.legend.class":  "Classification",
  "c1.s6.legend.reason": "Reasoning",
  "c1.s6.legend.multi":  "Multimodal",

  /* ── CH1 SLIDE 7: Frontier LLMs ────────────────────────── */
  "c1.s7.eyebrow":    "Slide 07 · Landscape",
  "c1.s7.h2":         "Frontier LLMs (2025)",
  "c1.s7.open.label": "Open?",

  /* ── CH1 REFERENCES ─────────────────────────────────────── */
  "c1.refs.eyebrow":  "References",
  "c1.refs.h2":       "Sources &amp; Further Reading",

  /* ── CHAPTER 2 COVER ───────────────────────────────────── */
  "c2.cover.eyebrow": "Chapter 02",
  "c2.cover.h1":      "Prompt<br>Engineering",
  "c2.cover.p":       "The art and science of talking to AI — crafting inputs that get the outputs you actually want.",

  /* ── CH2 SLIDE 1: Anatomy of a Prompt ──────────────────── */
  "c2.s1.eyebrow":    "Slide 01 · Foundations",
  "c2.s1.h2":         "Anatomy of a Prompt",
  "c2.s1.role.label": "Role",
  "c2.s1.role.p":     "Who the AI should be",
  "c2.s1.ctx.label":  "Context",
  "c2.s1.ctx.p":      "Background information",
  "c2.s1.task.label": "Task",
  "c2.s1.task.p":     "What to do",
  "c2.s1.fmt.label":  "Format",
  "c2.s1.fmt.p":      "Output structure",
  "c2.s1.cst.label":  "Constraints",
  "c2.s1.cst.p":      "Limits &amp; rules",

  /* ── CH2 SLIDE 2: Patterns ──────────────────────────────── */
  "c2.s2.eyebrow":    "Slide 02 · Techniques",
  "c2.s2.h2":         "Prompting Patterns",
  "c2.s2.zs.name":    "Zero-Shot",
  "c2.s2.zs.desc":    "No examples provided. Ask directly.",
  "c2.s2.zs.range":   "Best for: simple, clear tasks the model knows well.",
  "c2.s2.fs.name":    "Few-Shot",
  "c2.s2.fs.desc":    "Provide 2–5 examples of input → output before your question.",
  "c2.s2.fs.range":   "Best for: formatting, classification, style matching.",
  "c2.s2.cot.name":   "Chain-of-Thought",
  "c2.s2.cot.desc":   "Ask the model to 'think step by step' before answering.",
  "c2.s2.cot.range":  "Best for: math, logic, multi-step reasoning.",
  "c2.s2.sc.name":    "Self-Consistency",
  "c2.s2.sc.desc":    "Run the same prompt multiple times, pick the most common answer.",
  "c2.s2.sc.range":   "Best for: high-stakes decisions requiring reliability.",

  /* ── CH2 SLIDE 3: Advanced Techniques ──────────────────── */
  "c2.s3.eyebrow":    "Slide 03 · Advanced",
  "c2.s3.h2":         "Advanced Techniques",

  /* ── CH2 SLIDE 4: Do's & Don'ts ────────────────────────── */
  "c2.s4.eyebrow":    "Slide 04 · Best Practices",
  "c2.s4.h2":         "Do's &amp; Don'ts",
  "c2.s4.do.badge":   "✅ Do",
  "c2.s4.dont.badge": "❌ Don't",

  /* ── CH2 SLIDE 5: Real-World Examples ──────────────────── */
  "c2.s5.eyebrow":    "Slide 05 · Examples",
  "c2.s5.h2":         "Real-World Examples",

  /* ── CH2 SLIDE 6: Parameter Playground ─────────────────── */
  "c2.s6.eyebrow":    "Slide 06 · Interactive",
  "c2.s6.h2":         "Parameter Playground",
  "c2.s6.temp.label": "Temperature",
  "c2.s6.topp.label": "Top-P",
  "c2.s6.tokens.title":"Next-Token Probabilities",
  "c2.s6.output.title":"Sample Output",

  /* ── CH2 SLIDE 7: Exercise ──────────────────────────────── */
  "c2.s7.eyebrow":    "Slide 07 · Hands-On",
  "c2.s7.h2":         "Exercise: Prompt Refinement",

  /* ── CH2 REFERENCES ─────────────────────────────────────── */
  "c2.refs.eyebrow":  "References",
  "c2.refs.h2":       "Sources &amp; Further Reading",

  /* ── CHAPTER 3 COVER ───────────────────────────────────── */
  "c3.cover.eyebrow": "Chapter 03",
  "c3.cover.h1":      "AI-Assisted<br>Coding",
  "c3.cover.p":       "From autocomplete to autonomous coding agents — AI is reshaping how software is built.",

  /* ── CH3 SLIDE 1–6 headings ─────────────────────────────── */
  "c3.s1.eyebrow":    "Slide 01 · Concept",
  "c3.s1.h2":         "What is AI-Assisted Coding?",
  "c3.s2.eyebrow":    "Slide 02 · Workflow",
  "c3.s2.h2":         "The AI-Dev Loop",
  "c3.s3.eyebrow":    "Slide 03 · Tools",
  "c3.s3.h2":         "Tools Landscape",
  "c3.s4.eyebrow":    "Slide 04 · Reality Check",
  "c3.s4.h2":         "Reality Check",
  "c3.s5.eyebrow":    "Slide 05 · Research",
  "c3.s5.h2":         "Measured Impact",
  "c3.s6.eyebrow":    "Slide 06 · Hands-On",
  "c3.s6.h2":         "Exercise: CLI CSV Tool",
  "c3.refs.eyebrow":  "References",
  "c3.refs.h2":       "Sources &amp; Further Reading",

  /* ── CHAPTER 4 COVER ───────────────────────────────────── */
  "c4.cover.eyebrow": "Chapter 04",
  "c4.cover.h1":      "RAG<br>Architecture",
  "c4.cover.p":       "Retrieval-Augmented Generation — giving your LLM a memory and a library.",

  /* ── CH4 SLIDE 1–6 headings ─────────────────────────────── */
  "c4.s1.eyebrow":    "Slide 01 · Problem",
  "c4.s1.h2":         "The Problem RAG Solves",
  "c4.s2.eyebrow":    "Slide 02 · Architecture",
  "c4.s2.h2":         "RAG Pipeline",
  "c4.s3.eyebrow":    "Slide 03 · Components",
  "c4.s3.h2":         "Embeddings &amp; Vector DBs",
  "c4.s4.eyebrow":    "Slide 04 · Strategy",
  "c4.s4.h2":         "Chunking Strategies",
  "c4.s5.eyebrow":    "Slide 05 · Production",
  "c4.s5.h2":         "RAG in Production",
  "c4.s6.eyebrow":    "Slide 06 · Hands-On",
  "c4.s6.h2":         "Exercise: Design a RAG System",
  "c4.refs.eyebrow":  "References",
  "c4.refs.h2":       "Sources &amp; Further Reading",

  /* ── CHAPTER 5 COVER ───────────────────────────────────── */
  "c5.cover.eyebrow": "Chapter 05",
  "c5.cover.h1":      "AI Agents<br>& MCP",
  "c5.cover.p":       "From question-answering to autonomous action — AI that plans, uses tools, and gets things done.",

  /* ── CH5 SLIDE 1–5 headings ─────────────────────────────── */
  "c5.s1.eyebrow":    "Slide 01 · Concept",
  "c5.s1.h2":         "What is an AI Agent?",
  "c5.s1b.eyebrow":   "Slide 01b · Agentic Patterns (DeepLearning.AI)",
  "c5.s1b.h2":        "Andrew Ng's 4<br>Agentic Design Patterns",
  "c5.s2.eyebrow":    "Slide 02 · ReAct",
  "c5.s2.h2":         "Reason + Act:<br>The ReAct Loop",
  "c5.s3.eyebrow":    "Slide 03 · Tool Use",
  "c5.s3.h2":         "Tool Use &amp;<br>Function Calling",
  "c5.s4.eyebrow":    "Slide 04 · MCP",
  "c5.s4.h2":         "Model Context Protocol<br>(MCP)",
  "c5.s5.eyebrow":    "Slide 05 · Multi-Agent",
  "c5.s5.h2":         "Multi-Agent<br>Systems",
  "c5.refs.eyebrow":  "References",
  "c5.refs.h2":       "Sources &amp; Further Reading",

  /* ── CHAPTER 6 COVER ───────────────────────────────────── */
  "c6.cover.eyebrow": "Chapter 06",
  "c6.cover.h1":      "Ethics &amp;<br>Future",
  "c6.cover.p":       "Power without guardrails is a risk. Understanding AI's limits and responsibilities is everyone's job.",

  /* ── CH6 SLIDE 1–6 headings ─────────────────────────────── */
  "c6.s1.eyebrow":    "Slide 01 · Known Risks",
  "c6.s1.h2":         "Bias &amp; Hallucination",
  "c6.s2.eyebrow":    "Slide 02 · Governance",
  "c6.s2.h2":         "EU AI Act &amp;<br>Governance",
  "c6.s3.eyebrow":    "Slide 03 · Case Studies",
  "c6.s3.h2":         "Real-World<br>AI Failures",
  "c6.s4.eyebrow":    "Slide 04 · Frameworks",
  "c6.s4.h2":         "AI Governance<br>Frameworks",
  "c6.s5.eyebrow":    "Slide 05 · Responsible AI",
  "c6.s5.h2":         "Responsible AI<br>in Practice",
  "c6.s6.eyebrow":    "Slide 06 · Future",
  "c6.s6.h2":         "The Road Ahead",
  "c6.refs.eyebrow":  "References",
  "c6.refs.h2":       "Sources &amp; Further Reading",

  /* ── ANNEX COVER ────────────────────────────────────────── */
  "ann.cover.eyebrow":"Annex",
  "ann.cover.h1":     "Glossary &amp;<br>Resources",
  "ann.cover.p":      "Key definitions, model comparisons, HuggingFace &amp; GGUF guide, local LLM tools, and curated learning links.",

  /* ── ANNEX GLOSSARY 1 ───────────────────────────────────── */
  "ann.g1.eyebrow":   "Glossary · A–L",
  "ann.g1.h2":        "Key Terms A–L",

  /* ── ANNEX GLOSSARY 2 ───────────────────────────────────── */
  "ann.g2.eyebrow":   "Glossary · M–Z",
  "ann.g2.h2":        "Key Terms M–Z",

  /* ── ANNEX MODEL COMPARISON ─────────────────────────────── */
  "ann.mc.eyebrow":   "Model Comparison",
  "ann.mc.h2":        "LLM Landscape (2025)",
  "ann.mc.open":      "Open?",

  /* ── ANNEX HUGGINGFACE + GGUF ───────────────────────────── */
  "ann.hg.eyebrow":   "Annex · HuggingFace &amp; GGUF",
  "ann.hg.h2":        "HuggingFace &amp;<br>GGUF Anatomy",
  "ann.hg.hf.badge":  "🤗 HuggingFace",
  "ann.hg.hf.p":      "The GitHub of AI — the world's largest hub for open-source models, datasets, and Spaces (live demos).",
  "ann.hg.hf.li1":    "<strong>Models</strong> — 900k+ pre-trained models (text, vision, audio)",
  "ann.hg.hf.li2":    "<strong>Datasets</strong> — 200k+ datasets for training &amp; evaluation",
  "ann.hg.hf.li3":    "<strong>Spaces</strong> — Gradio/Streamlit apps hosted for free",
  "ann.hg.hf.li4":    "<strong>Transformers library</strong> — unified Python API for 100+ architectures",
  "ann.hg.hf.li5":    "<strong>Inference API</strong> — run models via REST without a GPU",
  "ann.hg.gguf.badge":"📦 GGUF Format",
  "ann.hg.gguf.p":    "<strong>GGUF</strong> (GPT-Generated Unified Format) is the standard container for quantised models used with <strong>llama.cpp</strong>, Ollama, LM Studio, and GPT4All.",
  "ann.hg.quant.title":"Quantisation Levels — size vs quality trade-off:",
  "ann.hg.filename":  "How to read a filename: <code>Llama-3.2-3B-Instruct-Q4_K_M.gguf</code>",
  "ann.hg.insight":   "<strong>Recommended starting point:</strong> <code>Q4_K_M</code> — excellent balance of size, speed, and quality for most use cases on consumer hardware.",

  /* ── ANNEX LOCAL LLM ────────────────────────────────────── */
  "ann.ll.eyebrow":   "Annex · Local LLM Tools",
  "ann.ll.h2":        "Running LLMs<br>Locally",
  "ann.ll.why.badge": "Why Run Locally?",
  "ann.ll.why.li1":   "🔒 <strong>Privacy</strong> — data never leaves your machine",
  "ann.ll.why.li2":   "✈️ <strong>Offline</strong> — works without internet",
  "ann.ll.why.li3":   "💰 <strong>Free</strong> — no API costs after download",
  "ann.ll.why.li4":   "🧪 <strong>Dev &amp; test</strong> — fast iteration, no rate limits",
  "ann.ll.tools.badge":"Popular Tools",
  "ann.ll.hw.badge":  "Hardware Requirements (GGUF Q4_K_M)",
  "ann.ll.hw.note":   "Minimum RAM = model size × 1.2 (system) + VRAM if GPU-accelerated.",
  "ann.ll.quick.badge":"Quick Start",

  /* ── ANNEX LEARNING RESOURCES ───────────────────────────── */
  "ann.lr.eyebrow":   "Learning Resources",
  "ann.lr.h2":        "Where to Learn More",
  "ann.lr.found":     "📚 Foundational",
  "ann.lr.pract":     "🛠️ Practical",
  "ann.lr.curr":      "📰 Stay Current",

  /* ── ANNEX CLOSING ──────────────────────────────────────── */
  "ann.close.eyebrow":"Thank You",
  "ann.close.h1":     "Questions?",
  "ann.close.back":   "← Back to Agenda",

  /* ── COMMON LABELS ──────────────────────────────────────── */
  "common.refs":      "References",
  "common.sources":   "Sources &amp; Further Reading",
  "common.insight":   "Key Insight",
  "common.example":   "Example",

};
