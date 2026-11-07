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

const QUESTION_ARCHETYPE_TEMPLATES: ArchetypeTemplate[] = [
  // 4 Beginner Questions (L1)
  {
    slot: 1,
    difficulty: 'BEGINNER',
    learningLevel: 'L1',
    archetype: 'conceptual',
    titleSuffix: 'Core Architectural Concepts & Mental Model',
    promptBuilder: (t) =>
      `Explain the fundamental concept of ${t.title}. What core engineering problem does it solve, and how does it fit into modern distributed system architecture?`,
    rubricBuilder: (t) =>
      `Candidate must clearly define ${t.title}, state the motivation/problem solved (${t.description}), and establish the core boundaries without confusing it with adjacent systems.`,
    hintsBuilder: (t) => [
      `Think about why standard single-server setups fail without ${t.title.toLowerCase()}.`,
      `Focus on: ${t.rubricAtoms.slice(0, 2).join(', ')}.`
    ],
    followUpsBuilder: (t) => [
      `What are the most common misconceptions engineers have when first using ${t.title}?`,
      `How does ${t.title} affect overall system availability?`
    ],
    keywordsBuilder: (t) => [t.title, ...t.rubricAtoms.slice(0, 3), 'availability', 'architecture']
  },
  {
    slot: 2,
    difficulty: 'BEGINNER',
    learningLevel: 'L1',
    archetype: 'conceptual',
    titleSuffix: 'Key Terminology & Standard Interfaces',
    promptBuilder: (t) =>
      `What are the primary interfaces, protocols, and standard terminology associated with ${t.title}? Detail the typical client-server interaction flow.`,
    rubricBuilder: (t) =>
      `Must outline the primary terminology and data flow for ${t.title}, demonstrating a solid grasp of foundational building blocks (${t.rubricAtoms.join(', ')}).`,
    hintsBuilder: (t) => [
      `Trace a request from client arrival through ${t.title} to storage or downstream services.`
    ],
    followUpsBuilder: (t) => [
      `Which protocols or transport layers are typically leveraged here?`
    ],
    keywordsBuilder: (t) => [t.slug, 'interface', 'protocol', 'flow', ...t.rubricAtoms.slice(1, 4)]
  },
  {
    slot: 3,
    difficulty: 'BEGINNER',
    learningLevel: 'L1',
    archetype: 'mechanism',
    titleSuffix: 'Basic Internal Mechanism & Data Flow',
    promptBuilder: (t) =>
      `Walk through the internal working mechanism of ${t.title}. What happens step-by-step when a write or read operation executes?`,
    rubricBuilder: (t) =>
      `Candidate must trace the step-by-step internal execution path of ${t.title}, identifying the state changes and components involved.`,
    hintsBuilder: (t) => [
      `Break down the read path versus the write path.`,
      `Consider how state is stored or routed.`
    ],
    followUpsBuilder: (t) => [
      `What happens if a step in this data flow experiences a 2-second timeout?`
    ],
    keywordsBuilder: (t) => ['mechanism', 'data flow', 'internal execution', ...t.rubricAtoms.slice(0, 2)]
  },
  {
    slot: 4,
    difficulty: 'BEGINNER',
    learningLevel: 'L1',
    archetype: 'implementation',
    titleSuffix: 'Baseline Implementation & Standard Patterns',
    promptBuilder: (t) =>
      `How would you implement a simple baseline version of ${t.title} in a production environment? What off-the-shelf tools, libraries, or cloud services would you choose?`,
    rubricBuilder: (t) =>
      `Should recommend battle-tested industry open-source or cloud managed solutions for ${t.title} and justify why building from scratch is an anti-pattern for standard use cases.`,
    hintsBuilder: (t) => [
      `Think about AWS, GCP, or standard OSS stacks (e.g. Redis, Kafka, Envoy, Nginx).`
    ],
    followUpsBuilder: (t) => [
      `At what scale does an off-the-shelf implementation begin to exhibit bottlenecks?`
    ],
    keywordsBuilder: (t) => ['implementation', 'managed service', 'open source', 'baseline']
  },

  // 6 Intermediate Questions (L2 / L3)
  {
    slot: 5,
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L2',
    archetype: 'mechanism',
    titleSuffix: 'Detailed Internal Algorithms & Data Structures',
    promptBuilder: (t) =>
      `Examine the core algorithms and underlying data structures powering ${t.title} (e.g., ${t.rubricAtoms.slice(0, 3).join(', ')}). How do these choices optimize throughput and latency?`,
    rubricBuilder: (t) =>
      `Candidate must describe the memory layouts, indexing structures, or hashing/partitioning algorithms that enable ${t.title} to scale efficiently.`,
    hintsBuilder: (t) => [
      `What is the computational complexity (Big-O) of primary operations?`
    ],
    followUpsBuilder: (t) => [
      `How does memory footprint grow as the number of entities scales by 100x?`
    ],
    keywordsBuilder: (t) => ['data structure', 'algorithm', 'complexity', ...t.rubricAtoms.slice(0, 2)]
  },
  {
    slot: 6,
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L2',
    archetype: 'comparison',
    titleSuffix: 'Architectural Comparison & Technology Selection',
    promptBuilder: (t) =>
      `Compare the leading technical approaches or technology choices for ${t.title}. Under what specific engineering requirements would you select one over the alternatives?`,
    rubricBuilder: (t) =>
      `Must provide a structured comparison matrix evaluating throughput, latency, consistency, operational complexity, and cost across alternative solutions for ${t.title}.`,
    hintsBuilder: (t) => [
      `Contrast at least two distinct technologies or patterns used to solve this.`
    ],
    followUpsBuilder: (t) => [
      `What is the primary operational overhead when maintaining this choice in production?`
    ],
    keywordsBuilder: (t) => ['comparison', 'trade-off', 'technology selection', 'benchmarks']
  },
  {
    slot: 7,
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L2',
    archetype: 'scenario-based',
    titleSuffix: 'Capacity Sizing & High-QPS Scaling',
    promptBuilder: (t) =>
      `Consider a system experiencing 50,000 requests/second with a strict SLA of p99 < 50ms. How does ${t.title} handle this load, and how do you size capacity?`,
    rubricBuilder: (t) =>
      `Must perform realistic back-of-the-envelope capacity calculations (QPS, memory, bandwidth, CPU) and specify scaling thresholds for ${t.title}.`,
    hintsBuilder: (t) => [
      `Calculate bytes/sec and memory required for active working set.`
    ],
    followUpsBuilder: (t) => [
      `What is your headroom buffer percentage for unexpected traffic spikes?`
    ],
    keywordsBuilder: (t) => ['capacity planning', 'p99 latency', 'throughput', 'SLA']
  },
  {
    slot: 8,
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L3',
    archetype: 'troubleshooting',
    titleSuffix: 'Performance Bottlenecks & Optimization',
    promptBuilder: (t) =>
      `During a peak event, latency metrics show a severe spike at p99 while p50 remains normal for ${t.title}. How do you diagnose and eliminate the bottleneck?`,
    rubricBuilder: (t) =>
      `Candidate must explain p99 tail latency causes (e.g. GC pauses, head-of-line blocking, lock contention, slow disk sync, connection pool exhaustion) and provide remediation techniques.`,
    hintsBuilder: (t) => [
      `Look for tail-latency culprits rather than average throughput issues.`
    ],
    followUpsBuilder: (t) => [
      `How do connection pools or buffer allocations influence this behavior?`
    ],
    keywordsBuilder: (t) => ['p99 spike', 'bottleneck', 'tail latency', 'profiling', 'lock contention']
  },
  {
    slot: 9,
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L3',
    archetype: 'scenario-based',
    titleSuffix: 'Graceful Degradation & Shedding Strategies',
    promptBuilder: (t) =>
      `If incoming traffic surges to 5x expected capacity and downstream dependencies slow down, how should ${t.title} degrade gracefully to prevent complete cascading failure?`,
    rubricBuilder: (t) =>
      `Must discuss load shedding, backpressure, priority shedding (dropping non-critical features), and adaptive rate limiting for ${t.title}.`,
    hintsBuilder: (t) => [
      `Is it better to fail fast with HTTP 429/503 or let requests queue until timeouts expire?`
    ],
    followUpsBuilder: (t) => [
      `How do you protect critical transactional traffic while dropping background telemetry?`
    ],
    keywordsBuilder: (t) => ['load shedding', 'graceful degradation', 'backpressure', 'fail fast']
  },
  {
    slot: 10,
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L3',
    archetype: 'failure-analysis',
    titleSuffix: 'Single Node Crash & Failover Mechanics',
    promptBuilder: (t) =>
      `What happens when an active primary node running ${t.title} crashes abruptly without flushing state? Detail the failover sequence, data loss risk, and recovery time objective (RTO).`,
    rubricBuilder: (t) =>
      `Must trace heartbeat detection, leader election or promotion of replica, fencing the zombie node, and measuring RPO/RTO tradeoffs.`,
    hintsBuilder: (t) => [
      `Consider split-brain risks if the dead node resumes after 10 seconds.`
    ],
    followUpsBuilder: (t) => [
      `How do clients discover the newly promoted primary instance?`
    ],
    keywordsBuilder: (t) => ['failover', 'RTO', 'RPO', 'heartbeat', 'leader promotion', 'split-brain']
  },

  // 6 Advanced Questions (L3 / L4)
  {
    slot: 11,
    difficulty: 'ADVANCED',
    learningLevel: 'L3',
    archetype: 'architecture',
    titleSuffix: 'End-to-End High-Availability Topology',
    promptBuilder: (t) =>
      `Design a multi-region, active-active or active-passive high-availability architecture for ${t.title}. How do you synchronize state and handle cross-region replication lag?`,
    rubricBuilder: (t) =>
      `Candidate must architect a resilient multi-AZ / multi-region topology for ${t.title}, addressing asynchronous vs synchronous replication, cross-region RTT, and data conflict policies.`,
    hintsBuilder: (t) => [
      `Light travels at ~200km/ms in fiber. How does a 70ms cross-continent RTT impact synchronous writes?`
    ],
    followUpsBuilder: (t) => [
      `How do you configure Anycast DNS or Global Server Load Balancing (GSLB) during region evacuation?`
    ],
    keywordsBuilder: (t) => ['multi-region', 'high availability', 'active-active', 'replication lag', 'GSLB']
  },
  {
    slot: 12,
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'trade-off',
    titleSuffix: 'Consistency vs Availability (CAP/PACELC) in Practice',
    promptBuilder: (t) =>
      `Analyze ${t.title} through the lens of the PACELC theorem. When network partitions or heavy latency occur, does this component favor Consistency or Availability, and why?`,
    rubricBuilder: (t) =>
      `Must evaluate trade-offs: during Partition (P) -> Availability (A) vs Consistency (C); Else (E) -> Latency (L) vs Consistency (C). Must link theory to concrete production behaviors of ${t.title}.`,
    hintsBuilder: (t) => [
      `What does a stale read mean for end users in this system?`
    ],
    followUpsBuilder: (t) => [
      `Can you configure tunable consistency parameters to bridge this gap?`
    ],
    keywordsBuilder: (t) => ['CAP theorem', 'PACELC', 'linearizability', 'eventual consistency', 'trade-offs']
  },
  {
    slot: 13,
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'troubleshooting',
    titleSuffix: 'Distributed Concurrency, Race Conditions & Isolation',
    promptBuilder: (t) =>
      `In a highly distributed environment running ${t.title}, how do you prevent race conditions, dirty reads, and phantom writes when multiple concurrent actors update the same state?`,
    rubricBuilder: (t) =>
      `Must analyze concurrency control mechanisms: optimistic concurrency with version numbers/CAS, pessimistic locking, distributed leases, or CRDTs for ${t.title}.`,
    hintsBuilder: (t) => [
      `Why is two-phase locking (2PL) often avoided in high-throughput distributed systems?`
    ],
    followUpsBuilder: (t) => [
      `How do you detect and recover from deadlocks in cross-service workflows?`
    ],
    keywordsBuilder: (t) => ['optimistic concurrency', 'CAS', 'race condition', 'distributed locks', 'isolation']
  },
  {
    slot: 14,
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'architecture',
    titleSuffix: 'Cross-Component Integration & Boundary Contracts',
    promptBuilder: (t) =>
      `How does ${t.title} integrate with upstream gateways and downstream storage/messaging layers? Detail the API contracts, payload serialization, and backward compatibility strategies.`,
    rubricBuilder: (t) =>
      `Candidate must define schema evolution strategies (Protobuf, Avro, JSON Schema), contract testing, and clear separation of concerns across service boundaries.`,
    hintsBuilder: (t) => [
      `How do you roll out a breaking schema change without coordinated downtime?`
    ],
    followUpsBuilder: (t) => [
      `When should you use gRPC over HTTP/REST for internal service communication?`
    ],
    keywordsBuilder: (t) => ['integration', 'schema evolution', 'Protobuf', 'compatibility', 'gRPC']
  },
  {
    slot: 15,
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'failure-analysis',
    titleSuffix: 'Partial Failures, Cascading Outages & Anti-Fragility',
    promptBuilder: (t) =>
      `Detail a complex partial failure scenario where ${t.title} does not crash completely but experiences 30% packet loss and 500ms latency. How do you prevent a total cluster brownout?`,
    rubricBuilder: (t) =>
      `Must explain how gray failures (partial degradation) are more dangerous than clean crashes, detailing circuit breakers, deadline propagation, hedging requests, and adaptive timeouts.`,
    hintsBuilder: (t) => [
      `What happens if client timeouts are set longer than the thread pool retention limit?`
    ],
    followUpsBuilder: (t) => [
      `How does gRPC deadline propagation cancel downstream wasted work?`
    ],
    keywordsBuilder: (t) => ['gray failure', 'cascading outage', 'circuit breaker', 'deadline propagation', 'jitter']
  },
  {
    slot: 16,
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'troubleshooting',
    titleSuffix: 'Observability, Distributed Tracing & Metric Signals',
    promptBuilder: (t) =>
      `What Golden Signals, distributed tracing spans, and metric alerts would you configure for ${t.title} to detect silent data corruption or degradation within 60 seconds?`,
    rubricBuilder: (t) =>
      `Must define the Four Golden Signals (Latency, Traffic, Errors, Saturation), OpenTelemetry context propagation, and high-signal alert rules without generating alert fatigue.`,
    hintsBuilder: (t) => [
      `Differentiate symptoms from causes in your alerting strategy.`
    ],
    followUpsBuilder: (t) => [
      `How do trace baggage headers propagate tenant context through asynchronous queues?`
    ],
    keywordsBuilder: (t) => ['Golden Signals', 'OpenTelemetry', 'distributed tracing', 'saturation', 'alerting']
  },

  // 4 Expert Questions (L4 / L5)
  {
    slot: 17,
    difficulty: 'EXPERT',
    learningLevel: 'L4',
    archetype: 'architecture',
    titleSuffix: 'Extreme Scale (10M+ QPS) & Hardware/Kernel Optimization',
    promptBuilder: (t) =>
      `At an extreme scale of 10M+ QPS and petabytes of throughput, what Linux kernel parameters, memory allocation patterns (e.g., zero-copy, eBPF, DPDK), and hardware trade-offs apply to ${t.title}?`,
    rubricBuilder: (t) =>
      `Candidate must explain deep systems programming and OS concepts: page cache management, TCP socket buffers, context switches, epoll vs io_uring, and CPU cache line false sharing.`,
    hintsBuilder: (t) => [
      `Why does standard user-space to kernel-space buffer copying become the primary bottleneck at 100Gbps network speeds?`
    ],
    followUpsBuilder: (t) => [
      `How does io_uring or eBPF bypass traditional system call overhead?`
    ],
    keywordsBuilder: (t) => ['zero-copy', 'io_uring', 'eBPF', 'page cache', 'epoll', 'kernel tuning', '10M QPS']
  },
  {
    slot: 18,
    difficulty: 'EXPERT',
    learningLevel: 'L5',
    archetype: 'failure-analysis',
    titleSuffix: 'Byzantine Faults, Split-Brain & Asymmetric Partitions',
    promptBuilder: (t) =>
      `Describe how ${t.title} behaves during an asymmetric network partition where Node A can talk to Node B, Node B can talk to Node C, but Node A cannot talk to Node C. How do consensus and heartbeats resolve this without split-brain?`,
    rubricBuilder: (t) =>
      `Must explain asymmetric network partitions, Raft/Paxos pre-vote phases, quorum intersection rules, and fencing tokens to prevent zombie masters from accepting rogue writes.`,
    hintsBuilder: (t) => [
      `Why is a simple majority vote vulnerable if a disconnected leader constantly increments election terms?`
    ],
    followUpsBuilder: (t) => [
      `How does Raft's Pre-Vote phase eliminate election disruption caused by partitioned nodes?`
    ],
    keywordsBuilder: (t) => ['asymmetric partition', 'split-brain', 'pre-vote', 'fencing tokens', 'consensus', 'Raft']
  },
  {
    slot: 19,
    difficulty: 'EXPERT',
    learningLevel: 'L5',
    archetype: 'mechanism',
    titleSuffix: 'Formal Correctness & Chaos Engineering Validation',
    promptBuilder: (t) =>
      `How do you formally verify or validate the correctness of ${t.title} under catastrophic conditions? Discuss techniques like TLA+ formal specifications or Jepsen testing suites.`,
    rubricBuilder: (t) =>
      `Must discuss rigorous verification methods: modeling state transitions in TLA+, running Jepsen fault injection tests against network splits, clock skews, and sudden process SIGKILL.`,
    hintsBuilder: (t) => [
      `What class of bugs cannot be discovered by unit or integration tests?`
    ],
    followUpsBuilder: (t) => [
      `How does clock skew affect linearizability guarantees in verification runs?`
    ],
    keywordsBuilder: (t) => ['TLA+', 'Jepsen', 'chaos engineering', 'formal verification', 'linearizability']
  },
  {
    slot: 20,
    difficulty: 'EXPERT',
    learningLevel: 'L5',
    archetype: 'follow-up-probe',
    titleSuffix: 'Defending Multi-Million Dollar Architectural Decisions',
    promptBuilder: (t) =>
      `You are defending a multi-million dollar architectural proposal for ${t.title} before the Principal Architecture Review Board. Executives want to cut costs by 60% by switching to a simpler alternative. How do you defend your technical and financial trade-offs?`,
    rubricBuilder: (t) =>
      `Candidate must balance technical excellence with business reality: Total Cost of Ownership (TCO), developer productivity, SLA compliance penalties, migration risk, and disaster recovery insurance.`,
    hintsBuilder: (t) => [
      `Articulate what an 8-hour catastrophic outage costs in customer trust and revenue versus the cloud infrastructure bill.`
    ],
    followUpsBuilder: (t) => [
      `How do you structure a multi-phase migration plan to derisk executive concerns?`
    ],
    keywordsBuilder: (t) => ['TCO', 'business trade-off', 'architecture defense', 'SLA penalty', 'risk mitigation']
  }
];

export function buildComplete20QuestionsForTopic(topic: TopicSeed): QuestionSeed[] {
  const existingQuestions = topic.questions || [];
  const results: QuestionSeed[] = [];

  // Required slot matrix:
  // Slots 1-4: BEGINNER (L1)
  // Slots 5-10: INTERMEDIATE (L2/L3)
  // Slots 11-16: ADVANCED (L3/L4)
  // Slots 17-20: EXPERT (L4/L5)

  for (let slot = 1; slot <= 20; slot++) {
    const template = QUESTION_ARCHETYPE_TEMPLATES[slot - 1];
    
    // Check if an existing question matches this slot's target difficulty
    const existingIdx = existingQuestions.findIndex(
      (q, idx) => !results.includes(q) && (
        (slot <= 4 && q.difficulty === 'BEGINNER') ||
        (slot > 4 && slot <= 10 && q.difficulty === 'INTERMEDIATE') ||
        (slot > 10 && slot <= 16 && q.difficulty === 'ADVANCED') ||
        (slot > 16 && q.difficulty === 'EXPERT')
      )
    );

    if (existingIdx !== -1) {
      const matched = existingQuestions.splice(existingIdx, 1)[0];
      results.push(matched);
    } else if (existingQuestions.length > 0 && slot > 20 - existingQuestions.length) {
      // If we have remaining existing questions, adapt their difficulty to fit the remaining slots
      const remaining = existingQuestions.shift()!;
      results.push({
        ...remaining,
        difficulty: template.difficulty,
        learningLevel: template.learningLevel
      });
    } else {
      const qId = `q_${topic.slug.replace(/-/g, '_')}_${String(slot).padStart(2, '0')}`;
      results.push({
        id: qId,
        title: `${topic.title}: ${template.titleSuffix}`,
        difficulty: template.difficulty,
        learningLevel: template.learningLevel,
        archetype: template.archetype,
        prompt: template.promptBuilder(topic),
        rubricGuide: template.rubricBuilder(topic),
        rubricAtoms: [...topic.rubricAtoms.slice(0, 3), template.archetype],
        hints: template.hintsBuilder(topic),
        followUpProbes: template.followUpsBuilder(topic),
        expectedKeywords: template.keywordsBuilder(topic)
      });
    }
  }

  return results;
}
