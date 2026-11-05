import { TopicSeed } from './types';

export const PILLAR_1_TOPICS: TopicSeed[] = [
  // 1.1 System Design Foundations
  {
    topicId: 'FND001',
    slug: 'intro-system-design',
    title: 'Intro to System Design & Architectural Thinking',
    categorySlug: 'system-design-foundations',
    pillar: 'principles',
    priority: 'P1',
    difficulty: 'BEGINNER',
    durationMin: 15,
    frequency: 0.85,
    weight: 0.90,
    trend: 'STABLE',
    description: 'System boundaries, requirements scoping, architectural block diagrams, and interface abstractions.',
    rubricAtoms: ['system boundaries', 'component decomposition', 'data flow arrows', 'single point of failure'],
    prerequisites: [],
    questions: [
      {
        id: 'q_fnd001_01',
        title: 'System Boundaries and Scoping',
        difficulty: 'BEGINNER',
        learningLevel: 'L1',
        archetype: 'conceptual',
        prompt: 'In a 45-minute system design interview, why is establishing clear system boundaries and scope the most critical first step before drawing any boxes?',
        rubricGuide: 'Candidate must articulate that without clarifying functional requirements and out-of-scope constraints, the candidate risks designing the wrong system or running out of time.',
        rubricAtoms: ['scope clarification', 'time management', 'out of scope boundary'],
        hints: ['What happens if you assume video transcoding is in scope when the interviewer only cares about metadata?'],
        followUpProbes: ['How do you politely verify constraints with an interviewer who gives open-ended prompts?'],
        expectedKeywords: ['boundaries', 'functional requirements', 'constraints', 'scope', 'assumptions']
      },
      {
        id: 'q_fnd001_02',
        title: 'Single Point of Failure (SPOF) Identification',
        difficulty: 'INTERMEDIATE',
        learningLevel: 'L2',
        archetype: 'failure-analysis',
        prompt: 'Given an architecture where three API servers connect to a single primary database without replicas, identify the architectural vulnerabilities and explain how to eliminate single points of failure.',
        rubricGuide: 'Must identify the single primary database as the critical SPOF, explain primary-replica replication or multi-AZ failover, and discuss connection pooling resilience.',
        rubricAtoms: ['spof detection', 'database replication', 'failover automated'],
        hints: ['What happens to incoming traffic when the database node reboots for OS patches?'],
        followUpProbes: ['What is the difference between active-passive and active-active failover for this database?'],
        expectedKeywords: ['SPOF', 'primary-replica', 'failover', 'redundancy', 'heartbeat']
      }
    ]
  },
  {
    topicId: 'FND002',
    slug: 'requirements-engineering',
    title: 'Functional & Non-Functional Requirements',
    categorySlug: 'system-design-foundations',
    pillar: 'principles',
    priority: 'P1',
    difficulty: 'BEGINNER',
    durationMin: 15,
    frequency: 0.92,
    weight: 0.95,
    trend: 'STABLE',
    description: 'Translating product problem statements into concrete SLOs, availability targets, and throughput budgets.',
    rubricAtoms: ['availability nines', 'latency percentiles', 'throughput qps', 'durability'],
    prerequisites: ['intro-system-design'],
    questions: [
      {
        id: 'q_fnd002_01',
        title: 'Availability Nines and Downtime Budget',
        difficulty: 'BEGINNER',
        learningLevel: 'L1',
        archetype: 'conceptual',
        prompt: 'Calculate the allowable yearly downtime for a system promising 99.9% (three nines) vs 99.99% (four nines) availability. How does this dictate architecture choices?',
        rubricGuide: 'Must calculate ~8.76 hours/year for 99.9% vs ~52.6 minutes/year for 99.99%. Explain that four nines requires automated multi-AZ failover without human intervention.',
        rubricAtoms: ['availability calculation', 'error budget', 'automated failover'],
        hints: ['365 days * 24 hours = 8760 hours. What is 0.1% of that?'],
        followUpProbes: ['Can a human engineer manually failover a database within a four-nines SLA?'],
        expectedKeywords: ['8.76 hours', '52.6 minutes', 'automated failover', 'downtime budget']
      },
      {
        id: 'q_fnd002_02',
        title: 'Latency Percentiles: Why Average Latency is Deceptive',
        difficulty: 'INTERMEDIATE',
        learningLevel: 'L2',
        archetype: 'scenario-based',
        prompt: 'Your service reports an average response time of 25ms, yet 1% of users report frequent 3-second timeouts. Explain why p95 and p99 percentiles matter more than mean latency in distributed systems.',
        rubricGuide: 'Must explain long-tail latency, multimodal distributions, and fan-out amplification where a single user request queries 50 backend services in parallel.',
        rubricAtoms: ['p99 percentile', 'fan-out amplification', 'long tail latency'],
        hints: ['If a page requires 100 parallel sub-requests, what is the probability that at least one request hits the 99th percentile?'],
        followUpProbes: ['How does request hedging with jitter mitigate tail latency bottlenecks?'],
        expectedKeywords: ['p99', 'tail latency', 'fan-out', 'distribution', 'percentiles']
      }
    ]
  },
  {
    topicId: 'FND003',
    slug: 'monolith-to-microservices',
    title: 'Architecture Styles: Monolith to Microservices',
    categorySlug: 'system-design-foundations',
    pillar: 'principles',
    priority: 'P1',
    difficulty: 'INTERMEDIATE',
    durationMin: 20,
    frequency: 0.88,
    weight: 0.88,
    trend: 'STABLE',
    description: 'Decomposition boundaries, modular monoliths, distributed complexity, and Strangler Fig migration patterns.',
    rubricAtoms: ['domain driven boundaries', 'strangler fig pattern', 'network latency overhead', 'distributed transactions'],
    prerequisites: ['intro-system-design'],
    questions: [
      {
        id: 'q_fnd003_01',
        title: 'Monolith vs Microservices Trade-Off Defense',
        difficulty: 'INTERMEDIATE',
        learningLevel: 'L2',
        archetype: 'comparison',
        prompt: 'When should an engineering organization choose a Modular Monolith over Microservices, and what hidden operational overhead does decomposing into microservices introduce?',
        rubricGuide: 'Must articulate deployment overhead, distributed tracing, network serialization cost, partial failure handling, and cross-service data consistency challenges.',
        rubricAtoms: ['modular monolith', 'distributed complexity', 'network serialization'],
        hints: ['Consider team size, operational cognitive load, and debugging across RPC boundaries.'],
        followUpProbes: ['How does database per service create transaction challenges compared to a single shared ACID database?'],
        expectedKeywords: ['modular monolith', 'operational overhead', 'network latency', 'distributed transactions', 'team boundaries']
      }
    ]
  },

  // 1.2 Networking & Communication
  {
    topicId: 'FND004',
    slug: 'networking-protocols',
    title: 'HTTP, HTTPS, TCP, UDP, DNS & TLS',
    categorySlug: 'networking-fundamentals',
    pillar: 'principles',
    priority: 'P1',
    difficulty: 'BEGINNER',
    durationMin: 20,
    frequency: 0.90,
    weight: 0.92,
    trend: 'STABLE',
    description: 'Transport layer trade-offs, TCP head-of-line blocking, TLS 1.3 handshake overhead, and DNS routing resolution.',
    rubricAtoms: ['tcp handshake', 'head of line blocking', 'tls 1.3 0-rtt', 'dns ttl propagation'],
    prerequisites: ['intro-system-design'],
    questions: [
      {
        id: 'q_fnd004_01',
        title: 'TCP vs UDP in Real-Time Applications',
        difficulty: 'BEGINNER',
        learningLevel: 'L1',
        archetype: 'comparison',
        prompt: 'Compare TCP and UDP in terms of reliability, congestion control, and connection state. Why do live video streaming and gaming choose UDP / QUIC over TCP?',
        rubricGuide: 'Must explain TCP retransmission and head-of-line blocking delaying fresh frames, whereas UDP allows dropping late frames in favor of immediate real-time playback.',
        rubricAtoms: ['head of line blocking', 'packet retransmission', 'quic udp transport'],
        hints: ['What happens when one audio packet is lost in a live phone call under TCP?'],
        followUpProbes: ['How does HTTP/3 utilize QUIC over UDP to solve TCP head-of-line blocking?'],
        expectedKeywords: ['TCP', 'UDP', 'head-of-line blocking', 'retransmission', 'QUIC', 'congestion control']
      }
    ]
  },
  {
    topicId: 'FND005',
    slug: 'api-communication-fundamentals',
    title: 'REST, RPC, gRPC, WebSockets & API Protocols',
    categorySlug: 'networking-fundamentals',
    pillar: 'principles',
    priority: 'P1',
    difficulty: 'INTERMEDIATE',
    durationMin: 20,
    frequency: 0.90,
    weight: 0.92,
    trend: 'STABLE',
    description: 'Synchronous REST vs Protobuf binary gRPC, Server-Sent Events, bidirectional WebSockets, and API versioning.',
    rubricAtoms: ['protobuf serialization', 'duplex websockets', 'server sent events', 'http2 multiplexing'],
    prerequisites: ['networking-protocols'],
    questions: [
      {
        id: 'q_fnd005_01',
        title: 'gRPC vs REST for Internal Microservices',
        difficulty: 'INTERMEDIATE',
        learningLevel: 'L2',
        archetype: 'comparison',
        prompt: 'Why do high-throughput internal microservice meshes prefer gRPC with Protocol Buffers over REST with JSON payloads?',
        rubricGuide: 'Must explain binary wire format efficiency, code generation contract safety, HTTP/2 multiplexing, and CPU serialization savings over JSON parsing.',
        rubricAtoms: ['protobuf binary format', 'http2 streaming', 'schema compilation'],
        hints: ['Compare the CPU cost of parsing 1MB of JSON vs decoding a protobuf byte stream.'],
        followUpProbes: ['Why is REST still dominant for public browser-facing APIs despite gRPC internal performance?'],
        expectedKeywords: ['gRPC', 'Protocol Buffers', 'HTTP/2', 'binary serialization', 'multiplexing']
      }
    ]
  },

  // 1.3 Database Fundamentals
  {
    topicId: 'FND006',
    slug: 'sql-vs-nosql-modeling',
    title: 'Relational vs NoSQL & Access Patterns',
    categorySlug: 'database-fundamentals',
    pillar: 'principles',
    priority: 'P1',
    difficulty: 'BEGINNER',
    durationMin: 20,
    frequency: 0.92,
    weight: 0.95,
    trend: 'STABLE',
    description: 'Document, Key-Value, Wide-Column, and Relational models evaluated against read/write access patterns.',
    rubricAtoms: ['normalized vs denormalized', 'access pattern driven', 'relational joins', 'wide-column write throughput'],
    prerequisites: ['intro-system-design'],
    questions: [
      {
        id: 'q_fnd006_01',
        title: 'SQL vs NoSQL Architectural Selection',
        difficulty: 'BEGINNER',
        learningLevel: 'L1',
        archetype: 'trade-off',
        prompt: 'In system design interviews, candidates often blindly say "I will use MongoDB". What criteria dictate choosing a relational SQL database over a NoSQL document or key-value store?',
        rubricGuide: 'Must articulate relational ACID transactions, multi-table joins, ad-hoc querying vs denormalized high-scale horizontal writes, simple key lookups, and fixed schema constraints.',
        rubricAtoms: ['acid transactions', 'foreign key constraints', 'horizontal partitionability'],
        hints: ['Consider banking balance transfers vs user session token lookups.'],
        followUpProbes: ['How do modern SQL databases like PostgreSQL handle JSONB fields compared to native document stores?'],
        expectedKeywords: ['ACID', 'normalization', 'denormalization', 'joins', 'access patterns', 'sharding']
      }
    ]
  },
  {
    topicId: 'FND007',
    slug: 'acid-transactions-consistency',
    title: 'ACID Properties, Isolation & Transactions',
    categorySlug: 'database-fundamentals',
    pillar: 'principles',
    priority: 'P1',
    difficulty: 'INTERMEDIATE',
    durationMin: 20,
    frequency: 0.88,
    weight: 0.92,
    trend: 'STABLE',
    description: 'Transaction boundaries, dirty reads, non-repeatable reads, phantom reads, and MVCC snapshot isolation.',
    rubricAtoms: ['dirty reads', 'repeatable read', 'snapshot isolation', 'mvcc multi version'],
    prerequisites: ['sql-vs-nosql-modeling'],
    questions: [
      {
        id: 'q_fnd007_01',
        title: 'Transaction Isolation Levels and Anomaly Prevention',
        difficulty: 'INTERMEDIATE',
        learningLevel: 'L3',
        archetype: 'conceptual',
        prompt: 'Walk through the four standard ANSI SQL isolation levels (Read Uncommitted, Read Committed, Repeatable Read, Serializable). What anomaly does Serializable prevent that Repeatable Read does not?',
        rubricGuide: 'Must explain Dirty Read, Non-Repeatable Read, Phantom Read, and Write Skew anomalies. Explain how Serializable prevents phantom reads and write skew using two-phase locking or SSI.',
        rubricAtoms: ['phantom reads', 'serializable isolation', 'write skew'],
        hints: ['What happens when two doctors try to leave on-call duty simultaneously?'],
        followUpProbes: ['How does PostgreSQL implement Snapshot Isolation using MVCC without full table locks?'],
        expectedKeywords: ['Read Committed', 'Repeatable Read', 'Serializable', 'Dirty Read', 'Phantom Read', 'MVCC']
      }
    ]
  },

  // 1.4 Scalability & Performance Principles
  {
    topicId: 'FND008',
    slug: 'horizontal-vs-vertical-scaling',
    title: 'Horizontal vs Vertical Scaling & Statelessness',
    categorySlug: 'scalability-performance-principles',
    pillar: 'principles',
    priority: 'P1',
    difficulty: 'BEGINNER',
    durationMin: 15,
    frequency: 0.90,
    weight: 0.92,
    trend: 'STABLE',
    description: 'Scale-up limits, scale-out mechanisms, stateless application tiers, and externalized session storage.',
    rubricAtoms: ['stateless services', 'session externalization', 'horizontal auto-scaling', 'vertical limits'],
    prerequisites: ['intro-system-design'],
    questions: [
      {
        id: 'q_fnd008_01',
        title: 'Designing Truly Stateless Service Tiers',
        difficulty: 'BEGINNER',
        learningLevel: 'L1',
        archetype: 'architecture',
        prompt: 'What architectural constraints must be enforced to ensure an API service tier can scale horizontally from 2 nodes to 200 nodes during a traffic spike without dropping user sessions?',
        rubricGuide: 'Must articulate externalizing state (Redis sessions / JWT tokens), removing local in-memory sticky caches, and ensuring any request can be routed to any instance.',
        rubricAtoms: ['stateless tier', 'session offload', 'auto-scaling group'],
        hints: ['What happens if user login state is stored in Node.js process memory when the load balancer routes request 2 to another pod?'],
        followUpProbes: ['What is the trade-off between client-side stateless JWT tokens and centralized Redis session tokens?'],
        expectedKeywords: ['stateless', 'session store', 'horizontal scaling', 'load balancer', 'Redis']
      }
    ]
  },
  {
    topicId: 'FND009',
    slug: 'latency-throughput-slos',
    title: 'Latency, Throughput, Availability & SLOs',
    categorySlug: 'scalability-performance-principles',
    pillar: 'principles',
    priority: 'P1',
    difficulty: 'INTERMEDIATE',
    durationMin: 20,
    frequency: 0.88,
    weight: 0.90,
    trend: 'STABLE',
    description: 'Little’s Law, queueing delay under high utilization, error budgets, and service level objectives.',
    rubricAtoms: ['littles law', 'queue saturation hockey stick', 'sli slo sla distinction', 'error budgets'],
    prerequisites: ['requirements-engineering'],
    questions: [
      {
        id: 'q_fnd009_01',
        title: 'CPU Utilization vs Latency (The Knee of the Curve)',
        difficulty: 'INTERMEDIATE',
        learningLevel: 'L2',
        archetype: 'scenario-based',
        prompt: 'Why does service latency degrade exponentially once server CPU utilization exceeds 75–80%, and how does queueing theory explain this non-linear surge?',
        rubricGuide: 'Must articulate M/M/1 queueing theory where wait time approaches infinity as utilization approaches 100%. Explain that headroom is mandatory to prevent unbounded queue build-up.',
        rubricAtoms: ['queueing theory', 'exponential wait time', 'headroom capacity'],
        hints: ['What happens to customer waiting time in a bank line when tellers are 100% busy?'],
        followUpProbes: ['How do load shedding and admission control algorithms protect servers when utilization hits 85%?'],
        expectedKeywords: ['queueing theory', 'Little\'s Law', 'utilization', 'headroom', 'hockey stick latency']
      }
    ]
  },

  // 1.5 Distributed Systems Principles
  {
    topicId: 'FND010',
    slug: 'cap-pacelc-theorems',
    title: 'CAP & PACELC Theorems in Practice',
    categorySlug: 'distributed-systems-principles',
    pillar: 'principles',
    priority: 'P1',
    difficulty: 'ADVANCED',
    durationMin: 25,
    frequency: 0.95,
    weight: 0.98,
    trend: 'STABLE',
    description: 'Network partitions, CP vs AP trade-offs, and PACELC trade-offs under normal conditions (Latency vs Consistency).',
    rubricAtoms: ['inevitable partitions', 'linearizable vs available', 'pacelc normal latency', 'dynamo ap vs spanner cp'],
    prerequisites: ['acid-transactions-consistency'],
    questions: [
      {
        id: 'q_fnd010_01',
        title: 'CAP Theorem: Why "Pick Any 2" is a Myth',
        difficulty: 'INTERMEDIATE',
        learningLevel: 'L3',
        archetype: 'conceptual',
        prompt: 'Why is the textbook phrase "In CAP Theorem, you can choose any 2 of Consistency, Availability, and Partition Tolerance (CA, CP, AP)" incorrect in distributed networks?',
        rubricGuide: 'Must articulate that network partitions are physical realities of distributed systems. Therefore, Partition Tolerance cannot be sacrificed; during a partition, systems must trade off Consistency vs Availability.',
        rubricAtoms: ['partition inevitability', 'cp vs ap choice', 'network split reality'],
        hints: ['Can you buy a network cable that is 100% guaranteed to never experience packet drops or severed fibers?'],
        followUpProbes: ['How does the PACELC theorem extend CAP to describe latency trade-offs when the network is healthy?'],
        expectedKeywords: ['CAP', 'partition tolerance', 'inevitable', 'CP', 'AP', 'PACELC']
      },
      {
        id: 'q_fnd010_02',
        title: 'PACELC: Cassandra vs MongoDB in Production',
        difficulty: 'ADVANCED',
        learningLevel: 'L4',
        archetype: 'trade-off',
        prompt: 'Classify Apache Cassandra and MongoDB under the PACELC theorem. Explain how their configuration parameters allow tuning consistency vs latency during normal operations.',
        rubricGuide: 'Must classify Cassandra as PA/EL (Partition Available / Else Latency) and MongoDB as PC/EC (Partition Consistent / Else Consistency). Explain tunables like QUORUM vs LOCAL_ONE.',
        rubricAtoms: ['pacelc classification', 'quorum tuning', 'cassandra vs mongodb'],
        hints: ['What happens in Cassandra with write consistency ONE vs ALL?'],
        followUpProbes: ['Why did AWS DynamoDB add strong consistency options to its default eventually consistent model?'],
        expectedKeywords: ['PACELC', 'Cassandra', 'MongoDB', 'PA/EL', 'PC/EC', 'quorum', 'latency']
      }
    ]
  },
  {
    topicId: 'FND011',
    slug: 'consistency-models',
    title: 'Consistency Models: Linearizability to Eventual',
    categorySlug: 'distributed-systems-principles',
    pillar: 'principles',
    priority: 'P1',
    difficulty: 'ADVANCED',
    durationMin: 20,
    frequency: 0.90,
    weight: 0.95,
    trend: 'STABLE',
    description: 'Linearizability, Sequential Consistency, Causal Consistency, Read-Your-Writes, and Monotonic Reads.',
    rubricAtoms: ['linearizability definition', 'read your own writes', 'causal consistency', 'eventual convergence'],
    prerequisites: ['cap-pacelc-theorems'],
    questions: [
      {
        id: 'q_fnd011_01',
        title: 'Read-Your-Own-Writes Consistency Implementation',
        difficulty: 'INTERMEDIATE',
        learningLevel: 'L3',
        archetype: 'scenario-based',
        prompt: 'A user updates their profile picture, refreshes their browser, and still sees their old photo due to read-replica replication lag. How do you design Read-Your-Own-Writes consistency without sending all read traffic to the primary database?',
        rubricGuide: 'Must explain routing reads from the updating user to the primary database for a 5-second window, or checking the user replica sync timestamp / version cookie before reading from replicas.',
        rubricAtoms: ['read your own writes', 'replication lag routing', 'timestamp cookie'],
        hints: ['Does an unrelated visitor viewing that user profile need immediate strong consistency?'],
        followUpProbes: ['How do Monotonic Read guarantees prevent users from seeing time travel backward on consecutive refreshes?'],
        expectedKeywords: ['Read-Your-Writes', 'replication lag', 'primary routing', 'timestamp', 'eventual consistency']
      }
    ]
  },
  {
    topicId: 'FND012',
    slug: 'distributed-clocks-ordering',
    title: 'Distributed Time, Ordering & Failure Models',
    categorySlug: 'distributed-systems-principles',
    pillar: 'principles',
    priority: 'P2',
    difficulty: 'ADVANCED',
    durationMin: 25,
    frequency: 0.80,
    weight: 0.88,
    trend: 'STABLE',
    description: 'NTP drift, Lamport logical clocks, Vector Clocks for causal ordering, Google Spanner TrueTime commit-wait, and crash-stop vs crash-recovery failure models.',
    rubricAtoms: ['clock skew drift', 'vector clocks causal graph', 'truetime uncertainty bound', 'crash-stop vs crash-recovery'],
    prerequisites: ['consistency-models'],
    questions: [
      {
        id: 'q_fnd012_01',
        title: 'The Danger of Last-Write-Wins (LWW) with Physical Clocks',
        difficulty: 'ADVANCED',
        learningLevel: 'L4',
        archetype: 'failure-analysis',
        prompt: 'Why does relying on physical server clock timestamps (System.currentTimeMillis) for Last-Write-Wins conflict resolution in distributed databases silently drop valid user updates?',
        rubricGuide: 'Must explain NTP clock drift, leap seconds, and situations where a node clock runs 200ms slow, causing genuine later writes to be discarded as older updates.',
        rubricAtoms: ['clock skew', 'silent data loss', 'last write wins flaw'],
        hints: ['If Server A clock is at 12:00:01 and Server B clock is at 12:00:00, which write wins regardless of real wall-clock order?'],
        followUpProbes: ['How does Google Spanner TrueTime use atomic clocks and GPS to provide an explicit uncertainty interval [earliest, latest]?'],
        expectedKeywords: ['clock drift', 'NTP', 'Last-Write-Wins', 'TrueTime', 'vector clocks', 'silent data loss']
      }
    ]
  },
  {
    topicId: 'FND013',
    slug: 'byzantine-fault-tolerance',
    title: 'Byzantine Fault Tolerance & Adversarial Systems',
    categorySlug: 'distributed-systems-principles',
    pillar: 'principles',
    priority: 'P2',
    difficulty: 'EXPERT',
    durationMin: 25,
    frequency: 0.72,
    weight: 0.85,
    trend: 'RISING',
    description: 'Byzantine failure model, arbitrary and malicious node behavior, PBFT consensus algorithm, and 3f+1 quorum mathematical proofs.',
    rubricAtoms: ['byzantine failure model', 'pbft 3f+1 quorum math', 'arbitrary node corruption', 'cft vs bft trade-offs'],
    prerequisites: ['consistency-models'],
    questions: [
      {
        id: 'q_fnd013_01',
        title: 'Byzantine Quorum Mathematics: Why 3f+1 Instead of 2f+1 Nodes?',
        difficulty: 'EXPERT',
        learningLevel: 'L5',
        archetype: 'mechanism',
        prompt: 'In Crash Fault Tolerant (CFT) consensus like Raft or Paxos, a cluster of 2f + 1 nodes can tolerate f crashed nodes. Why does a Byzantine Fault Tolerant (BFT) consensus require at least 3f + 1 nodes to tolerate f faulty or malicious nodes?',
        rubricGuide: 'Candidate must prove mathematically: 1) In a cluster of N nodes with f faulty nodes, f nodes might not reply at all, leaving N - f responses; 2) Among those N - f responses, up to f could be from malicious nodes sending conflicting/lying votes; 3) To ensure non-faulty honest nodes outvote faulty nodes, the honest responses (N - 2f) must exceed faulty responses (f): N - 2f > f => N >= 3f + 1; 4) Two quorums of size 2f + 1 must intersect at least at f + 1 nodes to guarantee at least one honest node in the intersection.',
        rubricAtoms: ['3f+1 proof', 'quorum intersection overlap', 'lying vs crash nodes', 'supermajority 2f+1'],
        hints: ['What if f nodes go silent and another f nodes actively lie about the state?'],
        followUpProbes: ['How do cryptographic digital signatures in PBFT reduce message complexity?'],
        expectedKeywords: ['Byzantine', '3f+1', '2f+1', 'PBFT', 'quorum intersection', 'Raft vs PBFT', 'malicious']
      }
    ]
  }
];

