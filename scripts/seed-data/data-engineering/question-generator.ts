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
  // 1-4: Beginner (L1) - Fundamentals, Storage Formats & Core Mechanics
  {
    difficulty: 'BEGINNER',
    learningLevel: 'L1',
    archetype: 'mechanism',
    titleSuffix: 'Core Storage Architecture & Data Organization',
    promptTemplate: (t) =>
      `Explain the fundamental architectural mechanisms and data organization of ${t.title}. How does it lay out records in memory or on disk, and what performance invariants does it provide for analytical queries?`,
    rubricGuideTemplate: (t) =>
      `Assesses foundational grasp of ${t.title} internal layout, memory organization, and data access mechanics without relying on generic high-level buzzwords.`,
    expectedKeywordsTemplate: (t) => [t.rubricAtoms[0] || 'Data Layout', 'Memory / Disk Organization', 'Analytical Query Throughput', 'Schema Structure', 'Access Invariants'],
    antiPatternsTemplate: () => ['Confusing row-oriented storage with columnar projection', 'Treating distributed storage systems as single-node synchronous disks'],
    scoreOffset: -3,
  },
  {
    difficulty: 'BEGINNER',
    learningLevel: 'L1',
    archetype: 'implementation',
    titleSuffix: 'Canonical Transformation & Pipeline Specification',
    promptTemplate: (t) =>
      `Walk through a canonical production-ready query, job, or specification for ${t.title}. What parameters, schema definitions, and partitioning choices are required to ensure deterministic and idempotent execution?`,
    rubricGuideTemplate: (t) =>
      `Verifies ability to craft clean, performant, and idempotent pipeline configurations or transformation queries for ${t.title}.`,
    expectedKeywordsTemplate: (t) => [t.rubricAtoms[1] || 'Schema Definition', 'Idempotent Pipeline', 'Partition Strategy', 'Deterministic Execution', 'Data Types'],
    antiPatternsTemplate: () => ['Omitting partition prune filters leading to full table scans', 'Writing non-idempotent append operations that produce duplicate records on retry'],
    scoreOffset: -4,
  },
  {
    difficulty: 'BEGINNER',
    learningLevel: 'L1',
    archetype: 'trade-off',
    titleSuffix: 'Architectural Trade-offs & Serialization Alternatives',
    promptTemplate: (t) =>
      `When designing a data platform component utilizing ${t.title}, compare it against alternative formats or engines. What are the key trade-offs between write amplification, query latency, compression efficiency, and compute overhead?`,
    rubricGuideTemplate: (t) =>
      `Evaluates understanding of engineering trade-offs when choosing alternative storage formats, compute frameworks, or modeling paradigms for ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['Write Amplification', 'Query Latency', 'Compression Ratio', 'Compute Footprint', t.rubricAtoms[0]],
    antiPatternsTemplate: () => ['Using row-based formats (like JSON/CSV) for petabyte-scale analytical queries', 'Over-partitioning tables resulting in millions of sub-megabyte files'],
    scoreOffset: -5,
  },
  {
    difficulty: 'BEGINNER',
    learningLevel: 'L1',
    archetype: 'troubleshooting',
    titleSuffix: 'Common Pipeline Bottlenecks & Defensive Guardrails',
    promptTemplate: (t) =>
      `What are the most frequent runtime performance bottlenecks and data corruption pitfalls encountered when operating ${t.title}? How do you detect and mitigate them proactively?`,
    rubricGuideTemplate: (t) =>
      `Tests defensiveness against silent data drift, memory exhaustion (OOM), serialization errors, and pipeline degradation in ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['Defensive Schema Validation', 'Memory Exhaustion (OOM)', 'Data Drift Detection', 'Spill-to-Disk Prevention', t.rubricAtoms[2] || 'Operational Best Practice'],
    antiPatternsTemplate: () => ['Deploying pipeline changes without upstream schema contract validation', 'Ignoring executor memory limits under sudden volume surges'],
    scoreOffset: -4,
  },

  // 5-10: Intermediate (L2-L3) - Practical Transformations, Ingestion, Skew & Compaction
  {
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L2',
    archetype: 'mechanism',
    titleSuffix: 'Distributed Execution, Partitioning & Shuffle Dynamics',
    promptTemplate: (t) =>
      `How does ${t.title} execute queries or transformations across distributed compute worker nodes? Explain the internal partition boundaries, network shuffle exchanges, and how memory is allocated between execution and storage.`,
    rubricGuideTemplate: (t) =>
      `Examines deep knowledge of distributed physical plan generation, stage boundaries, network shuffle read/write bottlenecks, and unified memory division for ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['Network Shuffle Boundary', 'Partition Distribution', 'Stage DAG Execution', 'Execution vs Storage Memory', t.rubricAtoms[0], t.rubricAtoms[1]],
    antiPatternsTemplate: () => ['Assuming all worker nodes process uniform data volumes without verifying partition distribution', 'Triggering wide shuffles unnecessarily across unindexed columns'],
    scoreOffset: 0,
  },
  {
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L2',
    archetype: 'scenario-based',
    titleSuffix: 'Mitigating Severe Data Skew & Long-Tail Stragglers',
    promptTemplate: (t) =>
      `During a high-volume batch or streaming transformation using ${t.title}, 99% of tasks complete in seconds while a single task straggler stalls the pipeline for 45 minutes due to severe key skew (e.g. nulls or hot tenant IDs). How do you diagnose and eliminate this bottleneck?`,
    rubricGuideTemplate: (t) =>
      `Assesses practical competence in isolating data skew, analyzing executor metrics, implementing key salting techniques, and configuring adaptive query execution for ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['Data Skew Remediation', 'Key Salting Technique', 'Straggler Task Identification', 'Adaptive Query Execution (AQE)', 'Broadcast Join Threshold', t.rubricAtoms[1]],
    antiPatternsTemplate: () => ['Blindly increasing executor memory hoping the skewed task fits without spilling', 'Ignoring null key filtering before executing heavy joins'],
    scoreOffset: 1,
  },
  {
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L3',
    archetype: 'implementation',
    titleSuffix: 'Incremental Loading & Change Data Capture (CDC) Merge',
    promptTemplate: (t) =>
      `Design an incremental loading pipeline for an analytical table relying on ${t.title}. How do you ingest upstream change streams (inserts, updates, deletes via CDC), ensure exactly-once deduplication, and execute an efficient atomic merge into the target table?`,
    rubricGuideTemplate: (t) =>
      `Evaluates mastery of Change Data Capture (CDC) processing, watermark extraction, deduplication with window functions or state, and executing atomic ACID merge operations.`,
    expectedKeywordsTemplate: (t) => ['Change Data Capture (CDC)', 'Atomic MERGE Operation', 'Idempotent Deduplication', 'Watermark Timestamp', 'ACID Transaction Guarantee', t.rubricAtoms[2] || 'Incremental Loading'],
    antiPatternsTemplate: () => ['Executing full table overwrites on multi-terabyte datasets for minor daily updates', 'Allowing out-of-order CDC updates to overwrite newer records'],
    scoreOffset: 0,
  },
  {
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L3',
    archetype: 'code-review',
    titleSuffix: 'Production Transformation Query & Resource Efficiency Audit',
    promptTemplate: (t) =>
      `You are reviewing a Pull Request modifying a mission-critical pipeline for ${t.title}. What anti-patterns (e.g. Cartesian products, missing predicate pushdown, excessive serialization, non-deterministic UDFs) would you flag during the review?`,
    rubricGuideTemplate: (t) =>
      `Measures query review rigor, ability to identify costly broadcast explosions, un-vectorized Python UDFs, and sub-optimal join reorderings in ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['Predicate Pushdown Verification', 'Python UDF Serialization Tax', 'Cartesian Product Risk', 'Vectorized Native Execution', 'Broadcast Threshold Audit', t.rubricAtoms[0]],
    antiPatternsTemplate: () => ['Using row-by-row black-box Python UDFs instead of native vectorized expressions', 'Joining on unindexed string expressions without pre-filtering'],
    scoreOffset: 1,
  },
  {
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L3',
    archetype: 'troubleshooting',
    titleSuffix: 'The Small File Problem & Compaction Governance',
    promptTemplate: (t) =>
      `Frequent micro-batch streaming commits into ${t.title} produce millions of 100KB files, causing metadata query latency to degrade from 2s to 120s. How do you design an automated compaction and retention policy without conflicting with active readers or concurrent writer transactions?`,
    rubricGuideTemplate: (t) =>
      `Tests operational knowledge of file sizing optimization, snapshot retention, bin-packing compactions (OPTIMIZE), and managing concurrent reader/writer transactions.`,
    expectedKeywordsTemplate: (t) => ['Small File Problem', 'Bin-Packing Compaction', 'Metadata Latency Degradation', 'Concurrent Writer Transactions', 'Snapshot Retention Policy'],
    antiPatternsTemplate: () => ['Running uncoordinated full-table compactions during peak streaming ingest hours', 'Deleting historical files manually from object storage without pruning metadata manifests'],
    scoreOffset: 0,
  },
  {
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L2',
    archetype: 'debugging',
    titleSuffix: 'Consumer Lag & Pipeline Backpressure Diagnostics',
    promptTemplate: (t) =>
      `In a high-throughput processing topology incorporating ${t.title}, consumer lag surges exponentially during peak hours, and downstream write buffers overflow. Walk through the diagnostic workflow to pinpoint whether the bottleneck is network I/O, commit latency, or serialization overhead.`,
    rubricGuideTemplate: (t) =>
      `Verifies ability to trace distributed consumer lag, identify thread contention, evaluate downstream commit rate limits, and tune batch buffer sizes.`,
    expectedKeywordsTemplate: (t) => ['Consumer Lag Surges', 'Backpressure Propagation', 'Commit Latency Bottleneck', 'Thread Pool Starvation', 'Batch Buffer Tuning'],
    antiPatternsTemplate: () => ['Increasing consumer thread counts when the bottleneck is downstream database write throughput', 'Ignoring GC pause times causing false heartbeat timeouts'],
    scoreOffset: 2,
  },

  // 11-16: Advanced (L3-L4) - Deep Internals, Exactly-Once Semantics, State & Failures
  {
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'mechanism',
    titleSuffix: 'Low-Level Storage Engine & Query Optimizer Deep Dive',
    promptTemplate: (t) =>
      `Deep-dive into the low-level query optimization and memory management mechanics behind ${t.title}. How does the cost-based optimizer evaluate cardinality, push down projections, and generate vectorized execution code to maximize CPU cache locality?`,
    rubricGuideTemplate: (t) =>
      `Examines staff-level depth in cost-based query optimization (CBO), statistic collection, column-striping, CPU SIMD vectorization, and off-heap binary memory management for ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['Cost-Based Optimizer (CBO)', 'Vectorized SIMD Processing', 'CPU L1/L2 Cache Locality', 'Off-Heap Binary Memory', 'Columnar Striping Mechanics', t.rubricAtoms[0]],
    antiPatternsTemplate: () => ['Assuming the query planner has accurate column statistics without running explicit analyze jobs', 'Relying on interpreted JVM/Python object wrappers for inner-loop processing'],
    scoreOffset: 2,
  },
  {
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'trade-off',
    titleSuffix: 'Consistency, Isolation Levels & ACID Transaction Guarantees',
    promptTemplate: (t) =>
      `Analyze the concurrency control, snapshot isolation, and ACID transaction mechanics when operating ${t.title} under heavy concurrent read and write operations. How does the system detect write-write conflicts, and what are the trade-offs between serializable vs snapshot isolation?`,
    rubricGuideTemplate: (t) =>
      `Evaluates understanding of optimistic concurrency control (OCC), multi-version concurrency control (MVCC), write-conflict retry storms, and snapshot isolation in ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['Optimistic Concurrency Control (OCC)', 'Multi-Version Concurrency (MVCC)', 'Snapshot Isolation vs Serializable', 'Write-Write Conflict Resolution', 'Conflict Retry Throttling', t.rubricAtoms[1]],
    antiPatternsTemplate: () => ['Allowing multiple uncoordinated batch jobs to update the same partition concurrently without locking', 'Assuming eventual consistency is sufficient for financial ledger tables'],
    scoreOffset: 3,
  },
  {
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'failure-analysis',
    titleSuffix: 'Distributed Pipeline Failure & Exactly-Once State Recovery',
    promptTemplate: (t) =>
      `A catastrophic hardware crash occurs mid-flight in a distributed pipeline utilizing ${t.title}, corrupting in-memory state and leaving partial files in storage. Explain the exact mechanism by which the engine rolls back uncommitted data, restores state from checkpoints, and guarantees Exactly-Once Semantics (EOS).`,
    rubricGuideTemplate: (t) =>
      `Assesses expertise in distributed checkpointing (Chandy-Lamport), two-phase commits, transactional atomic sinks, state recovery, and preventing phantom duplicate records.`,
    expectedKeywordsTemplate: (t) => ['Exactly-Once Semantics (EOS)', 'Distributed Checkpointing', 'Two-Phase Commit Protocol', 'Atomic File Visibility', 'Uncommitted Data Rollback'],
    antiPatternsTemplate: () => ['Committing offsets before data is durably acknowledged by downstream sinks', 'Writing non-transactional partial files directly to production directories'],
    scoreOffset: 3,
  },
  {
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'scenario-based',
    titleSuffix: 'End-to-End Data Observability & Freshness SLA Enforcement',
    promptTemplate: (t) =>
      `Design an enterprise data observability and alerting architecture for critical analytical tables powered by ${t.title}. Formulate the Data Freshness SLAs, volume anomaly detection algorithms, automated schema drift alerts, and circuit breakers that halt downstream jobs when quality fails.`,
    rubricGuideTemplate: (t) =>
      `Evaluates deep familiarity with modern data reliability standards: data freshness metrics, automated volume anomaly thresholds, column-level lineage tracking, and pipeline circuit breakers.`,
    expectedKeywordsTemplate: (t) => ['Data Freshness SLA', 'Volume Anomaly Detection', 'Automated Schema Drift Alert', 'Data Pipeline Circuit Breaker', 'Column-Level Lineage Tracking'],
    antiPatternsTemplate: () => ['Alerting only when an Airflow task crashes, ignoring silent data corruption or empty partitions', 'Sending raw alerts to Slack without defining incident ownership or runbooks'],
    scoreOffset: 2,
  },
  {
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'debugging',
    titleSuffix: 'Debugging Silent Data Duplication & Watermark Drifts',
    promptTemplate: (t) =>
      `Downstream analytics show critical metric counts (such as daily active users) inflated by 14% due to subtle duplicate records produced by ${t.title}. Profiling reveals out-of-order event timestamps and late-arriving records breaching the watermark threshold. Walk through the root-cause diagnosis and remediation.`,
    rubricGuideTemplate: (t) =>
      `Measures mastery of event-time watermarking, late data side-outputs, deduplication state windowing, and idempotency key enforcement.`,
    expectedKeywordsTemplate: (t) => ['Watermark Drift', 'Late-Arriving Events', 'Idempotent Deduplication Key', 'Side-Output Routing', 'State Expiration (TTL)'],
    antiPatternsTemplate: () => ['Setting watermark delay to infinity causing unbounded state memory growth', 'Relying on non-deterministic ingestion timestamps for financial aggregation'],
    scoreOffset: 3,
  },
  {
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'troubleshooting',
    titleSuffix: 'Enterprise Data Security, Masking & Regulatory PII Erasure',
    promptTemplate: (t) =>
      `Under GDPR and CCPA "Right to Be Forgotten" mandates, an enterprise must erase specific customer PII records across multi-petabyte historical datasets stored in ${t.title} within 30 days. How do you design an automated, cost-effective deletion architecture that complies with regulations without re-writing entire historical partitions daily?`,
    rubricGuideTemplate: (t) =>
      `Tests thorough understanding of immutable lakehouse deletion strategies: Copy-on-Write vs Merge-on-Read, deletion vectors, position deletes, and metadata pruning.`,
    expectedKeywordsTemplate: (t) => ['GDPR / CCPA Erasure', 'Right to Be Forgotten', 'Deletion Vectors', 'Position Deletes', 'Metadata Compaction Cycles', 'Cryptographic Shredding'],
    antiPatternsTemplate: () => ['Rewriting entire multi-petabyte datasets every day for single-row deletions', 'Ignoring historical backups and snapshots in object storage during PII audits'],
    scoreOffset: 2,
  },

  // 17-20: Expert (L4-L5) - Petabyte-Scale Architecture, Data Mesh, Platform Strategy & FinOps
  {
    difficulty: 'EXPERT',
    learningLevel: 'L5',
    archetype: 'design-exercise',
    titleSuffix: 'Petabyte-Scale Modern Lakehouse Platform Architecture',
    promptTemplate: (t) =>
      `Architect a unified, petabyte-scale modern Lakehouse platform incorporating ${t.title} supporting both sub-second interactive BI analytics and real-time streaming ML pipelines. Present the complete data flow from ingestion to consumption, addressing storage partitioning, compute isolation, governance, and multi-region disaster recovery.`,
    rubricGuideTemplate: (t) =>
      `Evaluates Principal/Staff-level architectural authority: Medallion layering, storage/compute decoupling, open table formats, compute engine routing, and cross-region replication.`,
    expectedKeywordsTemplate: (t) => ['Decoupled Storage & Compute', 'Medallion Architecture (Bronze/Silver/Gold)', 'Open Lakehouse Table Format', 'Multi-Engine Routing', 'Cross-Region Disaster Recovery', t.rubricAtoms[0]],
    antiPatternsTemplate: () => ['Building proprietary vendor-locked silos that prevent heterogeneous compute engines from accessing data', 'Ignoring cold storage lifecycle tiering for historical petabyte archives'],
    scoreOffset: 4,
  },
  {
    difficulty: 'EXPERT',
    learningLevel: 'L5',
    archetype: 'failure-analysis',
    titleSuffix: 'Catastrophic Metadata Corruption & Disaster Recovery Playbook',
    promptTemplate: (t) =>
      `An erroneous script or network partition corrupts the central catalog and table metadata of ${t.title}, rendering petabytes of production data invisible to downstream query engines. Formulate the emergency disaster recovery runbook to restore catalog state, reconcile metadata files, and verify data consistency.`,
    rubricGuideTemplate: (t) =>
      `Assesses crisis data engineering leadership: snapshot time-travel restoration, metadata reconstruction from manifest files, verifying data parity, and disaster recovery execution.`,
    expectedKeywordsTemplate: (t) => ['Metadata Reconstruction Runbook', 'Snapshot Time Travel', 'Manifest File Reconciliation', 'Catalog State Recovery', 'Data Integrity Audit'],
    antiPatternsTemplate: () => ['Restoring from a stale backup without accounting for recent append commits', 'Running unverified re-indexing scripts directly on production storage without taking a snapshot'],
    scoreOffset: 5,
  },
  {
    difficulty: 'EXPERT',
    learningLevel: 'L5',
    archetype: 'trade-off',
    titleSuffix: 'Data Mesh Governance, Domain Ownership & Data Contracts',
    promptTemplate: (t) =>
      `Design an enterprise Data Mesh architecture utilizing ${t.title}. How do you transition a centralized data team into decentralized domain-oriented data products, enforce automated Data Contracts between operational software and analytical systems, and implement federated computational governance?`,
    rubricGuideTemplate: (t) =>
      `Examines staff-level governance: Data as a Product, domain boundaries, automated CI/CD schema contract enforcement, self-service data platform infrastructure, and federated policy enforcement.`,
    expectedKeywordsTemplate: (t) => ['Data Mesh Principles', 'Data as a Product', 'Domain-Oriented Ownership', 'Automated Data Contracts', 'Federated Computational Governance', 'Self-Service Platform Infrastructure'],
    antiPatternsTemplate: () => ['Decentralizing teams without establishing central automated platform standards and guardrails', 'Allowing upstream software engineers to alter database schemas without downstream notification'],
    scoreOffset: 4,
  },
  {
    difficulty: 'EXPERT',
    learningLevel: 'L5',
    archetype: 'design-exercise',
    titleSuffix: 'Big Data Cloud FinOps & Multi-Million Dollar Infrastructure Optimization',
    promptTemplate: (t) =>
      `Your organization spends $12M+ annually on cloud data warehouse and compute infrastructure centered on ${t.title}. Present a comprehensive FinOps architecture to reduce spend by 40% without compromising query SLAs. Address warehouse warehouse auto-suspension, cluster rightsizing, egress elimination, and query cost attribution.`,
    rubricGuideTemplate: (t) =>
      `Assesses ability to lead large-scale financial engineering: FinOps unit economics, query cost allocation by team, Spot instance fleet management for batch jobs, storage tiering, and pruning redundant materialized views.`,
    expectedKeywordsTemplate: (t) => ['Data Platform FinOps', 'Unit Economics per Query', 'Virtual Warehouse Rightsizing', 'Spot Instance Compute Clusters', 'Storage Lifecycle Auto-Tiering', 'Egress Cost Optimization'],
    antiPatternsTemplate: () => ['Buying multi-year upfront warehouse commitments before optimizing un-partitioned queries', 'Letting development environments run continuous 24/7 compute clusters'],
    scoreOffset: 4,
  },
];

export function generateQuestionsForTopic(topic: TopicSeed): QuestionSeed[] {
  const companiesPool = topic.targetCompanies && topic.targetCompanies.length > 0
    ? topic.targetCompanies
    : ['Databricks', 'Snowflake', 'Netflix', 'Uber', 'Stripe', 'Meta', 'Amazon', 'LinkedIn'];

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
      scaleAnchor: `Evaluates technical depth on ${topic.title} at ${arch.difficulty} level (${arch.learningLevel}).`,
      rubricGuide: arch.rubricGuideTemplate(topic),
      rubricAtoms: [
        ...topic.rubricAtoms.slice(0, 3),
        arch.difficulty,
        arch.learningLevel,
      ],
      hints: [
        `Anchor your answer on the core invariant and storage/execution mechanics of ${topic.title}.`,
        `Consider memory management, distributed partition layout, and failure modes.`,
        `Discuss concrete production trade-offs rather than high-level generic definitions.`,
      ],
      followUpProbes: [
        `What happens when this mechanism encounters severe data skew across worker nodes?`,
        `How would you monitor and alert on pipeline degradation in an enterprise Prometheus / Grafana / Datadog setup?`,
        `What is the automated rollback or disaster recovery mitigation if this pipeline corrupts state?`,
      ],
      expectedKeywords: arch.expectedKeywordsTemplate(topic),
      antiPatterns: arch.antiPatternsTemplate(topic),
      frequencyScore,
      companies: companySample,
    };
  });
}

