import { TopicSeed } from './types';

export const PILLAR_2_COMPONENTS: TopicSeed[] = [
  // 2.1 Vector Storage & Retrieval Infrastructure
  {
    topicId: 'AIC001',
    slug: 'distributed-vector-databases',
    title: 'Distributed Vector Databases & Partitioning',
    categorySlug: 'vector-storage-retrieval',
    pillar: 'components',
    priority: 'P0',
    difficulty: 'ADVANCED',
    durationMin: 25,
    frequency: 0.95,
    weight: 0.96,
    trend: 'SURGING',
    description: 'Multi-node vector sharding strategies (hash-based, tenant-isolated), replication quorums, DiskANN memory-mapped SSD index architectures, and single-stage filtered vector search (ACORN/Qdrant).',
    rubricAtoms: ['vector sharding strategies', 'diskann ssd indexing', 'single stage payload filtering', 'replication and read quorums'],
    prerequisites: ['vector-indexing-ivf-hnsw'],
    questions: [
      {
        id: 'q_aic001_01',
        title: 'Pre-Filtering vs Post-Filtering vs Single-Stage Filtered Vector Search',
        difficulty: 'ADVANCED',
        learningLevel: 'L4',
        archetype: 'mechanism',
        prompt: 'In enterprise vector databases (100M vectors with metadata like tenant_id and department_id), contrast Pre-Filtering, Post-Filtering, and Single-Stage Filtered HNSW (e.g. Qdrant payload index / ACORN). Why do naive Pre-filtering and Post-filtering collapse under selective metadata queries?',
        rubricGuide: 'Candidate must explain: Post-filtering searches top-K vectors first, then filters by metadata; if the filter is highly selective (e.g. matches 0.1% of docs), top-K contains 0 matching results (recall drops to zero). Pre-filtering queries the metadata index first, creating an ID set, then runs brute-force scans (defeats HNSW speed) or rebuilds a subgraph on the fly. Single-stage filtered HNSW traverses the graph while checking payload constraints on candidate edges, maintaining high recall and sub-20ms latency.',
        rubricAtoms: ['post filtering recall collapse', 'pre filtering brute force trap', 'single stage graph traversal filtering'],
        hints: ['What happens in post-filtering if 99.9% of documents belong to other tenants?'],
        followUpProbes: ['How does DiskANN use compressed vectors (PQ) in RAM with full vectors on NVMe SSD to store 1 billion vectors per node?'],
        expectedKeywords: ['pre-filtering', 'post-filtering', 'single-stage filtered search', 'HNSW', 'ACORN', 'DiskANN', 'metadata payload']
      }
    ]
  },
  {
    topicId: 'AIC002',
    slug: 'hybrid-retrieval-reranking',
    title: 'Production Hybrid Retrieval & Cross-Encoder Re-Ranking',
    categorySlug: 'vector-storage-retrieval',
    pillar: 'components',
    priority: 'P0',
    difficulty: 'INTERMEDIATE',
    durationMin: 20,
    frequency: 0.96,
    weight: 0.96,
    trend: 'SURGING',
    description: 'Dense semantic embeddings + Sparse lexical search (BM25 / SPLADE), Reciprocal Rank Fusion (RRF), Cross-Encoder re-rankers (Cohere, BGE-Reranker), and context compression to solve the Lost-in-the-Middle phenomenon.',
    rubricAtoms: ['reciprocal rank fusion rrf', 'bm25 sparse dense combination', 'cross-encoder full cross attention', 'lost in the middle mitigation'],
    prerequisites: ['document-ingestion-chunking', 'vector-indexing-ivf-hnsw'],
    questions: [
      {
        id: 'q_aic002_01',
        title: 'Two-Stage Retrieval: Bi-Encoder Fast Scan + Cross-Encoder Re-Ranking',
        difficulty: 'INTERMEDIATE',
        learningLevel: 'L3',
        archetype: 'architecture',
        prompt: 'Why is two-stage retrieval (Bi-Encoder retrieval followed by Cross-Encoder re-ranking) the production gold standard for RAG? Why not use Cross-Encoders for initial vector index search?',
        rubricGuide: 'Candidate must explain: Bi-Encoders compute document embeddings offline and use dot product at query time (O(1) per pair, enabling sub-10ms ANN search over millions of items, but losing cross-token interactions). Cross-Encoders feed (query, document) together through all self-attention layers, computing true token-level semantic interactions. Cross-Encoders are too slow to scan millions of docs (O(N) full model forward passes), so they are applied only to top-50 candidates retrieved by the Bi-Encoder, re-ranking them to top-5.',
        rubricAtoms: ['bi-encoder offline vector precomputation', 'cross-encoder all-to-all attention math', 'two-stage latency throughput trade-off'],
        hints: ['Can you index a billion documents in HNSW using a Cross-Encoder?'],
        followUpProbes: ['How does Reciprocal Rank Fusion (RRF) combine scores without requiring score normalization across BM25 and cosine scales?'],
        expectedKeywords: ['bi-encoder', 'cross-encoder', 're-ranking', 'two-stage retrieval', 'RRF', 'attention interaction']
      }
    ]
  },
  {
    topicId: 'AIC003',
    slug: 'graphrag-knowledge-graphs',
    title: 'GraphRAG & Knowledge Graph-Augmented RAG',
    categorySlug: 'vector-storage-retrieval',
    pillar: 'components',
    priority: 'P1',
    difficulty: 'ADVANCED',
    durationMin: 25,
    frequency: 0.90,
    weight: 0.92,
    trend: 'SURGING',
    description: 'Entity-relationship graph extraction from text chunks, Leiden community clustering, hierarchical graph summarization, multi-hop reasoning, and hybrid Graph-Vector unified retrieval.',
    rubricAtoms: ['entity relationship extraction', 'leiden community detection', 'hierarchical graph summaries', 'multi-hop global dataset reasoning'],
    prerequisites: ['hybrid-retrieval-reranking'],
    questions: [
      {
        id: 'q_aic003_01',
        title: 'GraphRAG vs Vector RAG for Global Dataset Queries',
        difficulty: 'ADVANCED',
        learningLevel: 'L4',
        archetype: 'comparison',
        prompt: 'A candidate asks: "What are the major systemic engineering risks across all 5,000 incident reports from the past 3 years?" Why does traditional vector RAG completely fail this query, and how does Microsoft/Neo4j GraphRAG answer it successfully?',
        rubricGuide: 'Must explain: Vector RAG searches top-K chunks by similarity to the prompt. A global thematic question matches no specific chunk well, returning disconnected fragments. GraphRAG extracts entities and relationships into a knowledge graph, runs Leiden community detection to cluster related entities, and pre-generates hierarchical summaries of each community at index time. The global query executes Map-Reduce over top-level community summaries, synthesizing systemic insights across the entire corpus.',
        rubricAtoms: ['vector rag top-k local blind spot', 'leiden community clustering', 'hierarchical community summaries map-reduce'],
        hints: ['Does vector search understand the global theme of an entire dataset without asking a question about a specific entity?'],
        followUpProbes: ['What is the indexing cost trade-off of LLM entity extraction and community summarization compared to pure vector embedding?'],
        expectedKeywords: ['GraphRAG', 'Leiden algorithm', 'community detection', 'hierarchical summaries', 'global query', 'multi-hop']
      }
    ]
  },

  // 2.2 LLM Serving & Compute Infrastructure
  {
    topicId: 'AIC004',
    slug: 'llm-serving-vllm',
    title: 'High-Throughput Serving & Continuous Batching',
    categorySlug: 'llm-serving-compute',
    pillar: 'components',
    priority: 'P0',
    difficulty: 'ADVANCED',
    durationMin: 25,
    frequency: 0.98,
    weight: 0.98,
    trend: 'SURGING',
    description: 'Continuous batching (iteration-level scheduling) vs static batching, compute-bound prefill phase vs memory-bandwidth-bound decode phase, chunked prefill, and TensorRT-LLM / vLLM runtime architectures.',
    rubricAtoms: ['continuous iteration-level batching', 'prefill compute vs decode memory bound', 'chunked prefill scheduling', 'gpu utilization optimization'],
    prerequisites: ['genai-llm-foundations', 'attention-mechanism-transformers'],
    questions: [
      {
        id: 'q_aic004_01',
        title: 'Static Batching vs Continuous Batching in LLM Inference',
        difficulty: 'ADVANCED',
        learningLevel: 'L4',
        archetype: 'mechanism',
        prompt: 'Why does traditional static request batching (used in classical deep learning) cause severe GPU underutilization and latency spikes during LLM inference? How does continuous (iteration-level) batching eliminate the head-of-line blocking problem?',
        rubricGuide: 'Candidate must explain: Generation sequence lengths vary wildly (one user needs 10 tokens, another needs 1,000). In static batching, all requests are locked in a batch until the longest request completes, forcing finished requests to idle and wasting GPU compute on padding tokens. Continuous batching operates at the token-iteration level: as soon as request A emits an EOS token, it is evicted, and a new request B is immediately inserted into the active batch without waiting for request C.',
        rubricAtoms: ['static batch padding waste', 'iteration-level dynamic insertion', 'elimination of head-of-line blocking'],
        hints: ['Think of static batching like an elevator that refuses to open its doors until all passengers have reached the top floor.'],
        followUpProbes: ['How does Chunked Prefill prevent new long prompt arrivals from starving existing decode streams?'],
        expectedKeywords: ['continuous batching', 'iteration-level scheduling', 'vLLM', 'padding tokens', 'EOS token', 'chunked prefill']
      }
    ]
  },
  {
    topicId: 'AIC005',
    slug: 'kv-cache-pagedattention',
    title: 'KV-Cache Memory Management & PagedAttention',
    categorySlug: 'llm-serving-compute',
    pillar: 'components',
    priority: 'P0',
    difficulty: 'ADVANCED',
    durationMin: 25,
    frequency: 0.96,
    weight: 0.98,
    trend: 'SURGING',
    description: 'KV-cache VRAM footprint calculations, internal and external memory fragmentation in contiguous allocation, PagedAttention non-contiguous block tables, Radix prefix caching, and prompt cache eviction policies.',
    rubricAtoms: ['pagedattention virtual memory paging', 'kv-cache fragmentation elimination', 'radix tree prefix caching', 'kv cache sizing formula'],
    prerequisites: ['llm-serving-vllm'],
    questions: [
      {
        id: 'q_aic005_01',
        title: 'PagedAttention: Eliminating KV-Cache Virtual Memory Fragmentation',
        difficulty: 'ADVANCED',
        learningLevel: 'L4',
        archetype: 'mechanism',
        prompt: 'Before vLLM PagedAttention, state-of-the-art serving systems wasted 60%–80% of GPU VRAM on KV-cache memory allocation. What caused this waste, and how does PagedAttention apply OS virtual memory paging concepts to KV-cache management?',
        rubricGuide: 'Candidate must explain: Contiguous memory allocation required pre-allocating memory for the worst-case maximum sequence length (e.g. 4k tokens) up front, causing internal fragmentation if the output was only 50 tokens. Also, requests of varying lengths caused external fragmentation. PagedAttention divides the KV-cache into small fixed-size memory blocks (e.g. 16 tokens). A block table maps logical token positions to physical non-contiguous GPU memory pages, allowing near 100% memory utilization and sharing of prompt prefix blocks across requests.',
        rubricAtoms: ['worst-case contiguous pre-allocation waste', 'block table logical to physical mapping', 'prefix block sharing across requests'],
        hints: ['Recall how the OS page table maps non-contiguous physical RAM to contiguous virtual address space.'],
        followUpProbes: ['How does Radix Tree prefix caching allow system prompts to be reused across millions of users with zero prefill compute?'],
        expectedKeywords: ['PagedAttention', 'vLLM', 'virtual memory', 'block table', 'internal fragmentation', 'prefix caching', 'Radix Tree']
      }
    ]
  },
  {
    topicId: 'AIC006',
    slug: 'quantization-speculative-decoding',
    title: 'Quantization (FP8/AWQ) & Speculative Decoding',
    categorySlug: 'llm-serving-compute',
    pillar: 'components',
    priority: 'P1',
    difficulty: 'ADVANCED',
    durationMin: 25,
    frequency: 0.92,
    weight: 0.94,
    trend: 'SURGING',
    description: 'Weight-only (AWQ, GPTQ) vs Weight-and-Activation (FP8, INT8) quantization, FlashAttention-2/3 kernel memory access patterns, draft-model speculative verification loops, and acceptance rate tuning.',
    rubricAtoms: ['fp8 vs int4 weight activation quantization', 'speculative decoding draft model verification', 'acceptance rate tuning', 'flashattention io-aware sram access'],
    prerequisites: ['llm-serving-vllm'],
    questions: [
      {
        id: 'q_aic006_01',
        title: 'Speculative Decoding: Beating the Memory Bandwidth Bottleneck',
        difficulty: 'ADVANCED',
        learningLevel: 'L4',
        archetype: 'mechanism',
        prompt: 'In autoregressive generation, generating 1 token requires loading all 70B parameters from GPU HBM into SRAM (memory bandwidth bound). How does Speculative Decoding generate multiple tokens per memory load cycle, and how does the acceptance criterion guarantee mathematical equivalence to the target model?',
        rubricGuide: 'Candidate must explain: A small, ultra-fast draft model (e.g. Llama-3-8B) generates K candidate tokens quickly. The large target model (e.g. Llama-3-70B) runs a single parallel forward pass over all K tokens at once (which is compute-bound, utilizing idle GPU compute). A modified rejection sampling algorithm accepts tokens with probability min(1, p_target / p_draft). This guarantees the exact same output probability distribution as the target model alone, accelerating generation by 2x–3x.',
        rubricAtoms: ['draft model candidate generation', 'parallel forward pass validation', 'rejection sampling probability guarantee'],
        hints: ['Is running 1 forward pass on 5 tokens in parallel significantly slower than running 1 forward pass on 1 token on an H100?'],
        followUpProbes: ['What happens to speculative decoding latency when the acceptance rate drops below 40% on difficult coding tasks?'],
        expectedKeywords: ['speculative decoding', 'draft model', 'memory bandwidth', 'rejection sampling', 'acceptance rate', 'autoregressive']
      }
    ]
  },
  {
    topicId: 'AIC007',
    slug: 'distributed-multi-gpu-parallelism',
    title: 'Distributed Multi-GPU Parallelism (TP/PP/MoE)',
    categorySlug: 'llm-serving-compute',
    pillar: 'components',
    priority: 'P2',
    difficulty: 'EXPERT',
    durationMin: 30,
    frequency: 0.85,
    weight: 0.90,
    trend: 'STABLE',
    description: 'Tensor Parallelism (Megatron-LM column/row linear slicing), Pipeline Parallelism, Mixture of Experts (MoE) dynamic routing, all-reduce NCCL collective communication, and NVLink vs InfiniBand interconnect limits.',
    rubricAtoms: ['tensor parallelism column row linear', 'pipeline parallelism bubble overhead', 'moe expert routing all-to-all', 'nccl nvlink interconnect bandwidth'],
    prerequisites: ['llm-serving-vllm'],
    questions: [
      {
        id: 'q_aic007_01',
        title: 'Tensor Parallelism Slicing and NCCL Interconnect Saturation',
        difficulty: 'EXPERT',
        learningLevel: 'L5',
        archetype: 'mechanism',
        prompt: 'Explain how Tensor Parallelism (TP) splits an MLP layer across 8 GPUs using Megatron-LM column and row parallel linear layers. Why must Tensor Parallelism strictly run within a single node over NVLink rather than across nodes over InfiniBand?',
        rubricGuide: 'Must explain: Column parallel slices weight matrix W1 vertically (no communication needed for inputs); Row parallel slices W2 horizontally and requires an all-reduce across all 8 GPUs to sum partial results. Every single transformer layer requires 2 all-reduce operations per token generated. The ultra-low latency (<5μs) and massive bandwidth (900 GB/s on NVLink) of intra-node interconnects handles this without stalling; InfiniBand/Ethernet latency is 10x higher, causing severe GPU bubble stalls.',
        rubricAtoms: ['column and row linear decomposition', 'all-reduce per transformer layer', 'nvlink bandwidth vs inter-node latency'],
        hints: ['How many times per token generated must the GPUs synchronize their intermediate activations?'],
        followUpProbes: ['How does Pipeline Parallelism (PP) partition layers across nodes, and how do micro-batches mitigate the pipeline bubble?'],
        expectedKeywords: ['Tensor Parallelism', 'Megatron-LM', 'all-reduce', 'NCCL', 'NVLink', 'InfiniBand', 'latency bubble']
      }
    ]
  },
  {
    topicId: 'AIC008',
    slug: 'multi-lora-serving',
    title: 'Multi-LoRA Dynamic Serving & Adapter Swapping',
    categorySlug: 'llm-serving-compute',
    pillar: 'components',
    priority: 'P1',
    difficulty: 'ADVANCED',
    durationMin: 25,
    frequency: 0.90,
    weight: 0.92,
    trend: 'SURGING',
    description: 'Serving hundreds of tenant-specific fine-tuned LoRA adapters concurrently on a single base model, Punica / S-LoRA segmented gather-scatter matrix multiplication, GPU memory adapter caching, and cold swapping.',
    rubricAtoms: ['multi-lora unified batching', 'punica s-lora segmented gemm', 'dynamic adapter cache eviction', 'zero base model replication'],
    prerequisites: ['llm-serving-vllm', 'prompting-rag-finetuning-tradeoffs'],
    questions: [
      {
        id: 'q_aic008_01',
        title: 'Serving 1,000 Tenant-Specific Adapters on a Single Base Model',
        difficulty: 'ADVANCED',
        learningLevel: 'L4',
        archetype: 'architecture',
        prompt: 'A SaaS platform offers custom fine-tuned models for 1,000 corporate customers. Loading 1,000 separate 70B models into VRAM is impossible. How does Multi-LoRA serving (e.g. S-LoRA / vLLM LoRA) batch requests destined for different customer adapters into a single forward pass?',
        rubricGuide: 'Candidate must explain: All 1,000 models share the identical base model weights (frozen in VRAM). Each tenant only has small low-rank adapter matrices (A and B, typically 10–50MB). Multi-LoRA serving executes the base model computation concurrently for all requests in the batch, then uses specialized segmented matrix multiplication kernels (Segmented GEMM) to apply each request’s respective LoRA adapter dynamically. Adapters are cached in GPU VRAM and paged in from host RAM on demand.',
        rubricAtoms: ['frozen base model weight sharing', 'segmented gemm kernel execution', 'dynamic lora paging in vram'],
        hints: ['Are the base model weights different for each tenant, or only the rank-r update matrices?'],
        followUpProbes: ['How do you manage adapter cache eviction when concurrent traffic requests 200 distinct cold adapters simultaneously?'],
        expectedKeywords: ['Multi-LoRA', 'S-LoRA', 'vLLM', 'PEFT', 'Segmented GEMM', 'adapter paging', 'VRAM caching']
      }
    ]
  },

  // 2.3 Gateways, Observability & Evaluation
  {
    topicId: 'AIC009',
    slug: 'unified-ai-gateways',
    title: 'Unified AI Gateways, Routing & Semantic Caching',
    categorySlug: 'gateways-observability-evals',
    pillar: 'components',
    priority: 'P0',
    difficulty: 'INTERMEDIATE',
    durationMin: 20,
    frequency: 0.94,
    weight: 0.95,
    trend: 'SURGING',
    description: 'LiteLLM / Portkey architecture, provider fallback chains (OpenAI $\rightarrow$ Anthropic $\rightarrow$ self-hosted vLLM), rate limiting, semantic response caching (GPTCache), prompt deduplication, and cost attribution per tenant.',
    rubricAtoms: ['provider fallback circuit breaker', 'semantic cache similarity threshold', 'tenant token quota attribution', 'streaming sse gateway proxy'],
    prerequisites: ['genai-llm-foundations'],
    questions: [
      {
        id: 'q_aic009_01',
        title: 'Semantic Caching Architecture & Similarity Threshold Tuning',
        difficulty: 'INTERMEDIATE',
        learningLevel: 'L3',
        archetype: 'mechanism',
        prompt: 'Standard HTTP caches use exact key matching. Why does exact hashing fail for LLM prompts, and how does Semantic Caching work? What critical failure modes arise if the cosine similarity threshold is tuned too loosely?',
        rubricGuide: 'Must explain: Minor prompt variations ("What is the capital of France?" vs "Tell me the capital of France") produce distinct hash keys. Semantic caching embeds incoming prompts and searches an in-memory vector cache. If similarity > threshold (e.g. 0.95), the cached completion is returned, cutting latency to <20ms and cost to $0. If the threshold is too loose (e.g. 0.80), prompts with subtle but critical negations ("How do I deploy?" vs "How do I NOT deploy?") return completely wrong, dangerous answers.',
        rubricAtoms: ['semantic embedding cache lookup', 'threshold tuning trade-off', 'subtle negation false positive risk'],
        hints: ['What happens when two prompts share 85% vector similarity but ask opposite questions?'],
        followUpProbes: ['How do you ensure semantic cache invalidation when underlying backend data changes?'],
        expectedKeywords: ['semantic caching', 'GPTCache', 'cosine threshold', 'false positive', 'latency reduction', 'token cost']
      }
    ]
  },
  {
    topicId: 'AIC010',
    slug: 'gpu-sizing-capacity-planning',
    title: 'GPU Cluster Sizing & Capacity Planning',
    categorySlug: 'gateways-observability-evals',
    pillar: 'components',
    priority: 'P0',
    difficulty: 'ADVANCED',
    durationMin: 25,
    frequency: 0.92,
    weight: 0.95,
    trend: 'SURGING',
    description: 'Concrete VRAM parameter calculation formulas (Params $\\times$ Precision), KV-cache memory sizing equations, Model FLOPs Utilization (MFU), target concurrency throughput math, and spot GPU cluster orchestration.',
    rubricAtoms: ['vram parameter memory formula', 'kv cache sizing equation', 'model flops utilization mfu', 'cluster concurrency sizing'],
    prerequisites: ['llm-serving-vllm', 'kv-cache-pagedattention'],
    questions: [
      {
        id: 'q_aic010_01',
        title: 'Back-of-the-Envelope GPU Sizing for a 70B Model at 1,000 Concurrent Streams',
        difficulty: 'ADVANCED',
        learningLevel: 'L4',
        archetype: 'scenario-based',
        prompt: 'You are sizing an H100 (80GB VRAM) inference cluster for a 70B parameter model in FP16 precision. The system must support 1,000 concurrent active users with an average context length of 4,096 tokens using GQA (8 KV heads, head dimension 128, 80 layers). Calculate: 1) Model weight VRAM; 2) Total KV-cache VRAM needed; 3) Total number of H100 GPUs required.',
        rubricGuide: 'Candidate must calculate: 1) Model weights: 70B params * 2 bytes (FP16) = 140 GB. 2) KV-cache per token = 2 (K+V) * layers (80) * kv_heads (8) * head_dim (128) * 2 bytes = 327,680 bytes = ~320 KB/token. For 4,096 tokens = ~1.31 GB per stream. For 1,000 streams = 1,310 GB of KV cache. 3) Total VRAM = 140 GB (weights) + 1,310 GB (cache) = 1,450 GB. With 80GB H100s (leaving 15% headroom for CUDA kernels/activations = 68GB usable), GPUs required = 1,450 / 68 = ~22 GPUs (typically deployed as 3 nodes of 8x H100s = 24 GPUs with Tensor Parallelism = 8).',
        rubricAtoms: ['model weight precision math', 'kv-cache formula layers heads tokens', 'usable vram headroom and gpu count'],
        hints: ['Remember: KV cache memory = 2 * n_layers * n_kv_heads * d_head * bytes_per_elem * seq_len.'],
        followUpProbes: ['How does FP8 quantization for both weights and KV cache reduce the required GPU count by half?'],
        expectedKeywords: ['VRAM calculation', 'KV-cache formula', 'H100 80GB', 'FP16', 'GQA', 'concurrency sizing', 'Tensor Parallelism']
      }
    ]
  },
  {
    topicId: 'AIC011',
    slug: 'automated-llm-evals',
    title: 'Automated LLM Evaluation Pipelines & Evals',
    categorySlug: 'gateways-observability-evals',
    pillar: 'components',
    priority: 'P0',
    difficulty: 'INTERMEDIATE',
    durationMin: 20,
    frequency: 0.95,
    weight: 0.96,
    trend: 'SURGING',
    description: 'The RAG Triad (Context Relevance, Groundedness, Answer Relevance), LLM-as-a-Judge calibration, pairwise Elo ranking, synthetic evaluation dataset generation, regression testing in CI/CD, and agent trajectory evals.',
    rubricAtoms: ['rag triad three pillars', 'llm-as-a-judge bias calibration', 'pairwise elo ranking', 'ci cd prompt regression testing'],
    prerequisites: ['prompt-engineering-reasoning'],
    questions: [
      {
        id: 'q_aic011_01',
        title: 'The RAG Triad and Calibrating LLM-as-a-Judge',
        difficulty: 'INTERMEDIATE',
        learningLevel: 'L3',
        archetype: 'architecture',
        prompt: 'Define the three metrics of the RAG Triad (Context Relevance, Groundedness/Faithfulness, Answer Relevance). Why are traditional NLP metrics like BLEU and ROUGE useless for evaluating RAG, and how do you prevent position/verbosity bias in LLM-as-a-Judge evaluations?',
        rubricGuide: 'Candidate must explain: 1) Context Relevance measures if retrieved chunks are pertinent to the query; Groundedness measures if the answer is strictly derived from the context (hallucination detector); Answer Relevance measures if the answer addresses the user prompt. 2) BLEU/ROUGE compare n-gram overlaps and fail semantic equivalence. 3) LLM-as-a-Judge suffers from position bias (prefers candidate A), verbosity bias (prefers longer answers), and self-enhancement bias. Mitigated by: swapping candidate order, few-shot calibration rubrics, chain-of-thought grading, and anchoring against golden human test sets.',
        rubricAtoms: ['rag triad components', 'bleu rouge failure reasons', 'judge bias mitigation swapping cot'],
        hints: ['If candidate A is 50 words and candidate B is 200 words saying the exact same thing, which does a judge LLM naturally prefer?'],
        followUpProbes: ['How do you benchmark multi-step agent trajectories (tool selection accuracy, step count) vs single-turn Q&A?'],
        expectedKeywords: ['RAG Triad', 'Groundedness', 'Context Relevance', 'LLM-as-a-Judge', 'position bias', 'verbosity bias', 'BLEU', 'ROUGE']
      }
    ]
  },
  {
    topicId: 'AIC012',
    slug: 'llm-observability-tracing',
    title: 'LLM Observability, Tracing & Latency Telemetry',
    categorySlug: 'gateways-observability-evals',
    pillar: 'components',
    priority: 'P1',
    difficulty: 'INTERMEDIATE',
    durationMin: 20,
    frequency: 0.90,
    weight: 0.92,
    trend: 'RISING',
    description: 'OpenTelemetry GenAI semantic conventions, LangSmith / Arize Phoenix distributed spans, token latency waterfalls (DNS, TLS, TTFT, inter-token time, total completion), and prompt-completion cost attribution.',
    rubricAtoms: ['opentelemetry genai spans', 'token latency waterfall breakdown', 'per-token inter arrival time', 'distributed trace propagation'],
    prerequisites: ['unified-ai-gateways'],
    questions: [
      {
        id: 'q_aic012_01',
        title: 'Deconstructing the LLM Latency Waterfall: TTFT vs Inter-Token Latency',
        difficulty: 'INTERMEDIATE',
        learningLevel: 'L3',
        archetype: 'troubleshooting',
        prompt: 'In streaming generative applications, users complain of sluggish performance. Deconstruct the latency waterfall: what system factors contribute to Time-to-First-Token (TTFT) versus Inter-Token Latency (Time per Output Token - TPOT), and which optimization targets which phase?',
        rubricGuide: 'Candidate must dissect: 1) TTFT includes network round-trip, gateway routing, queue scheduling delay, and prompt prefill computation (processing all prompt tokens in parallel through transformer layers). TTFT is compute-bound and optimized via prompt prefix caching, prompt length pruning, and faster prefill kernels. 2) TPOT is the time to generate each subsequent token auto-regressively; it is memory-bandwidth bound and optimized via continuous batching, GQA, quantization (FP8), and speculative decoding.',
        rubricAtoms: ['ttft prefill compute bound', 'tpot decode memory bandwidth bound', 'prefix caching for ttft', 'speculative decoding for tpot'],
        hints: ['Why does a 10,000-token prompt take 2 seconds before the first word appears, even if generation speed is fast?'],
        followUpProbes: ['How do OpenTelemetry GenAI span attributes capture prompt and completion tokens for cost attribution without leaking confidential user PII into logging stores?'],
        expectedKeywords: ['TTFT', 'TPOT', 'latency waterfall', 'prefill phase', 'decode phase', 'OpenTelemetry', 'prefix caching']
      }
    ]
  },

  // 2.4 Agent Execution & Security Infrastructure
  {
    topicId: 'AIC013',
    slug: 'agentic-control-loops-mcp',
    title: 'Agentic Control Loops, MCP & Secure Sandboxing',
    categorySlug: 'agent-execution-security',
    pillar: 'components',
    priority: 'P0',
    difficulty: 'ADVANCED',
    durationMin: 25,
    frequency: 0.96,
    weight: 0.98,
    trend: 'SURGING',
    description: 'ReAct reasoning loops, Anthropic Model Context Protocol (MCP) server-client architecture, stdio vs SSE transports, tool execution idempotency, and Firecracker microVM / gVisor sandboxing for untrusted code execution.',
    rubricAtoms: ['react loop thought action observation', 'model context protocol mcp', 'firecracker microvm sandboxing', 'tool execution idempotency'],
    prerequisites: ['prompt-engineering-reasoning'],
    questions: [
      {
        id: 'q_aic013_01',
        title: 'Model Context Protocol (MCP) Architecture and Secure MicroVM Sandboxing',
        difficulty: 'ADVANCED',
        learningLevel: 'L4',
        archetype: 'architecture',
        prompt: 'Explain the architecture of the Model Context Protocol (MCP). How does it decouple AI client applications from tool-providing servers, and how must the execution runtime use Firecracker microVMs to execute arbitrary LLM-generated Python code securely?',
        rubricGuide: 'Candidate must explain: 1) MCP defines a standardized protocol over JSON-RPC (stdio or SSE) where MCP clients dynamically discover tools, resources, and prompt templates exposed by MCP servers without custom SDK integrations. 2) For code execution tools, running untrusted code in Docker containers is vulnerable to container breakouts and kernel privilege escalation. Firecracker microVMs provide hardware-level virtualization isolation (KVM) with sub-100ms startup times and minimal memory overhead, strictly preventing network access and host filesystem tampering.',
        rubricAtoms: ['mcp json-rpc discovery protocol', 'firecracker kvm hardware isolation', 'container breakout vulnerabilities'],
        hints: ['Why is standard Docker container isolation considered insufficient for executing arbitrary untrusted code generated by AI?'],
        followUpProbes: ['How do you enforce idempotency and two-phase commit when an agent invokes external third-party transactional APIs (e.g. Stripe, Sendgrid)?'],
        expectedKeywords: ['Model Context Protocol', 'MCP', 'JSON-RPC', 'Firecracker', 'microVM', 'gVisor', 'sandboxing', 'idempotency']
      }
    ]
  }
];

