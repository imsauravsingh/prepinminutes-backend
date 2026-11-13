/**
 * PrepInMinutes — AI & GenAI Systems Engineering Roles
 * 
 * Governed by: CROSS_CUTTING_INTELLIGENCE_SPEC.md & TASK_EXECUTION_SEQUENCE.md
 */

import { RoleSeed } from "./types";

export const AI_ROLES: RoleSeed[] = [
  {
    slug: "applied-ai-engineer",
    name: "GenAI & RAG Applications Engineer",
    careerBand: "MID_LEVEL",
    track: "ai",
    description:
      "Full-stack AI applications engineer building production Retrieval-Augmented Generation (RAG) pipelines, semantic vector search, agentic control loops with tool calling/MCP, and automated LLM evaluation frameworks.",
    minProficiency: "L3",
    minExperienceYears: 2,
    maxExperienceYears: 5,
    companyEquivalents: {
      google: "L4 AI Applications Engineer",
      amazon: "L5 GenAI Engineer",
      meta: "E4 Applied AI SWE",
      openai: "Member of Technical Staff (Apps)",
      anthropic: "AI Engineer",
      microsoft: "61-62 Copilot Engineer",
    },
    requiredTopics: [
      { topicSlug: "genai-llm-foundations", isCore: true, priorityScore: 96, targetLevel: "L3", minimumDifficulty: "BEGINNER" },
      { topicSlug: "vector-embeddings-distance-metrics", isCore: true, priorityScore: 96, targetLevel: "L3", minimumDifficulty: "BEGINNER" },
      { topicSlug: "document-ingestion-chunking", isCore: true, priorityScore: 95, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "prompt-engineering-reasoning", isCore: true, priorityScore: 94, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "vector-indexing-ivf-hnsw", isCore: true, priorityScore: 92, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "hybrid-retrieval-reranking", isCore: true, priorityScore: 95, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "graphrag-knowledge-graphs", isCore: false, priorityScore: 88, targetLevel: "L3", minimumDifficulty: "ADVANCED" },
      { topicSlug: "agentic-control-loops-mcp", isCore: true, priorityScore: 96, targetLevel: "L3", minimumDifficulty: "ADVANCED" },
      { topicSlug: "automated-llm-evals", isCore: true, priorityScore: 94, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "enterprise-knowledge-assistant", isCore: true, priorityScore: 92, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "voice-ai-agent", isCore: false, priorityScore: 86, targetLevel: "L3", minimumDifficulty: "ADVANCED" },
      { topicSlug: "ai-safety-content-moderation", isCore: true, priorityScore: 90, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "lead-ownership-unblocking-dependencies", isCore: true, priorityScore: 90, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
    ],
  },
  {
    slug: "llm-infra-architect",
    name: "LLM Infrastructure & Serving Architect",
    careerBand: "STAFF",
    track: "ai",
    description:
      "Deep systems architect designing high-throughput LLM serving infrastructure (vLLM, TGI), PagedAttention KV-cache optimization, tensor/pipeline parallelism across GPU clusters, multi-LoRA serving, and automated capacity planning.",
    minProficiency: "L5",
    minExperienceYears: 8,
    maxExperienceYears: 12,
    companyEquivalents: {
      google: "L6 AI Systems Architect",
      meta: "E6 AI Infrastructure Architect",
      openai: "Staff Systems Engineer (Inference)",
      anthropic: "Staff Systems Infrastructure",
      databricks: "Staff AI Systems Architect",
    },
    requiredTopics: [
      { topicSlug: "llm-serving-vllm", isCore: true, priorityScore: 99, targetLevel: "L5", minimumDifficulty: "ADVANCED" },
      { topicSlug: "kv-cache-pagedattention", isCore: true, priorityScore: 98, targetLevel: "L5", minimumDifficulty: "ADVANCED" },
      { topicSlug: "quantization-speculative-decoding", isCore: true, priorityScore: 97, targetLevel: "L5", minimumDifficulty: "EXPERT" },
      { topicSlug: "distributed-multi-gpu-parallelism", isCore: true, priorityScore: 99, targetLevel: "L5", minimumDifficulty: "EXPERT" },
      { topicSlug: "multi-lora-serving", isCore: true, priorityScore: 95, targetLevel: "L5", minimumDifficulty: "ADVANCED" },
      { topicSlug: "unified-ai-gateways", isCore: true, priorityScore: 94, targetLevel: "L5", minimumDifficulty: "ADVANCED" },
      { topicSlug: "gpu-sizing-capacity-planning", isCore: true, priorityScore: 96, targetLevel: "L5", minimumDifficulty: "ADVANCED" },
      { topicSlug: "distributed-vector-databases", isCore: true, priorityScore: 95, targetLevel: "L5", minimumDifficulty: "ADVANCED" },
      { topicSlug: "llm-observability-tracing", isCore: true, priorityScore: 94, targetLevel: "L5", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "tradeoffs-technology-selection", isCore: true, priorityScore: 98, targetLevel: "L5", minimumDifficulty: "EXPERT" },
      { topicSlug: "lead-influence-without-authority-multiteam", isCore: true, priorityScore: 96, targetLevel: "L5", minimumDifficulty: "EXPERT" },
    ],
  },
];
