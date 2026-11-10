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
    | 'scenario-based'
    | 'code-review'
    | 'debugging'
    | 'design-exercise';
  titleSuffix: string;
  promptTemplate: (topic: TopicSeed) => string;
  rubricGuideTemplate: (topic: TopicSeed) => string;
  expectedKeywordsTemplate: (topic: TopicSeed) => string[];
  antiPatternsTemplate: (topic: TopicSeed) => string[];
  scoreOffset: number;
}

const QUESTION_ARCHETYPES: ArchetypeTemplate[] = [
  // 1-4: Beginner (L1) - Fundamentals, Terminology & Core Mechanics
  {
    difficulty: 'BEGINNER',
    learningLevel: 'L1',
    archetype: 'mechanism',
    titleSuffix: 'Core Architecture & Fundamental Mechanics',
    promptTemplate: (t) =>
      `Explain the fundamental architectural mechanisms and components of ${t.title}. How does it operate in a cloud-native environment, and what core invariants or guarantees does it enforce?`,
    rubricGuideTemplate: (t) =>
      `Assesses foundational grasp of ${t.title} mechanisms, component interactions, and execution guarantees without relying on surface-level tool trivia.`,
    expectedKeywordsTemplate: (t) => [t.rubricAtoms[0] || 'Core Architecture', 'Operational Invariant', 'Execution Lifecycle', 'Control Flow', 'Isolation Boundary'],
    antiPatternsTemplate: () => ['Confusing declarative specifications with imperative execution', 'Treating distributed systems as single-node synchronous environments'],
    scoreOffset: -3,
  },
  {
    difficulty: 'BEGINNER',
    learningLevel: 'L1',
    archetype: 'implementation',
    titleSuffix: 'Declarative Configuration & Idiomatic Setup',
    promptTemplate: (t) =>
      `Walk through a canonical production-ready configuration or manifest for ${t.title}. What parameters, health checks, and resource constraints must be defined to ensure high availability and deterministic startup?`,
    rubricGuideTemplate: (t) =>
      `Verifies ability to craft clean, secure, and idiomatic declarative configurations for ${t.title} adhering to industry best practices.`,
    expectedKeywordsTemplate: (t) => [t.rubricAtoms[1] || 'Configuration Schema', 'Resource Limits', 'Health Check', 'Declarative Spec', 'Graceful Shutdown'],
    antiPatternsTemplate: () => ['Omitting memory and CPU resource limits', 'Hardcoding secrets or environment-specific credentials directly in manifests'],
    scoreOffset: -4,
  },
  {
    difficulty: 'BEGINNER',
    learningLevel: 'L1',
    archetype: 'trade-off',
    titleSuffix: 'Architectural Alternatives & Operational Trade-offs',
    promptTemplate: (t) =>
      `When adopting ${t.title}, compare it against alternative approaches or tooling. What are the key trade-offs regarding operational complexity, resource overhead, and developer velocity?`,
    rubricGuideTemplate: (t) =>
      `Evaluates understanding of engineering trade-offs when choosing between alternative platforms or patterns for ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['Operational Overhead', 'Resource Footprint', 'Developer Ergonomics', 'Failure Domain', t.rubricAtoms[0]],
    antiPatternsTemplate: () => ['Adopting complex distributed tooling for single-node workloads without justification', 'Ignoring day-2 operational maintenance burden'],
    scoreOffset: -5,
  },
  {
    difficulty: 'BEGINNER',
    learningLevel: 'L1',
    archetype: 'troubleshooting',
    titleSuffix: 'Common Misconfigurations & Defensive Best Practices',
    promptTemplate: (t) =>
      `What are the most common misconfigurations and operational footguns encountered when deploying ${t.title}? How do you detect and prevent them before impacting production workloads?`,
    rubricGuideTemplate: (t) =>
      `Tests defensiveness against frequent configuration errors, silent degradation, and unhandled failure states in ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['Configuration Validation', 'Defensive Guardrails', 'Pre-flight Validation', 'Blast Radius Containment', t.rubricAtoms[2] || 'Operational Best Practice'],
    antiPatternsTemplate: () => ['Deploying changes directly to production without automated staging validation', 'Relying solely on manual sanity testing'],
    scoreOffset: -4,
  },

  // 5-10: Intermediate (L2-L3) - Practical Implementations, CI/CD, Observability & Failures
  {
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L2',
    archetype: 'mechanism',
    titleSuffix: 'State Synchronization & Reconciliation Dynamics',
    promptTemplate: (t) =>
      `How does ${t.title} maintain state consistency across distributed nodes or cluster controllers? Explain the internal synchronization loop, conflict resolution, and how network partitions affect its operation.`,
    rubricGuideTemplate: (t) =>
      `Examines deep knowledge of state reconciliation loops, consensus protocols, optimistic locking, and partition tolerance in ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['Reconciliation Loop', 'State Drift', 'Eventual Consistency', 'Optimistic Concurrency', t.rubricAtoms[0], t.rubricAtoms[1]],
    antiPatternsTemplate: () => ['Assuming infinite network bandwidth and zero latency across cloud zones', 'Ignoring split-brain scenarios in clustered control planes'],
    scoreOffset: 0,
  },
  {
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L2',
    archetype: 'scenario-based',
    titleSuffix: 'Sudden Traffic Spike & Elastic Autoscaling',
    promptTemplate: (t) =>
      `During a sudden 10x traffic spike, a production service utilizing ${t.title} experiences degraded response times. How do you configure automated scaling, queue thresholds, and resource requests to absorb the surge without cascading node failure?`,
    rubricGuideTemplate: (t) =>
      `Assesses practical competence in horizontal scaling, reactive vs predictive autoscaling, backpressure mitigation, and capacity planning for ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['Horizontal Scaling', 'HPA / Autoscaler', 'Backpressure Mitigation', 'Target Metric Utilization', 'Scale-Out Latency', t.rubricAtoms[1]],
    antiPatternsTemplate: () => ['Setting scale-down thresholds too aggressively causing flap and thrash', 'Scaling pods without ensuring downstream database connection capacity'],
    scoreOffset: 1,
  },
  {
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L3',
    archetype: 'implementation',
    titleSuffix: 'Zero-Downtime Deployment & Traffic Cutover',
    promptTemplate: (t) =>
      `Design an automated continuous deployment strategy for an application relying on ${t.title}. How do you achieve zero-downtime rollouts, warm up connections, and execute an immediate automatic rollback if error rates exceed 0.5%?`,
    rubricGuideTemplate: (t) =>
      `Evaluates mastery of canary or blue-green deployment pipelines, health probe alignment, automated analysis runs, and instantaneous rollback mechanisms.`,
    expectedKeywordsTemplate: (t) => ['Zero-Downtime Rollout', 'Canary Analysis', 'Readiness Gates', 'Automated Rollback', 'Connection Draining', t.rubricAtoms[2] || 'Traffic Shifting'],
    antiPatternsTemplate: () => ['Cutting over 100% of production traffic instantaneously without canary verification', 'Terminating old instances before new replicas finish warming their connection pools'],
    scoreOffset: 0,
  },
  {
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L3',
    archetype: 'code-review',
    titleSuffix: 'Production Manifest / Code Security & Efficiency Audit',
    promptTemplate: (t) =>
      `You are reviewing a Pull Request modifying the production infrastructure manifests for ${t.title}. What security vulnerabilities (e.g. privilege escalation, missing network policies), resource inefficiencies, and antipatterns would you flag during the review?`,
    rubricGuideTemplate: (t) =>
      `Measures code review rigor, ability to identify dangerous security defaults, unpinned versions, and sub-optimal resource requests in ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['Least Privilege Audit', 'Privilege Escalation', 'Immutable Tags', 'Resource Quotas', 'Security Context', t.rubricAtoms[0]],
    antiPatternsTemplate: () => ['Approving containers running as root with privileged capabilities', 'Using the "latest" floating image tag in production manifests'],
    scoreOffset: 1,
  },
  {
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L3',
    archetype: 'troubleshooting',
    titleSuffix: 'Diagnosing Latency Anomalies & Resource Throttling',
    promptTemplate: (t) =>
      `Application metrics show tail latency (P99) spiking from 30ms to 900ms when interacting with ${t.title}, yet CPU utilization appears normal (40%). How do you isolate whether the bottleneck is kernel CPU throttling, socket starvation, or DNS latency?`,
    rubricGuideTemplate: (t) =>
      `Tests methodical diagnostic acumen, kernel telemetry analysis (CFS throttling metrics, socket buffer exhaustion), and network packet inspection for ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['P99 Tail Latency', 'CFS Bandwidth Throttling', 'Socket Buffer Queuing', 'conntrack Exhaustion', 'DNS Resolution Delay'],
    antiPatternsTemplate: () => ['Assuming average CPU usage reflects transient micro-burst spikes', 'Blindly increasing replica count without identifying the resource bottleneck'],
    scoreOffset: 0,
  },
  {
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L2',
    archetype: 'debugging',
    titleSuffix: 'Intermittent Network Timeouts & TCP Packet Drops',
    promptTemplate: (t) =>
      `Intermittent connection timeout errors (HTTP 504 / Connection Reset by Peer) occur under high concurrency between microservices and ${t.title}. Walk through the step-by-step diagnostic process using standard CLI and kernel diagnostics to pinpoint the root cause.`,
    rubricGuideTemplate: (t) =>
      `Verifies ability to trace TCP connections across namespaces, inspect SYN backlogs, check ephemeral port exhaustion, and examine MTU packet fragmentation.`,
    expectedKeywordsTemplate: (t) => ['SYN Backlog', 'TIME_WAIT Accumulation', 'Ephemeral Port Exhaustion', 'conntrack Table Full', 'tcpdump / ss Analysis'],
    antiPatternsTemplate: () => ['Restarting random nodes hoping the issue clears without inspecting kernel logs', 'Ignoring MTU mismatches along the overlay network path'],
    scoreOffset: 2,
  },

  // 11-16: Advanced (L3-L4) - Deep Internals, Observability, Telemetry & Blast Radius
  {
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'mechanism',
    titleSuffix: 'Low-Level Kernel / System Driver Deep Dive',
    promptTemplate: (t) =>
      `Deep-dive into the low-level operating system and virtualization mechanics behind ${t.title}. How does the kernel or runtime manage memory pages, context switching, and I/O scheduling to sustain ultra-high I/O throughput?`,
    rubricGuideTemplate: (t) =>
      `Examines staff-level depth in Linux kernel memory subsystems, dirty page writeback, page cache, direct I/O, epoll event loops, and asynchronous I/O primitives for ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['Page Cache', 'epoll / async I/O', 'Dirty Page Writeback', 'Context Switch Overhead', 'Kernel Virtual Memory', t.rubricAtoms[0]],
    antiPatternsTemplate: () => ['Treating kernel I/O as instantaneous and cost-free', 'Failing to account for TLB shootdowns and NUMA memory node layout'],
    scoreOffset: 2,
  },
  {
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'trade-off',
    titleSuffix: 'Distributed Consistency vs Availability Under Partition',
    promptTemplate: (t) =>
      `Analyze the CAP theorem and consensus trade-offs when operating ${t.title} across geographically separated availability zones. How does the system behave when a cross-zone fiber link drops, and how do you guarantee zero split-brain data corruption?`,
    rubricGuideTemplate: (t) =>
      `Evaluates understanding of distributed consensus (Raft/Paxos), quorum requirements, leader election heartbeats, split-brain isolation, and fencing tokens in ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['Quorum Majority', 'Split-Brain Isolation', 'Fencing Tokens', 'Raft Leader Election', 'Partition Tolerance', t.rubricAtoms[1]],
    antiPatternsTemplate: () => ['Allowing an even number of voting nodes in a quorum cluster', 'Permitting stale leaders to accept writes without generation validation'],
    scoreOffset: 3,
  },
  {
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'failure-analysis',
    titleSuffix: 'Cascading Failure & Connection Storm Post-Mortem',
    promptTemplate: (t) =>
      `A transient network glitch causes a cluster utilizing ${t.title} to fail. When services attempt to reconnect simultaneously, a catastrophic thundering herd collapses the upstream control plane. How do you design jittered exponential backoff and circuit breaking to recover?`,
    rubricGuideTemplate: (t) =>
      `Assesses expertise in preventing cascading collapses, thundering herd synchronization, connection pool saturation, and designing graceful cold-start recovery.`,
    expectedKeywordsTemplate: (t) => ['Thundering Herd', 'Jittered Exponential Backoff', 'Circuit Breaking', 'Rate Limiting / Token Bucket', 'Cascading Collapse Mitigation'],
    antiPatternsTemplate: () => ['Executing synchronous immediate retries without randomized jitter', 'Restarting all failed upstream instances simultaneously under heavy inbound load'],
    scoreOffset: 3,
  },
  {
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'scenario-based',
    titleSuffix: 'Multi-Burn-Rate Alerting & Error Budget Policy',
    promptTemplate: (t) =>
      `Design an SRE monitoring and alerting framework for a critical tier-1 platform service using ${t.title}. Formulate the Service Level Indicators (SLIs), Service Level Objectives (SLOs), and a multi-window multi-burn-rate alerting algorithm that eliminates alert fatigue while catching 2% and 5% budget burns within minutes.`,
    rubricGuideTemplate: (t) =>
      `Evaluates deep familiarity with Google SRE workbook standards: multi-window burn rates (1h, 6h, 3d), error budget alerting math, and automated release freeze enforcement.`,
    expectedKeywordsTemplate: (t) => ['SLI Specification', 'SLO Target', 'Multi-Window Multi-Burn-Rate', 'Alert Fatigue Elimination', 'Error Budget Consumption'],
    antiPatternsTemplate: () => ['Relying on arbitrary static thresholds (e.g. CPU > 85%) for critical pager notifications', 'Calculating error rates over a single instantaneous 1-minute window'],
    scoreOffset: 2,
  },
  {
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'debugging',
    titleSuffix: 'Silent Memory Leak & Resource Throttling Post-Mortem',
    promptTemplate: (t) =>
      `A daemon running ${t.title} suffers from creeping memory usage that triggers the kernel OOM killer every 36 hours. Profiling shows native heap allocation growth outside the application runtime heap. How do you inspect memory maps (/proc/pid/smaps), identify memory leaks, and tune container cgroup limits?`,
    rubricGuideTemplate: (t) =>
      `Measures mastery of memory analysis, memory map breakdown (RSS vs Private Dirty vs Shared), glibc arena allocation tuning (MALLOC_ARENA_MAX), and leak identification tools (valgrind, eBPF memleak).`,
    expectedKeywordsTemplate: (t) => ['/proc/$pid/smaps', 'Private Dirty Memory', 'cgroup OOM Eviction', 'eBPF memleak', 'glibc Malloc Arenas'],
    antiPatternsTemplate: () => ['Increasing container memory limits indefinitely as a permanent fix for leaks', 'Assuming application runtime garbage collectors monitor native C/C++ memory bindings'],
    scoreOffset: 3,
  },
  {
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'troubleshooting',
    titleSuffix: 'Distributed Trace Context Loss & Span Correlation',
    promptTemplate: (t) =>
      `In an asynchronous event-driven workflow spanning multiple services and ${t.title}, distributed trace context is dropped, creating orphan traces in Jaeger/Tempo. How do you trace where the W3C traceparent header is lost, instrument custom baggage, and ensure 100% trace correlation across asynchronous message boundaries?`,
    rubricGuideTemplate: (t) =>
      `Tests thorough understanding of OpenTelemetry context injection and extraction, W3C traceparent headers, carrier propagation across message queues, and span parentage.`,
    expectedKeywordsTemplate: (t) => ['W3C traceparent Header', 'OTel Context Injection/Extraction', 'Baggage Propagation', 'Async Message Queue Carrier', 'Orphan Span Resolution'],
    antiPatternsTemplate: () => ['Relying on thread-local storage for context across asynchronous callback boundaries', 'Dropping metadata headers during message serialization'],
    scoreOffset: 2,
  },

  // 17-20: Expert (L4-L5) - Staff/Principal Multi-Region Architecture, Disaster Recovery & Governance
  {
    difficulty: 'EXPERT',
    learningLevel: 'L5',
    archetype: 'design-exercise',
    titleSuffix: 'Active-Active Multi-Region Platform Architecture',
    promptTemplate: (t) =>
      `Architect a zero-downtime, active-active multi-region infrastructure for an enterprise platform utilizing ${t.title}. How do you solve global traffic routing, cross-region data replication latency, distributed state synchronization, and guarantee business continuity if an entire cloud region suffers a total blackout?`,
    rubricGuideTemplate: (t) =>
      `Evaluates Principal/Staff-level architectural authority in global anycast routing, active-active topologies, consensus latency bounds, cross-region replication lag, and region evacuation playbooks.`,
    expectedKeywordsTemplate: (t) => ['Active-Active Multi-Region', 'Anycast / Global DNS Routing', 'Cross-Region Replication Lag', 'Conflict-Free Data Types (CRDT)', 'Regional Evacuation Playbook', t.rubricAtoms[0]],
    antiPatternsTemplate: () => ['Assuming synchronous cross-region database writes can maintain sub-50ms latency', 'Having a single shared global dependency that creates a hidden single point of failure'],
    scoreOffset: 4,
  },
  {
    difficulty: 'EXPERT',
    learningLevel: 'L5',
    archetype: 'failure-analysis',
    titleSuffix: 'Catastrophic Control Plane Partition & Recovery Playbook',
    promptTemplate: (t) =>
      `An unexpected corrupted state write or network split corrupts the underlying consensus store of ${t.title}, leaving the control plane deadlocked while worker nodes continue running. Formulate the emergency disaster recovery runbook to restore control without terminating active production traffic.`,
    rubricGuideTemplate: (t) =>
      `Assesses crisis engineering leadership: snapshot restoration, forced leader election, state quorum reconstruction, validating control plane integrity, and minimizing customer-facing downtime.`,
    expectedKeywordsTemplate: (t) => ['Disaster Recovery Runbook', 'Quorum Loss Recovery', 'Point-in-Time Snapshot Restore', 'Control Plane Re-hydration', 'Blast Radius Quarantine'],
    antiPatternsTemplate: () => ['Wiping the cluster without attempting snapshot recovery and volume preservation', 'Executing ad-hoc emergency commands without capturing state forensics'],
    scoreOffset: 5,
  },
  {
    difficulty: 'EXPERT',
    learningLevel: 'L5',
    archetype: 'trade-off',
    titleSuffix: 'Zero-Trust Enterprise Security & Identity Federation',
    promptTemplate: (t) =>
      `Design an enterprise-grade Zero-Trust security and compliance architecture for ${t.title}. How do you enforce mutual TLS, ephemeral short-lived workload identity federation (eliminating long-lived API keys), automated cryptographic secret rotation, and satisfy strict SOC2/PCI-DSS audit compliance?`,
    rubricGuideTemplate: (t) =>
      `Examines staff-level governance: Workload Identity Federation (OIDC/SPIFFE/SPIRE), dynamic certificate authorities, mTLS data plane encryption, least-privilege IAM policies, and immutable audit logging.`,
    expectedKeywordsTemplate: (t) => ['Zero-Trust Architecture', 'Workload Identity Federation (OIDC)', 'SPIFFE / SPIRE', 'Ephemeral Short-Lived Tokens', 'Immutable Audit Trails', 'SOC2 / PCI-DSS Compliance'],
    antiPatternsTemplate: () => ['Storing long-lived static cloud access keys in CI/CD variables', 'Disabling mTLS encryption for east-west traffic inside the private network boundary'],
    scoreOffset: 4,
  },
  {
    difficulty: 'EXPERT',
    learningLevel: 'L5',
    archetype: 'design-exercise',
    titleSuffix: 'Cloud FinOps & Multi-Million Dollar Infrastructure Optimization',
    promptTemplate: (t) =>
      `Your organization spends $10M+ annually on cloud infrastructure involving ${t.title}. Present a comprehensive FinOps architecture to reduce cloud spend by 35% without degrading performance or reliability. Address resource rightsizing, Spot instance fleet management, network egress elimination, and automated cost anomaly detection.`,
    rubricGuideTemplate: (t) =>
      `Assesses ability to lead large-scale financial engineering: FinOps governance, Spot instance interruption automation, commitment modeling (Savings Plans / RIs), VPC endpoint egress routing, and pod resource quota bin-packing.`,
    expectedKeywordsTemplate: (t) => ['FinOps Lifecycle', 'Spot Fleet Automation', 'Commitment Discounts (Savings Plans)', 'VPC Endpoint Egress Optimization', 'Resource Bin-Packing & Rightsizing', 'Cost Anomaly Detection'],
    antiPatternsTemplate: () => ['Purchasing 3-year upfront reserved capacity without right-sizing baseline workloads first', 'Ignoring cross-AZ and cross-region data transfer egress billing'],
    scoreOffset: 4,
  },
];

export function generateQuestionsForTopic(topic: TopicSeed): QuestionSeed[] {
  const companiesPool = topic.targetCompanies && topic.targetCompanies.length > 0
    ? topic.targetCompanies
    : ['Google', 'Amazon', 'Netflix', 'Meta', 'Stripe', 'Uber', 'Datadog', 'Cloudflare'];

  return QUESTION_ARCHETYPES.map((arch, index) => {
    const qIndex = index + 1;
    const paddedIndex = qIndex.toString().padStart(3, '0');
    const id = `q-${topic.topicId.toLowerCase()}-${paddedIndex}`;

    const rawFreq = topic.frequency + arch.scoreOffset;
    const frequencyScore = Math.max(50, Math.min(99, rawFreq));

    const companySample = [
      companiesPool[index % companiesPool.length],
      companiesPool[(index + 2) % companiesPool.length],
      companiesPool[(index + 4) % companiesPool.length],
    ];

    return {
      id,
      title: `${topic.title}: ${arch.titleSuffix}`,
      difficulty: arch.difficulty,
      learningLevel: arch.learningLevel,
      archetype: arch.archetype,
      prompt: arch.promptTemplate(topic),
      scaleAnchor: `Evaluates candidate depth on ${topic.title} at ${arch.difficulty} level (${arch.learningLevel}).`,
      rubricGuide: arch.rubricGuideTemplate(topic),
      rubricAtoms: [
        ...topic.rubricAtoms.slice(0, 3),
        arch.difficulty,
        arch.learningLevel,
      ],
      hints: [
        `Anchor your answer on the core invariant of ${topic.title}.`,
        `Consider failure modes, blast radius, and observability requirements.`,
        `Discuss concrete production trade-offs rather than generic theoretical definitions.`,
      ],
      followUpProbes: [
        `What happens when this mechanism fails under high network latency?`,
        `How would you monitor and alert on this in an enterprise Prometheus / Grafana setup?`,
        `What is the automated rollback or mitigation strategy if this configuration degrades production?`,
      ],
      expectedKeywords: arch.expectedKeywordsTemplate(topic),
      antiPatterns: arch.antiPatternsTemplate(topic),
      frequencyScore,
      companies: companySample,
    };
  });
}

