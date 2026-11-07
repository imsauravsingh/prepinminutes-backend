import { TopicSeed } from './types';

export const PILLAR_1_PRINCIPLES: TopicSeed[] = [
  // 1.1 Generative AI & Model Foundations
  {
    topicId: 'AIP001',
    slug: 'genai-llm-foundations',
    title: 'Foundations of Generative AI & Large Language Models',
    categorySlug: 'genai-foundations',
    pillar: 'principles',
    priority: 'P0',
    difficulty: 'BEGINNER',
    durationMin: 15,
    frequency: 0.95,
    weight: 0.95,
    trend: 'SURGING',
    description: 'Tokens, Byte-Pair Encoding (BPE), context window boundaries, generation sampling parameters (temperature, top-p, top-k), greedy vs nucleus sampling, system prompts, and TTFT vs TPOT latency metrics.',
    rubricAtoms: ['tokenization bpe encoding', 'temperature and top-p sampling', 'context window limits', 'ttft vs tpot latency'],
    prerequisites: [],
    questions: [
      {
        id: 'q_aip001_01',
        title: 'Tokenization, BPE and Context Window Constraints',
        difficulty: 'BEGINNER',
        learningLevel: 'L1',
        archetype: 'conceptual',
        prompt: 'In a production LLM application, why is measuring prompt payload in words or characters a severe architectural vulnerability compared to tokens? How does Byte-Pair Encoding (BPE) impact cost, memory, and context limits?',
        rubricGuide: 'Candidate must explain that LLMs process tokens (subword chunks, ~0.75 words/token in English, much higher in multilingual/code). Estimating via characters risks context window truncation, unexpected billing spikes, and out-of-memory errors on KV-cache prefill.',
        rubricAtoms: ['subword bpe tokenization', 'character vs token ratio', 'context window truncation risks'],
        hints: ['Consider how code snippets with indentation or non-English scripts tokenize into multiple tokens per word.'],
        followUpProbes: ['How do tokenizer mismatches between the embedding model and the generator LLM degrade RAG context retrieval?'],
        expectedKeywords: ['tokens', 'BPE', 'context window', 'subword', 'truncation', 'KV cache']
      }
    ]
  },
  {
    topicId: 'AIP002',
    slug: 'vector-embeddings-distance-metrics',
    title: 'Vector Embeddings & Mathematical Distance Metrics',
    categorySlug: 'genai-foundations',
    pillar: 'principles',
    priority: 'P0',
    difficulty: 'BEGINNER',
    durationMin: 15,
    frequency: 0.92,
    weight: 0.92,
    trend: 'SURGING',
    description: 'Dense vector representations, embedding dimensions (384 to 3072-d), Cosine Similarity vs Dot Product vs Euclidean (L2) distance, normalized embedding spaces, embedding model drift, and dimensionality trade-offs.',
    rubricAtoms: ['cosine similarity vs dot product', 'l2 euclidean distance', 'normalized vector spaces', 'embedding drift'],
    prerequisites: [],
    questions: [
      {
        id: 'q_aip002_01',
        title: 'Cosine Similarity vs Dot Product vs L2 Distance',
        difficulty: 'BEGINNER',
        learningLevel: 'L1',
        archetype: 'comparison',
        prompt: 'Compare Cosine Similarity, Dot Product, and Euclidean (L2) distance for high-dimensional vector search. When are Dot Product and Cosine Similarity mathematically identical, and why is Dot Product preferred for real-time inference?',
        rubricGuide: 'Candidate must explain: Cosine measures angle regardless of magnitude; Dot Product incorporates magnitude; L2 measures geometric distance. When embeddings are L2-normalized to unit length (|v|=1), Cosine Similarity equals Dot Product. Dot Product avoids expensive square root calculations during nearest neighbor scans, boosting SIMD/GPU throughput.',
        rubricAtoms: ['unit length normalization', 'dot product computational efficiency', 'cosine angular measurement'],
        hints: ['What happens to the denominator in the cosine formula when vectors are already normalized to length 1?'],
        followUpProbes: ['Why do unnormalized embeddings fail in Cosine search when magnitude conveys semantic significance?'],
        expectedKeywords: ['Cosine similarity', 'Dot Product', 'Euclidean L2', 'unit normalization', 'SIMD', 'GPU latency']
      }
    ]
  },
  {
    topicId: 'AIP003',
    slug: 'attention-mechanism-transformers',
    title: 'The Attention Mechanism & Transformer Architecture',
    categorySlug: 'genai-foundations',
    pillar: 'principles',
    priority: 'P1',
    difficulty: 'INTERMEDIATE',
    durationMin: 20,
    frequency: 0.88,
    weight: 0.90,
    trend: 'STABLE',
    description: 'Scaled Dot-Product Attention math, Multi-Head Attention (MHA) vs Multi-Query Attention (MQA) vs Grouped-Query Attention (GQA), Rotary Position Embeddings (RoPE), quadratic complexity O(N^2), and memory scaling bottlenecks.',
    rubricAtoms: ['scaled dot product attention', 'mha vs mqa vs gqa', 'rope positional embeddings', 'quadratic context complexity'],
    prerequisites: ['genai-llm-foundations'],
    questions: [
      {
        id: 'q_aip003_01',
        title: 'Grouped-Query Attention (GQA) vs Multi-Head Attention (MHA)',
        difficulty: 'INTERMEDIATE',
        learningLevel: 'L2',
        archetype: 'mechanism',
        prompt: 'Why has modern LLM architecture (Llama 3, Mistral) transitioned from Multi-Head Attention (MHA) to Grouped-Query Attention (GQA)? How does GQA dramatically reduce KV-cache memory bandwidth bottlenecks during auto-regressive generation?',
        rubricGuide: 'Must explain: In MHA, each query head has its own Key and Value head, requiring huge VRAM for KV-cache during inference. Multi-Query Attention (MQA) shares 1 KV head across all query heads, saving memory but causing quality degradation. GQA groups query heads (e.g. 8 Q heads per 1 KV head), preserving model quality while slashing KV-cache memory bandwidth by 8x.',
        rubricAtoms: ['mha memory footprint', 'gqa query head grouping', 'kv cache memory bandwidth reduction'],
        hints: ['Is LLM token generation compute-bound or memory-bandwidth-bound on GPUs?'],
        followUpProbes: ['How does Rotary Position Embedding (RoPE) enable context length extrapolation beyond initial pre-training lengths?'],
        expectedKeywords: ['MHA', 'GQA', 'MQA', 'KV cache', 'memory bandwidth', 'auto-regressive', 'RoPE']
      }
    ]
  },
  {
    topicId: 'AIP004',
    slug: 'document-ingestion-chunking',
    title: 'Document Ingestion, Chunking & Semantic Parsing',
    categorySlug: 'genai-foundations',
    pillar: 'principles',
    priority: 'P0',
    difficulty: 'BEGINNER',
    durationMin: 15,
    frequency: 0.94,
    weight: 0.95,
    trend: 'SURGING',
    description: 'Fixed-size vs sliding-window vs semantic chunking, boundary splitting, markdown/PDF layout parsing, table extraction, Anthropic contextual retrieval, and late chunking.',
    rubricAtoms: ['semantic chunking boundaries', 'sliding window overlap', 'layout aware table parsing', 'contextual retrieval late chunking'],
    prerequisites: ['vector-embeddings-distance-metrics'],
    questions: [
      {
        id: 'q_aip004_01',
        title: 'Fixed Token Chunking vs Semantic Chunking in Technical Documents',
        difficulty: 'BEGINNER',
        learningLevel: 'L1',
        archetype: 'trade-off',
        prompt: 'Why does naive fixed-size chunking (e.g. 500 tokens with 50-token overlap) fail on complex PDF manuals and financial tables? How does layout-aware semantic chunking prevent context fracturing?',
        rubricGuide: 'Candidate must explain: Fixed chunking splits tables in half, separates headers from bullet points, and cuts code blocks across boundaries, ruining vector semantic similarity. Semantic chunking respects AST/markdown document hierarchy, preserves whole table rows/schema, and uses contextual chunking to prepend document summaries to every chunk.',
        rubricAtoms: ['naive chunking failure modes', 'table and code fracturing', 'document hierarchy awareness', 'contextual prepending'],
        hints: ['What happens when an embedding model embeds a chunk that is just numbers without the table column headers?'],
        followUpProbes: ['How does late chunking compute embeddings over the entire document context before pooling into sub-chunks?'],
        expectedKeywords: ['semantic chunking', 'token boundary', 'table parsing', 'contextual retrieval', 'late chunking', 'PDF extraction']
      }
    ]
  },
  {
    topicId: 'AIP005',
    slug: 'prompt-engineering-reasoning',
    title: 'Prompt Engineering & Reasoning Patterns',
    categorySlug: 'genai-foundations',
    pillar: 'principles',
    priority: 'P0',
    difficulty: 'BEGINNER',
    durationMin: 15,
    frequency: 0.90,
    weight: 0.90,
    trend: 'STABLE',
    description: 'Zero-shot vs Few-shot in-context learning, Chain-of-Thought (CoT), System prompt governance, structured JSON schema output enforcement, instruction drift, and delimiters.',
    rubricAtoms: ['few-shot in-context learning', 'chain-of-thought reasoning', 'json schema constrained decoding', 'system prompt delimiters'],
    prerequisites: ['genai-llm-foundations'],
    questions: [
      {
        id: 'q_aip005_01',
        title: 'Structured Output Enforcement: JSON Schema vs Post-Validation',
        difficulty: 'BEGINNER',
        learningLevel: 'L1',
        archetype: 'mechanism',
        prompt: 'Why does relying purely on prompt instructions (e.g. "Respond only in valid JSON") fail at scale in production APIs, and how does grammar-constrained decoding (e.g. Outlines, vLLM guided decoding) guarantee 100% valid schema outputs?',
        rubricGuide: 'Candidate must explain that standard LLM token generation is probabilistic; edge cases or long outputs cause trailing commas, markdown fences (```json), or missing keys. Grammar-constrained decoding masks invalid logits at every decoding step so the LLM can literally only select tokens that satisfy the formal JSON BNF grammar.',
        rubricAtoms: ['probabilistic output failure', 'logit masking grammar decoding', 'bnf schema constraint'],
        hints: ['Can an LLM emit a comma if the JSON schema requires a closing brace at that position?'],
        followUpProbes: ['What is the latency and throughput penalty of grammar-constrained logit masking on high-concurrency vLLM workers?'],
        expectedKeywords: ['JSON schema', 'structured outputs', 'logit masking', 'grammar constrained', 'vLLM guided decoding', 'BNF']
      }
    ]
  },

  // 1.2 Indexing & Alignment Principles
  {
    topicId: 'AIP006',
    slug: 'vector-indexing-ivf-hnsw',
    title: 'Vector Indexing Fundamentals: IVF & HNSW',
    categorySlug: 'indexing-alignment-principles',
    pillar: 'principles',
    priority: 'P0',
    difficulty: 'INTERMEDIATE',
    durationMin: 20,
    frequency: 0.94,
    weight: 0.95,
    trend: 'SURGING',
    description: 'Exhaustive Flat scan vs Inverted File Index (IVFFlat), Voronoi cell partitioning, Hierarchical Navigable Small World (HNSW) multi-layer graphs, M and efSearch trade-offs, and recall vs latency curves.',
    rubricAtoms: ['ivfflat centroid clustering', 'hnsw multi-layer skip list', 'efsearch recall vs latency', 'flat exact scan baseline'],
    prerequisites: ['vector-embeddings-distance-metrics'],
    questions: [
      {
        id: 'q_aip006_01',
        title: 'HNSW Graph Navigation vs IVF-Flat Inverted Indexing',
        difficulty: 'INTERMEDIATE',
        learningLevel: 'L2',
        archetype: 'comparison',
        prompt: 'Contrast HNSW (Hierarchical Navigable Small World) with IVF-Flat indexing for 10 million vectors. Why does HNSW deliver 10x higher QPS at >95% recall, and what is its primary memory overhead drawback?',
        rubricGuide: 'Candidate must explain: IVF partitions space using k-means centroids; searching probes nprobe nearest Voronoi lists (susceptible to boundary misses and non-uniform cluster sizing). HNSW constructs a multi-layer graph inspired by skip-lists: top layers execute coarse long-distance routing, bottom layers navigate fine local neighborhoods. HNSW achieves high QPS and recall, but requires high RAM to store edge adjacency lists (often 1.5x–2x vector data size).',
        rubricAtoms: ['hnsw skip list graph routing', 'ivf voronoi centroid probing', 'hnsw memory overhead adjacency lists'],
        hints: ['Think about how skip-lists accelerate 1D search, and generalize that to multi-dimensional geometric graphs.'],
        followUpProbes: ['How does Product Quantization (PQ) combined with HNSW (HNSW-PQ) mitigate the memory footprint at the cost of recall?'],
        expectedKeywords: ['HNSW', 'IVF', 'Voronoi', 'nprobe', 'recall', 'latency', 'RAM overhead', 'skip list']
      }
    ]
  },
  {
    topicId: 'AIP007',
    slug: 'prompting-rag-finetuning-tradeoffs',
    title: 'The Scaling Decision: Prompt vs RAG vs Fine-Tune',
    categorySlug: 'indexing-alignment-principles',
    pillar: 'principles',
    priority: 'P0',
    difficulty: 'INTERMEDIATE',
    durationMin: 20,
    frequency: 0.96,
    weight: 0.98,
    trend: 'SURGING',
    description: 'The definitive architectural trade-off framework: In-Context Prompting vs Retrieval-Augmented Generation (RAG) vs Parameter-Efficient Fine-Tuning (PEFT/LoRA). Latency budgets, dynamic knowledge freshness, style alignment, and cost matrices.',
    rubricAtoms: ['knowledge freshness vs style alignment', 'peft lora adaptation boundaries', 'rag latency and retrieval overhead', 'cost per token economics'],
    prerequisites: ['genai-llm-foundations', 'document-ingestion-chunking'],
    questions: [
      {
        id: 'q_aip007_01',
        title: 'The Decision Matrix: When to RAG vs When to Fine-Tune',
        difficulty: 'INTERMEDIATE',
        learningLevel: 'L2',
        archetype: 'trade-off',
        prompt: 'A health insurance platform wants an AI assistant to answer questions about rapidly changing policy documents (updated weekly) while maintaining strict clinical terminology and conversational bedside manner. Walk through the decision matrix: should they use Prompting, RAG, Fine-Tuning, or a hybrid?',
        rubricGuide: 'Candidate must state: 1) Fine-Tuning is for teaching style, tone, format, and domain jargon, NOT for volatile dynamic knowledge (models hallucinate outdated training data and retraining weekly is cost-prohibitive); 2) RAG is mandatory for volatile, verifiable knowledge with direct source citations; 3) The optimal architecture is a Hybrid: Fine-tune a lightweight model (LoRA) for clinical tone and JSON schema conformance, coupled with a RAG pipeline for weekly policy retrieval.',
        rubricAtoms: ['rag for factual knowledge', 'fine-tuning for style and form', 'hybrid architecture solution', 'weekly document volatility'],
        hints: ['Can you update a fine-tuned model weights in 5 seconds when a policy document changes?'],
        followUpProbes: ['How does context window pricing compare to fine-tuning maintenance costs over a 12-month production lifecycle?'],
        expectedKeywords: ['RAG', 'Fine-tuning', 'LoRA', 'knowledge freshness', 'style adaptation', 'citations', 'hybrid architecture']
      }
    ]
  },
  {
    topicId: 'AIP008',
    slug: 'ai-safety-content-moderation',
    title: 'AI Safety Foundations & Content Moderation',
    categorySlug: 'indexing-alignment-principles',
    pillar: 'principles',
    priority: 'P1',
    difficulty: 'BEGINNER',
    durationMin: 15,
    frequency: 0.88,
    weight: 0.90,
    trend: 'RISING',
    description: 'Toxicity classification, hate speech and self-harm filters, prompt injection 101, regex and NER PII redacting (presidio), output moderation models (Llama-Guard), and ethical boundaries.',
    rubricAtoms: ['toxicity classification models', 'pii redacting presidio', 'llama-guard safety filtering', 'dual-stage input output screening'],
    prerequisites: ['genai-llm-foundations'],
    questions: [
      {
        id: 'q_aip008_01',
        title: 'Dual-Stage Moderation: Pre-Generation Screening vs Post-Generation Guardrails',
        difficulty: 'BEGINNER',
        learningLevel: 'L1',
        archetype: 'architecture',
        prompt: 'Why must enterprise AI architectures enforce dual-stage moderation (filtering both incoming user prompts and outgoing generated completions)? What attack vectors bypass input-only filters?',
        rubricGuide: 'Must explain: Input-only screening misses indirect prompt injections stored in retrieved documents (RAG poisoning) or jailbreaks that use ciphered instructions. Output filtering guarantees that even if the LLM is compromised or hallucinates toxic PII, the data is blocked before reaching the client.',
        rubricAtoms: ['input vs output guardrails', 'indirect prompt injection bypass', 'pii leak prevention'],
        hints: ['What happens if an attacker uploads a malicious PDF into your knowledge base that tells the LLM to output user emails?'],
        followUpProbes: ['How do you minimize the latency overhead of running safety classifiers on streaming responses?'],
        expectedKeywords: ['guardrails', 'dual-stage moderation', 'indirect prompt injection', 'PII', 'Llama-Guard', 'streaming latency']
      }
    ]
  }
];

