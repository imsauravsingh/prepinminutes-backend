import { TopicSeed, QuestionSeed } from './types';

interface ArchetypeTemplate {
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  learningLevel: 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
  archetype:
    | 'mechanism'
    | 'trade-off'
    | 'troubleshooting'
    | 'failure-analysis'
    | 'implementation'
    | 'scenario-based';
  titleSuffix: string;
  promptTemplate: (topic: TopicSeed) => string;
  rubricGuideTemplate: (topic: TopicSeed) => string;
  expectedKeywordsTemplate: (topic: TopicSeed) => string[];
  antiPatternsTemplate: (topic: TopicSeed) => string[];
  scoreOffset: number;
}

const QUESTION_ARCHETYPES: ArchetypeTemplate[] = [
  // 1-4: Beginner (L1) - Fundamentals & Mechanics
  {
    difficulty: 'BEGINNER',
    learningLevel: 'L1',
    archetype: 'mechanism',
    titleSuffix: 'Core Architectural Mechanics & Contracts',
    promptTemplate: (t) =>
      `Explain the fundamental architectural principles and underlying contracts of ${t.title}. How does it operate under standard single-threaded and basic multi-client conditions, and what invariants does it guarantee?`,
    rubricGuideTemplate: (t) =>
      `Evaluates understanding of ${t.title} foundational mechanisms, invariants, and core conventions without relying on superficial syntax definitions.`,
    expectedKeywordsTemplate: (t) => [t.rubricAtoms[0] || 'Invariants', 'State Contract', 'Memory Layout', 'Execution Model', 'Single Responsibility'],
    antiPatternsTemplate: () => ['Confusing high-level abstractions with underlying mechanics', 'Ignoring basic failure modes in single-node environments'],
    scoreOffset: -3,
  },
  {
    difficulty: 'BEGINNER',
    learningLevel: 'L1',
    archetype: 'implementation',
    titleSuffix: 'Standard Implementation & Interface Conventions',
    promptTemplate: (t) =>
      `Walk through a canonical production-grade implementation of ${t.title}. What interfaces, data structures, and lifecycle handlers are required to ensure safe resource cleanup and deterministic execution?`,
    rubricGuideTemplate: (t) =>
      `Assesses ability to write idiomatic, clean, and properly scoped code for ${t.title} adhering to industry conventions.`,
    expectedKeywordsTemplate: (t) => [t.rubricAtoms[1] || 'Interface Contract', 'Resource Management', 'Idempotency', 'Lifecycle Hooks', 'Exception Boundaries'],
    antiPatternsTemplate: () => ['Leaking file handles or network sockets', 'Hardcoding magic strings or unconfigurable timeouts'],
    scoreOffset: -4,
  },
  {
    difficulty: 'BEGINNER',
    learningLevel: 'L1',
    archetype: 'trade-off',
    titleSuffix: 'Basic Design Choices & Alternatives',
    promptTemplate: (t) =>
      `When implementing ${t.title}, what are the primary architectural alternatives? Compare its memory footprint, operational overhead, and developer ergonomics against traditional baseline approaches.`,
    rubricGuideTemplate: (t) =>
      `Verifies candidate can weigh basic pros and cons of ${t.title} against simpler or alternative architectural strategies.`,
    expectedKeywordsTemplate: (t) => ['Overhead Trade-off', 'Complexity vs Benefit', 'Memory Footprint', 'Operational Simplicity', t.rubricAtoms[0]],
    antiPatternsTemplate: () => ['Blindly recommending complex abstractions for trivial workloads', 'Ignoring team operational familiarity'],
    scoreOffset: -5,
  },
  {
    difficulty: 'BEGINNER',
    learningLevel: 'L1',
    archetype: 'troubleshooting',
    titleSuffix: 'Common Setup Mistakes & Error Handling',
    promptTemplate: (t) =>
      `What are the most frequent configuration errors and edge-case exceptions encountered when setting up ${t.title} in a modern backend service? How do you catch and handle them defensively?`,
    rubricGuideTemplate: (t) =>
      `Evaluates defensiveness in configuration, error boundary handling, and basic sanity checking for ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['Defensive Validation', 'Graceful Degradation', 'Error Hierarchies', 'Timeout Defaults', t.rubricAtoms[2] || 'Configuration'],
    antiPatternsTemplate: () => ['Swallowing exceptions silently without logging', 'Using infinite timeouts by default'],
    scoreOffset: -4,
  },

  // 5-10: Intermediate (L2-L3) - Practical Concurrency, Transactions & I/O
  {
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L2',
    archetype: 'mechanism',
    titleSuffix: 'Concurrency Dynamics & Thread Safety',
    promptTemplate: (t) =>
      `How does ${t.title} maintain data consistency and state integrity when accessed concurrently by multiple parallel worker threads or asynchronous event loops? Explain the internal locking or lock-free mechanisms involved.`,
    rubricGuideTemplate: (t) =>
      `Examines knowledge of thread safety, synchronization primitives, memory visibility, and race condition prevention in ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['Mutual Exclusion', 'Memory Barrier', 'CAS (Compare-And-Swap)', 'Thread Safety', 'Atomic State', t.rubricAtoms[1]],
    antiPatternsTemplate: () => ['Assuming collections are thread-safe without explicit synchronization', 'Double-checked locking without volatile'],
    scoreOffset: 0,
  },
  {
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L2',
    archetype: 'scenario-based',
    titleSuffix: 'High-Throughput Production Scenario',
    promptTemplate: (t) =>
      `In a microservice handling 25,000 requests/sec, how do you tune and configure ${t.title} to minimize latency overhead and prevent connection or thread pool saturation?`,
    rubricGuideTemplate: (t) =>
      `Tests real-world production tuning instincts for ${t.title} under sustained intermediate traffic pressure.`,
    expectedKeywordsTemplate: (t) => ['Throughput Optimization', 'Connection Pooling', 'Backpressure', 'P99 Latency', t.rubricAtoms[0], t.rubricAtoms[2]],
    antiPatternsTemplate: () => ['Increasing pool size indefinitely without considering database host core limits', 'Neglecting queue saturation metrics'],
    scoreOffset: +1,
  },
  {
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L3',
    archetype: 'trade-off',
    titleSuffix: 'Consistency vs Latency Trade-offs',
    promptTemplate: (t) =>
      `Analyze the fundamental tension between strict consistency and request latency when configuring ${t.title}. In what scenarios would you relax consistency guarantees, and what failure modes does that introduce?`,
    rubricGuideTemplate: (t) =>
      `Measures understanding of distributed or concurrent trade-offs (e.g. read committed vs serializable, sync vs async) in ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['Isolation Guarantees', 'Latency Penalty', 'Eventual Consistency', 'Dirty Reads', 'Stale Cache', t.rubricAtoms[3] || 'ACID'],
    antiPatternsTemplate: () => ['Choosing Serializable isolation blindly without assessing deadlock probabilities', 'Assuming read-after-write consistency across replicas'],
    scoreOffset: 0,
  },
  {
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L3',
    archetype: 'implementation',
    titleSuffix: 'Resilient Failure Recovery & Idempotency',
    promptTemplate: (t) =>
      `Design an idempotent, crash-resilient workflow incorporating ${t.title}. If a network partition occurs mid-execution, how does the system recover state without producing duplicate side-effects?`,
    rubricGuideTemplate: (t) =>
      `Evaluates state machine design, idempotency key persistence, and atomic acknowledgment handling in ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['Idempotency Token', 'Deduplication Window', 'Atomic Commit', 'Two-Phase State', 'Exponential Backoff', t.rubricAtoms[1]],
    antiPatternsTemplate: () => ['Relying on client-side retry without server deduplication', 'Non-atomic state mutations during retries'],
    scoreOffset: +1,
  },
  {
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L3',
    archetype: 'troubleshooting',
    titleSuffix: 'Connection Leaks & Resource Starvation',
    promptTemplate: (t) =>
      `A backend service utilizing ${t.title} experiences a gradual degradation in response times, culminating in thread starvation and 504 Gateway Timeouts. How do you isolate whether the root cause is connection leaks, lock contention, or slow downstream I/O?`,
    rubricGuideTemplate: (t) =>
      `Tests methodical diagnostics, metric correlation (active vs idle pool connections, wait duration), and log tracing for ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['Pool Starvation', 'Thread Contention', 'Leak Detection Threshold', 'Wait Queue Saturation', 'Socket Timeout', t.rubricAtoms[2]],
    antiPatternsTemplate: () => ['Restarting the pod blindly without capturing thread/connection pool dumps', 'Ignoring unclosed try-with-resources / defer blocks'],
    scoreOffset: 0,
  },
  {
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L3',
    archetype: 'scenario-based',
    titleSuffix: 'Graceful Degradation & Shedding Strategy',
    promptTemplate: (t) =>
      `When downstream dependencies become sluggish, how should ${t.title} adapt its internal queuing and concurrency limits? Explain how circuit breaker and load shedding patterns protect the host process from cascading failure.`,
    rubricGuideTemplate: (t) =>
      `Assesses defensive architecture, circuit breaker state transitions (Closed/Open/Half-Open), and rate limiting in ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['Circuit Breaker', 'Adaptive Concurrency Limit', 'Load Shedding', 'Half-Open Recovery', 'Fail-Fast Fallback', t.rubricAtoms[0]],
    antiPatternsTemplate: () => ['Retrying failed requests synchronously without backoff or jitter', 'Letting unbounded queues consume entire host memory'],
    scoreOffset: +1,
  },

  // 11-16: Advanced (L3-L4) - Deep Runtime Internals, Memory & GC
  {
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'mechanism',
    titleSuffix: 'Low-Level Engine & Memory Subsystem Mechanics',
    promptTemplate: (t) =>
      `Dissect the low-level memory allocation and engine execution pipeline for ${t.title}. How does the underlying virtual machine or OS kernel manage stack vs heap placement, cache locality, and memory barriers for this component?`,
    rubricGuideTemplate: (t) =>
      `Verifies deep engineering depth regarding memory layout, kernel interaction (e.g. epoll/mmap), cache lines, and compiler optimizations for ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['Escape Analysis', 'Memory Barrier', 'Cache Line Alignment', 'Kernel vs User Space', 'False Sharing', t.rubricAtoms[0], t.rubricAtoms[2]],
    antiPatternsTemplate: () => ['Treating all memory allocations as identical overhead', 'Ignoring CPU L1/L2 cache line false sharing in concurrent code'],
    scoreOffset: +2,
  },
  {
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'troubleshooting',
    titleSuffix: 'Heap Memory Leak & Retained Scope Forensics',
    promptTemplate: (t) =>
      `Production alerting triggers on steady memory growth in a service running ${t.title}. Walk through the forensic process: how do you capture memory snapshots without impacting live traffic, analyze dominator trees, and pinpoint the retained reference chain?`,
    rubricGuideTemplate: (t) =>
      `Evaluates proficiency with production memory profilers, heap dump analysis, dominator tree interpretation, and identifying uncollected references in ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['Heap Dump Forensics', 'Dominator Tree', 'Retained Heap', 'GC Roots', 'Closure Retention', 'Off-Heap Overhead', t.rubricAtoms[1]],
    antiPatternsTemplate: () => ['Triggering full heap dumps on live production pods without traffic drainage', 'Mistaking high soft-reference caches for leaks'],
    scoreOffset: +2,
  },
  {
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'trade-off',
    titleSuffix: 'Garbage Collection & Pause Time Optimization',
    promptTemplate: (t) =>
      `Compare modern garbage collection / memory reclamation algorithms applicable to ${t.title}. Under strict P99.9 latency SLA of <10ms, how do you tune throughput versus stop-the-world (STW) pause times?`,
    rubricGuideTemplate: (t) =>
      `Tests mastery of GC phases (concurrent marking, sweeping, compaction, write barriers) and tuning parameters relevant to ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['Concurrent Mark-Sweep', 'Write Barrier', 'STW Pause Time', 'Generational Hypothesis', 'Region Compaction', t.rubricAtoms[3] || 'GC Tuning'],
    antiPatternsTemplate: () => ['Tuning GC flags blindly without establishing baseline allocations and metrics', 'Oversizing heap leading to catastrophic compaction pauses'],
    scoreOffset: +3,
  },
  {
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'failure-analysis',
    titleSuffix: 'Distributed Deadlocks & Lock Ordering Inversion',
    promptTemplate: (t) =>
      `Analyze a production scenario where multiple microservices interacting with ${t.title} experience cyclic lock acquisition resulting in a distributed deadlock. How do you detect lock inversion, enforce deterministic ordering, and implement fencing tokens?`,
    rubricGuideTemplate: (t) =>
      `Assesses ability to resolve complex lock ordering inversions, design monotonic lock hierarchies, and implement distributed fencing tokens in ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['Lock Ordering Hierarchy', 'Cyclic Dependency', 'Fencing Token', 'Wait-For Graph', 'Deadlock Detection', t.rubricAtoms[2]],
    antiPatternsTemplate: () => ['Acquiring locks in arbitrary order across concurrent code paths', 'Assuming distributed locks are safe across GC pauses without fencing'],
    scoreOffset: +2,
  },
  {
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'implementation',
    titleSuffix: 'Zero-Copy & Buffer Allocation Optimization',
    promptTemplate: (t) =>
      `How do you architect a high-volume streaming ingest pipeline with ${t.title} utilizing zero-copy techniques, direct memory buffers, and ring buffers to minimize GC churn and CPU context switches?`,
    rubricGuideTemplate: (t) =>
      `Evaluates understanding of zero-copy network I/O, direct byte buffers, ring buffers (e.g. LMAX Disruptor pattern), and cache line padding for ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['Zero-Copy I/O', 'Direct Byte Buffer', 'Ring Buffer', 'Cache Line Padding', 'Off-Heap Transfer', t.rubricAtoms[1]],
    antiPatternsTemplate: () => ['Copying byte arrays repeatedly between user-space and kernel-space', 'Allocating temporary short-lived buffers in tight loops'],
    scoreOffset: +2,
  },
  {
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'scenario-based',
    titleSuffix: 'Multi-Region Data Invalidation & Replication Lag',
    promptTemplate: (t) =>
      `In an active-active multi-region deployment utilizing ${t.title}, replication lag between regions leads to stale reads and split-brain updates. How do you design conflict resolution (CRDTs, vector clocks) and read-your-own-writes session guarantees?`,
    rubricGuideTemplate: (t) =>
      `Tests distributed systems architecture depth: replication lag mitigation, monotonic read consistency, and conflict-free data types in ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['Replication Lag', 'Read-Your-Own-Writes', 'Vector Clocks', 'CRDTs', 'Last-Write-Wins Pitfalls', t.rubricAtoms[0]],
    antiPatternsTemplate: () => ['Assuming physical wall-clock timestamps are synchronized across multi-region clusters', 'Ignoring cross-datacenter transit latency in sync writes'],
    scoreOffset: +3,
  },

  // 17-20: Expert (L5) - Production Forensics, Staff+ Architectures & Catastrophic Failure Analysis
  {
    difficulty: 'EXPERT',
    learningLevel: 'L5',
    archetype: 'failure-analysis',
    titleSuffix: 'Catastrophic Production Outage & Post-Mortem',
    promptTemplate: (t) =>
      `During a major flash-sale event, a critical service employing ${t.title} suffers a total outage due to cascading connection pool starvation and CPU thermal throttling. Write the post-mortem analysis: identify the primary trigger, secondary amplifiers, and structural safeguards.`,
    rubricGuideTemplate: (t) =>
      `Evaluates Staff-level root cause analysis, systemic failure modeling, and permanent preventative engineering for ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['Cascading Failure', 'Root Cause Trigger', 'Secondary Amplifier', 'Shedding Boundary', 'Post-Mortem Action Items', t.rubricAtoms[0], t.rubricAtoms[2]],
    antiPatternsTemplate: () => ['Blaming human operators rather than systemic architecture deficiencies', 'Implementing trivial one-line fixes without addressing systemic blast radius'],
    scoreOffset: +4,
  },
  {
    difficulty: 'EXPERT',
    learningLevel: 'L5',
    archetype: 'trade-off',
    titleSuffix: 'Staff-Level Architectural Paradigms & Long-Term Scalability',
    promptTemplate: (t) =>
      `You are the Principal Architect tasked with redesigning the core infrastructure around ${t.title} for a 10x traffic expansion over 3 years. Defend your choice of concurrency model, persistence strategy, and operational boundaries against executive leadership.`,
    rubricGuideTemplate: (t) =>
      `Measures technical leadership, multi-year scalability foresight, TCO (total cost of ownership) trade-offs, and clear technical communication for ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['10x Scalability Horizon', 'Concurrency Paradigm', 'TCO & Infrastructure Cost', 'Failure Domain Isolation', 'Operational Simplicity', t.rubricAtoms[1], t.rubricAtoms[3] || 'Architecture'],
    antiPatternsTemplate: () => ['Prematurely introducing unneeded microservices without organizational justification', 'Ignoring developer velocity and team operational ramp-up'],
    scoreOffset: +5,
  },
  {
    difficulty: 'EXPERT',
    learningLevel: 'L5',
    archetype: 'troubleshooting',
    titleSuffix: 'Silent Data Corruption & Sub-Millisecond Kernel Profiling',
    promptTemplate: (t) =>
      `A subtle race condition in ${t.title} causes silent data corruption on 0.001% of transactions under peak concurrent load. How do you deploy eBPF tracing, low-overhead kernel probes, and formal invariant assertions to detect and eradicate the bug?`,
    rubricGuideTemplate: (t) =>
      `Tests mastery of kernel-level profiling (eBPF, perf, ftrace), invariant assertions, and detecting low-probability non-deterministic concurrency bugs in ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['eBPF Tracing', 'Kernel Profiling', 'Silent Data Corruption', 'Invariant Proofs', 'Non-Deterministic Race', t.rubricAtoms[1]],
    antiPatternsTemplate: () => ['Relying solely on unit tests to reproduce rare multi-threaded race conditions', 'Deploying heavy invasive debuggers that alter thread timing and mask the race'],
    scoreOffset: +4,
  },
  {
    difficulty: 'EXPERT',
    learningLevel: 'L5',
    archetype: 'mechanism',
    titleSuffix: 'Hardware Interaction, NUMA & CPU Architecture Alignments',
    promptTemplate: (t) =>
      `At multi-gigabit throughput, how does ${t.title} interact with modern hardware architectures (NUMA nodes, CPU cache hierarchies, memory bus saturation, and interrupt handling)? What system-level optimizations maximize instruction-per-cycle (IPC)?`,
    rubricGuideTemplate: (t) =>
      `Verifies top-tier understanding of hardware-software co-design: NUMA-aware thread affinity, CPU cache coherency, false sharing elimination, and minimizing IPC bottlenecks in ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['NUMA Node Affinity', 'CPU Cache Coherency (MESI)', 'Interrupt Request (IRQ) Steering', 'IPC Optimization', 'Memory Bus Bandwidth', t.rubricAtoms[0], t.rubricAtoms[2]],
    antiPatternsTemplate: () => ['Ignoring multi-socket NUMA remote memory access penalties', 'Pinning all worker threads to a single core causing CPU thrashing'],
    scoreOffset: +5,
  },
];

export function generateQuestionsForTopic(topic: TopicSeed): QuestionSeed[] {
  const defaultCompanies = topic.targetCompanies && topic.targetCompanies.length > 0
    ? topic.targetCompanies
    : ['Uber', 'Amazon', 'Stripe', 'Google', 'Netflix', 'Swiggy'];

  return QUESTION_ARCHETYPES.map((arch, idx) => {
    const qNum = String(idx + 1).padStart(2, '0');
    const id = `${topic.topicId}-Q${qNum}`;
    const title = `${topic.title}: ${arch.titleSuffix}`;
    const rawScore = topic.frequency + arch.scoreOffset;
    const frequencyScore = Math.min(100, Math.max(70, rawScore));

    return {
      id,
      title,
      lang: topic.lang,
      tier: topic.tier,
      difficulty: arch.difficulty,
      learningLevel: arch.learningLevel,
      archetype: arch.archetype,
      prompt: arch.promptTemplate(topic),
      scaleAnchor: `Production backend service handling high concurrent load (10k-100k QPS) with strict P99 latency SLA and zero-downtime requirements.`,
      rubricGuide: arch.rubricGuideTemplate(topic),
      rubricAtoms: [
        ...topic.rubricAtoms,
        ...arch.expectedKeywordsTemplate(topic).slice(0, 3)
      ],
      hints: [
        `Focus on the concrete mechanics of ${topic.title} rather than generic software definitions.`,
        `Consider how state mutability, locking, and memory allocation interact under high concurrent load.`,
        `Structure your answer with clear trade-offs, mentioning production failure modes and exact diagnostic steps.`
      ],
      followUpProbes: [
        `How would your design change if the workload shifted from 90% reads to 90% writes?`,
        `What specific telemetry metrics (e.g. queue wait time, GC pause duration, lock acquisition time) would trigger an automated alert?`
      ],
      expectedKeywords: arch.expectedKeywordsTemplate(topic),
      antiPatterns: arch.antiPatternsTemplate(topic),
      frequencyScore,
      companies: defaultCompanies
    };
  });
}

