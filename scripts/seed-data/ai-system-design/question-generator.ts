import { TopicSeed, QuestionSeed } from './types';

interface ArchetypeTemplate {
  slot: number;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  learningLevel: 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
  archetype: QuestionSeed['archetype'];
  titleSuffix: string;
  promptBuilder: (topic: TopicSeed) => string;
  rubricBuilder: (topic: TopicSeed) => string;
  hintsBuilder: (topic: TopicSeed) => string[];
  followUpsBuilder: (topic: TopicSeed) => string[];
  keywordsBuilder: (topic: TopicSeed) => string[];
}

const AI_QUESTION_ARCHETYPE_TEMPLATES: ArchetypeTemplate[] = [
  // 4 Beginner Questions (L1)
  {
    slot: 1,
    difficulty: 'BEGINNER',
    learningLevel: 'L1',
    archetype: 'conceptual',
    titleSuffix: 'Core Architectural Concepts & Mental Model',
    promptBuilder: (t) =>
      `Explain the fundamental architectural role of ${t.title}. What core GenAI engineering problem does it solve, and how does it fit into modern production AI systems?`,
    rubricBuilder: (t) =>
      `Candidate must clearly define ${t.title}, state the motivation/problem solved (${t.description}), and establish the core boundaries without confusing it with adjacent components.`,
    hintsBuilder: (t) => [
      `Think about why standard non-AI or naive LLM setups fail without ${t.title.toLowerCase()}.`,
      `Focus on: ${t.rubricAtoms.slice(0, 2).join(', ')}.`
    ],
    followUpsBuilder: (t) => [
      `What are the most common misconceptions engineers have when first implementing ${t.title}?`,
      `How does ${t.title} impact overall generation latency and cost?`
    ],
    keywordsBuilder: (t) => [t.title, ...t.rubricAtoms.slice(0, 3), 'latency', 'architecture', 'GenAI']
  },
  {
    slot: 2,
    difficulty: 'BEGINNER',
    learningLevel: 'L1',
    archetype: 'conceptual',
    titleSuffix: 'Key Terminology, Protocols & Data Formats',
    promptBuilder: (t) =>
      `What are the primary interfaces, protocols, and standard terminology associated with ${t.title}? Detail the typical client-server or pipeline interaction flow.`,
    rubricBuilder: (t) =>
      `Must outline the primary terminology and data flow for ${t.title}, demonstrating a solid grasp of foundational building blocks (${t.rubricAtoms.join(', ')}).`,
    hintsBuilder: (t) => [
      `Trace a request from client arrival through ${t.title} to storage, GPU kernels, or downstream services.`
    ],
    followUpsBuilder: (t) => [
      `How are streaming token payloads handled during this interaction?`,
      `What happens if client connectivity drops mid-generation?`
    ],
    keywordsBuilder: (t) => [t.title, 'interface', 'data flow', ...t.rubricAtoms.slice(0, 2)]
  },
  {
    slot: 3,
    difficulty: 'BEGINNER',
    learningLevel: 'L1',
    archetype: 'comparison',
    titleSuffix: 'Naive Baseline vs Production Approach',
    promptBuilder: (t) =>
      `Compare a naive, rudimentary approach to handling ${t.title} with an enterprise-grade production implementation. What breaks when scaling beyond a prototype?`,
    rubricBuilder: (t) =>
      `Candidate must contrast prototype shortcuts with production realities, highlighting bottlenecks in throughput, VRAM footprint, or latency.`,
    hintsBuilder: (t) => [
      `What happens when 500 concurrent requests hit the naive implementation simultaneously?`
    ],
    followUpsBuilder: (t) => [
      `How does memory or compute consumption scale under production load?`,
      `What telemetry metric warns you that the naive approach is failing?`
    ],
    keywordsBuilder: (t) => [t.title, 'naive vs production', 'concurrency', 'scalability']
  },
  {
    slot: 4,
    difficulty: 'BEGINNER',
    learningLevel: 'L1',
    archetype: 'trade-off',
    titleSuffix: 'Foundational Trade-offs & Resource Constraints',
    promptBuilder: (t) =>
      `What are the primary engineering trade-offs when configuring ${t.title}? Detail the balance between latency, accuracy/quality, and infrastructure cost.`,
    rubricBuilder: (t) =>
      `Must articulate that there is no free lunch in AI systems; every gain in accuracy or throughput typically trades off with GPU VRAM, token cost, or latency.`,
    hintsBuilder: (t) => [
      `Consider GPU memory bandwidth vs compute utilization.`
    ],
    followUpsBuilder: (t) => [
      `Under what conditions would you deliberately sacrifice peak accuracy in favor of lower latency?`
    ],
    keywordsBuilder: (t) => [t.title, 'trade-offs', 'cost', 'latency', 'accuracy']
  },

  // 6 Intermediate Questions (L2–L3)
  {
    slot: 5,
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L2',
    archetype: 'mechanism',
    titleSuffix: 'Internal Mechanics & Algorithmic Execution',
    promptBuilder: (t) =>
      `Walk through the internal operational mechanisms of ${t.title}. How does it process incoming requests or data at the algorithmic level?`,
    rubricBuilder: (t) =>
      `Candidate must walk step-by-step through internal execution, citing relevant mechanisms: ${t.rubricAtoms.join(', ')}.`,
    hintsBuilder: (t) => [
      `Trace the internal lifecycle from input ingestion to final processed output.`
    ],
    followUpsBuilder: (t) => [
      `What is the algorithmic time and space complexity of this mechanism?`
    ],
    keywordsBuilder: (t) => [t.title, 'mechanism', 'algorithmic flow', ...t.rubricAtoms]
  },
  {
    slot: 6,
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L2',
    archetype: 'implementation',
    titleSuffix: 'Production Configuration & Tuning Parameters',
    promptBuilder: (t) =>
      `What are the critical configuration parameters and tuning knobs for ${t.title} in a high-scale environment? What are the consequences of misconfiguration?`,
    rubricBuilder: (t) =>
      `Must identify specific tuning parameters, optimal defaults, and explain the physical degradation caused by misconfigured buffers, thresholds, or cache sizes.`,
    hintsBuilder: (t) => [
      `Think about memory allocation, batch sizes, or indexing thresholds.`
    ],
    followUpsBuilder: (t) => [
      `How do you benchmark optimal parameter values for your specific workload?`
    ],
    keywordsBuilder: (t) => [t.title, 'configuration', 'tuning knobs', 'benchmarking']
  },
  {
    slot: 7,
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L3',
    archetype: 'scenario-based',
    titleSuffix: 'Traffic Spike & Scaling Architecture',
    promptBuilder: (t) =>
      `During a 10x traffic surge (e.g. product launch event), how does an architecture relying on ${t.title} maintain availability and prevent cascading failures?`,
    rubricBuilder: (t) =>
      `Must outline auto-scaling, admission control, and shedding non-critical workloads to protect ${t.title}.`,
    hintsBuilder: (t) => [
      `Where does queue buffering occur when GPU capacity is saturated?`
    ],
    followUpsBuilder: (t) => [
      `How does client-side rate limiting prevent server thundering herds?`
    ],
    keywordsBuilder: (t) => [t.title, 'traffic spike', 'admission control', 'graceful degradation']
  },
  {
    slot: 8,
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L3',
    archetype: 'troubleshooting',
    titleSuffix: 'Latency Spikes & Performance Bottleneck Triage',
    promptBuilder: (t) =>
      `P99 latency for requests involving ${t.title} suddenly degrades from 150ms to 4,500ms while CPU utilization remains low. How do you systematically diagnose and fix the bottleneck?`,
    rubricBuilder: (t) =>
      `Candidate must isolate memory bandwidth saturation, thread locks, network transfer bottlenecks, or cold cache miss cascades.`,
    hintsBuilder: (t) => [
      `If CPU is idle, what are GPU threads or worker processes blocked on?`
    ],
    followUpsBuilder: (t) => [
      `What specific OpenTelemetry spans or Prometheus metrics would confirm this diagnosis?`
    ],
    keywordsBuilder: (t) => [t.title, 'p99 latency', 'bottleneck triage', 'memory bandwidth']
  },
  {
    slot: 9,
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L3',
    archetype: 'comparison',
    titleSuffix: 'Technology Selection & Alternative Solutions',
    promptBuilder: (t) =>
      `What are the leading industry alternatives to the standard tooling for ${t.title}? Under what exact requirements would you select an alternative?`,
    rubricBuilder: (t) =>
      `Must compare at least two production alternatives, highlighting operational complexity, hardware requirements, and maintenance overhead.`,
    hintsBuilder: (t) => [
      `Compare open-source self-hosted solutions vs managed cloud offerings.`
    ],
    followUpsBuilder: (t) => [
      `What is the Total Cost of Ownership (TCO) difference at 100M requests/day?`
    ],
    keywordsBuilder: (t) => [t.title, 'technology evaluation', 'open-source vs managed', 'TCO']
  },
  {
    slot: 10,
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L3',
    archetype: 'architecture',
    titleSuffix: 'End-to-End Component Integration Flow',
    promptBuilder: (t) =>
      `Design the end-to-end integration architecture connecting ${t.title} with adjacent services (API Gateway, Caching, Storage, Observability).`,
    rubricBuilder: (t) =>
      `Must draw clear component boundaries, network protocol interactions (gRPC, WebSockets, REST), and failure isolation mechanisms.`,
    hintsBuilder: (t) => [
      `Show data flow from client ingress to ${t.title} and storage persistence.`
    ],
    followUpsBuilder: (t) => [
      `How are authorization tokens validated without adding hop latency?`
    ],
    keywordsBuilder: (t) => [t.title, 'integration', 'component boundaries', 'data flow']
  },

  // 6 Advanced Questions (L3–L4)
  {
    slot: 11,
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'failure-analysis',
    titleSuffix: 'Memory Saturation & OOM Crash Recovery',
    promptBuilder: (t) =>
      `What happens when ${t.title} encounters unexpected memory exhaustion (e.g. GPU OOM, RAM heap limit)? How do you design active eviction and self-healing to prevent node crashes?`,
    rubricBuilder: (t) =>
      `Candidate must detail pre-allocation memory limits, paging mechanisms, block eviction, and circuit breaker protection against hard OOM kills.`,
    hintsBuilder: (t) => [
      `How does Linux OOM-killer treat processes that exceed allocated VRAM/RAM?`
    ],
    followUpsBuilder: (t) => [
      `How do you restore state without triggering a cold-start storm on restart?`
    ],
    keywordsBuilder: (t) => [t.title, 'OOM crash', 'memory saturation', 'eviction policy', 'recovery']
  },
  {
    slot: 12,
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'mechanism',
    titleSuffix: 'Concurrency Control & Thread-Safe State Management',
    promptBuilder: (t) =>
      `How does ${t.title} handle high-concurrency race conditions, atomic state updates, and lock contention across distributed worker nodes?`,
    rubricBuilder: (t) =>
      `Must explain synchronization primitives, optimistic concurrency, atomic CAS operations, or lock-free data structures used in ${t.title}.`,
    hintsBuilder: (t) => [
      `Consider what happens when multiple workers update the same state simultaneously.`
    ],
    followUpsBuilder: (t) => [
      `How do distributed locks or fencing tokens protect external shared resources?`
    ],
    keywordsBuilder: (t) => [t.title, 'concurrency', 'race condition', 'atomic updates', 'lock-free']
  },
  {
    slot: 13,
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'scenario-based',
    titleSuffix: 'Multi-Tenant Isolation & Noisy Neighbor Mitigation',
    promptBuilder: (t) =>
      `In a multi-tenant enterprise deployment of ${t.title}, how do you guarantee strict tenant isolation, prevent noisy-neighbor starvation, and enforce fair resource sharing?`,
    rubricBuilder: (t) =>
      `Must design tenant rate limits, dedicated vs shared resource pooling, weighted fair queuing, and cryptographic/logical data partition boundaries.`,
    hintsBuilder: (t) => [
      `What happens if Tenant A sends 100,000 queries while Tenant B needs low-latency access?`
    ],
    followUpsBuilder: (t) => [
      `How do you bill tenants accurately based on exact compute/token utilization?`
    ],
    keywordsBuilder: (t) => [t.title, 'multi-tenant', 'noisy neighbor', 'fair queuing', 'isolation']
  },
  {
    slot: 14,
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'troubleshooting',
    titleSuffix: 'Silent Data Degradation & Quality Drift',
    promptBuilder: (t) =>
      `Users report that outputs involving ${t.title} have degraded in quality over the past month, but system health checks show 100% uptime and low latency. How do you detect and remediate silent degradation?`,
    rubricBuilder: (t) =>
      `Candidate must explain drift detection, continuous automated eval sampling against golden benchmarks, embedding model drift, and silent failure detection.`,
    hintsBuilder: (t) => [
      `Uptime only measures network pings, not answer correctness or hallucination rates.`
    ],
    followUpsBuilder: (t) => [
      `How do you run continuous shadow evaluations in production without doubling compute costs?`
    ],
    keywordsBuilder: (t) => [t.title, 'silent degradation', 'drift detection', 'evals', 'golden benchmark']
  },
  {
    slot: 15,
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'architecture',
    titleSuffix: 'Zero-Downtime Migration & Version Upgrades',
    promptBuilder: (t) =>
      `How do you perform a zero-downtime version upgrade or architecture migration for ${t.title} while serving 20,000 live production requests per second?`,
    rubricBuilder: (t) =>
      `Must detail blue/green or canary rollout, dual-writing/dual-reading, backward-compatible schemas, and automated rollback triggers.`,
    hintsBuilder: (t) => [
      `How do you verify the new version is healthy before directing 100% of live traffic to it?`
    ],
    followUpsBuilder: (t) => [
      `How do you roll back safely if error rates spike at 20% traffic allocation?`
    ],
    keywordsBuilder: (t) => [t.title, 'zero-downtime', 'canary rollout', 'blue-green', 'migration']
  },
  {
    slot: 16,
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'trade-off',
    titleSuffix: 'Hardware Acceleration vs Cost Optimization',
    promptBuilder: (t) =>
      `Analyze the cost-performance trade-offs of deploying ${t.title} across different hardware tiers (e.g. H100 vs A10G vs L40S vs CPU inference). When is CPU/cheap GPU sufficient?`,
    rubricBuilder: (t) =>
      `Candidate must quantify memory bandwidth, FLOPS, cost per hour, and latency targets, justifying hardware selection for specific workload profiles.`,
    hintsBuilder: (t) => [
      `Is embedding generation or small model reranking compute-bound or memory-bound?`
    ],
    followUpsBuilder: (t) => [
      `How do spot instances and auto-scaling groups manage sudden node preemptions?`
    ],
    keywordsBuilder: (t) => [t.title, 'hardware sizing', 'H100 vs A10G', 'cost optimization', 'throughput']
  },

  // 4 Expert Questions (L5 - Staff / Principal)
  {
    slot: 17,
    difficulty: 'EXPERT',
    learningLevel: 'L5',
    archetype: 'failure-analysis',
    titleSuffix: 'Cascading Failures & Distributed Deadlocks',
    promptBuilder: (t) =>
      `Under severe network partitions and partial cluster node failures, what catastrophic failure cascades can be triggered by ${t.title}? How do you design circuit breakers and load shedding to preserve core stability?`,
    rubricBuilder: (t) =>
      `Candidate must analyze retry amplification storms, deadlocks, partition behavior, and load shedding strategies (e.g. token bucket drop, graceful degradation).`,
    hintsBuilder: (t) => [
      `What happens if 10 nodes time out and 1,000 clients simultaneously retry with exponential backoff without jitter?`
    ],
    followUpsBuilder: (t) => [
      `How does your design prevent split-brain states or corrupted caches during recovery?`
    ],
    keywordsBuilder: (t) => [t.title, 'cascading failure', 'circuit breaker', 'load shedding', 'partition tolerance']
  },
  {
    slot: 18,
    difficulty: 'EXPERT',
    learningLevel: 'L5',
    archetype: 'architecture',
    titleSuffix: 'Multi-Region Active-Active Replication & DR',
    promptBuilder: (t) =>
      `Architect a multi-region active-active deployment for ${t.title} spanning US-East, US-West, and EU-Central. How do you handle cross-region synchronization, state consistency, and Disaster Recovery (RPO/RTO)?`,
    rubricBuilder: (t) =>
      `Must design regional cache invalidation, cross-region replication quorums, BGP Anycast routing, and state synchronization within realistic speed-of-light constraints.`,
    hintsBuilder: (t) => [
      `Transatlantic round-trip latency is ~70ms. How does that impact synchronous updates?`
    ],
    followUpsBuilder: (t) => [
      `How do you handle data residency compliance (GDPR) in a globally replicated system?`
    ],
    keywordsBuilder: (t) => [t.title, 'multi-region', 'active-active', 'cross-region replication', 'disaster recovery']
  },
  {
    slot: 19,
    difficulty: 'EXPERT',
    learningLevel: 'L5',
    archetype: 'troubleshooting',
    titleSuffix: 'Adversarial Attacks, Red-Teaming & Security Exploits',
    promptBuilder: (t) =>
      `What sophisticated adversarial attack vectors (e.g. indirect prompt injection, data extraction, embedding inversion, denial-of-wallet) can target ${t.title}? Design a defense-in-depth security perimeter.`,
    rubricBuilder: (t) =>
      `Candidate must analyze adversarial threats specific to ${t.title}, detailing cryptographic verification, sandboxing, input sanitization, and runtime behavioral monitoring.`,
    hintsBuilder: (t) => [
      `How could an attacker exploit ${t.title} to extract confidential internal system prompts or underlying training data?`
    ],
    followUpsBuilder: (t) => [
      `How do you audit and log security events without recording sensitive customer payloads?`
    ],
    keywordsBuilder: (t) => [t.title, 'adversarial attack', 'prompt injection', 'defense in depth', 'security perimeter']
  },
  {
    slot: 20,
    difficulty: 'EXPERT',
    learningLevel: 'L5',
    archetype: 'trade-off',
    titleSuffix: 'Principal-Level Strategic Architecture & Technology Roadmap',
    promptBuilder: (t) =>
      `As a Principal AI Architect, how would you evolve the architecture of ${t.title} over the next 24 months as frontier models advance? What fundamental architectural shifts will make current patterns obsolete?`,
    rubricBuilder: (t) =>
      `Candidate must demonstrate vision: analyzing infinite context windows vs RAG, native multimodal tokenization vs cascaded pipelines, and evolving compute/memory economics.`,
    hintsBuilder: (t) => [
      `If context windows become 10M tokens and inference costs drop 100x, does this component remain necessary?`
    ],
    followUpsBuilder: (t) => [
      `What technical debt should engineering teams actively avoid taking on today in this area?`
    ],
    keywordsBuilder: (t) => [t.title, 'architectural vision', 'technology roadmap', 'frontier models', 'technical debt']
  }
];

export function buildComplete20QuestionsForAITopic(topic: TopicSeed): QuestionSeed[] {
  const existingQuestions = topic.questions || [];
  const existingMap = new Map<number, QuestionSeed>();

  // If handcrafted seed questions exist, preserve them in their corresponding slot
  existingQuestions.forEach((q, idx) => {
    existingMap.set(idx + 1, q);
  });

  const fullQuestions: QuestionSeed[] = [];

  for (let slot = 1; slot <= 20; slot++) {
    if (existingMap.has(slot)) {
      fullQuestions.push(existingMap.get(slot)!);
    } else {
      const template = AI_QUESTION_ARCHETYPE_TEMPLATES.find(t => t.slot === slot)!;
      const qId = `q_${topic.slug.replace(/[^a-z0-9]/g, '_')}_${String(slot).padStart(2, '0')}`;

      fullQuestions.push({
        id: qId,
        title: `${topic.title}: ${template.titleSuffix}`,
        difficulty: template.difficulty,
        learningLevel: template.learningLevel,
        archetype: template.archetype,
        prompt: template.promptBuilder(topic),
        scaleAnchor: `Production AI scale: p99 latency target < 500ms, 99.9% availability`,
        rubricGuide: template.rubricBuilder(topic),
        rubricAtoms: template.keywordsBuilder(topic).slice(0, 4),
        hints: template.hintsBuilder(topic),
        followUpProbes: template.followUpsBuilder(topic),
        expectedKeywords: template.keywordsBuilder(topic),
        antiPatterns: [`Superficial answer omitting ${topic.rubricAtoms[0]}`, `Assuming infinite GPU VRAM without memory bounds`]
      });
    }
  }

  return fullQuestions;
}
