import { CategorySeed } from './types';

export const AI_SYSTEM_DESIGN_CATEGORIES: CategorySeed[] = [
  // Pillar 1: Principles & Fundamentals
  {
    slug: 'genai-foundations',
    name: 'Generative AI & Model Foundations',
    description: 'Tokens, embeddings, self-attention mechanisms, contextual chunking, and reasoning prompt patterns.',
    pillar: 'principles',
    sortOrder: 1
  },
  {
    slug: 'indexing-alignment-principles',
    name: 'Indexing & Alignment Principles',
    description: 'Approximate nearest neighbor indexing, RAG vs fine-tuning trade-offs, and safety content moderation.',
    pillar: 'principles',
    sortOrder: 2
  },

  // Pillar 2: Components & Infrastructure Patterns
  {
    slug: 'vector-storage-retrieval',
    name: 'Vector Storage & Retrieval Infrastructure',
    description: 'Distributed vector databases, hybrid sparse-dense retrieval, cross-encoders, and GraphRAG.',
    pillar: 'components',
    sortOrder: 3
  },
  {
    slug: 'llm-serving-compute',
    name: 'LLM Serving & Compute Infrastructure',
    description: 'Continuous batching (vLLM), PagedAttention KV-caches, quantization, multi-GPU parallelism, and multi-LoRA.',
    pillar: 'components',
    sortOrder: 4
  },
  {
    slug: 'gateways-observability-evals',
    name: 'Gateways, Observability & Evaluation',
    description: 'Unified AI gateways, GPU capacity sizing, RAG Triad automated evaluation, and OpenTelemetry tracing.',
    pillar: 'components',
    sortOrder: 5
  },
  {
    slug: 'agent-execution-security',
    name: 'Agent Execution & Security Infrastructure',
    description: 'Agentic control loops, Model Context Protocol (MCP), Firecracker microVM sandboxing, and tool idempotency.',
    pillar: 'components',
    sortOrder: 6
  },

  // Pillar 3: Real-World Systems & Case Studies
  {
    slug: 'ai-product-case-studies',
    name: 'Production AI Product Case Studies',
    description: 'End-to-end architectures: Copilot, Voice AI, Enterprise RAG, Perplexity search, Customer Support, and Multimodal Vision.',
    pillar: 'case-studies',
    sortOrder: 7
  }
];

