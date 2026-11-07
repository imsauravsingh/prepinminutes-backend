import { TopicSeed } from './types';

export const PILLAR_1_TOPICS: TopicSeed[] = [
  // 1.1 System Design Foundations
  {
    topicId: 'FND001',
    slug: 'intro-system-design',
    title: 'Intro to System Design & Architectural Thinking',
    categorySlug: 'system-design-foundations',
    pillar: 'principles',
    priority: 'P0',
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
    priority: 'P0',
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
    priority: 'P0',
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
    title: 'REST, GraphQL, gRPC, WebSockets & API Protocols',
    categorySlug: 'networking-fundamentals',
    pillar: 'principles',
    priority: 'P1',
    difficulty: 'INTERMEDIATE',
    durationMin: 20,
    frequency: 0.90,
    weight: 0.92,
    trend: 'STABLE',
    description: 'Synchronous REST vs GraphQL vs Protobuf binary gRPC, Server-Sent Events, bidirectional WebSockets, and DataLoader N+1 query prevention.',
    rubricAtoms: ['protobuf serialization', 'duplex websockets', 'graphql dataloader n+1', 'http2 multiplexing'],
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
    priority: 'P0',
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
    priority: 'P0',
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
    priority: 'P0',
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
    priority: 'P1',
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
  },

  // 1.6 Security in System Design
  {
    topicId: 'FND014',
    slug: 'authn-authz-identity',
    title: 'Authentication, Authorization & Identity',
    categorySlug: 'security-fundamentals',
    pillar: 'principles',
    priority: 'P0',
    difficulty: 'INTERMEDIATE',
    durationMin: 25,
    frequency: 0.92,
    weight: 0.90,
    trend: 'RISING',
    description: 'OAuth 2.0 grant flows (Authorization Code + PKCE), OpenID Connect (OIDC), JWT stateless verification vs revocation blacklists, and RBAC vs ABAC policy engines.',
    rubricAtoms: ['oauth2 pkce authorization code', 'oidc id token vs access token', 'jwt signature verification stateless', 'rbac vs abac policy evaluation', 'token revocation blacklist'],
    prerequisites: ['api-communication-fundamentals'],
    questions: [
      {
        id: 'q_fnd014_01',
        title: 'Stateless JWT Verification vs Instant Token Revocation',
        difficulty: 'INTERMEDIATE',
        learningLevel: 'L3',
        archetype: 'trade-off',
        prompt: 'In a microservices architecture, JSON Web Tokens (JWTs) allow downstream services to verify user identity cryptographically without querying an auth database. However, if an employee is terminated or a token is stolen, how do you revoke a stateless JWT immediately without turning the auth database into a centralized bottleneck?',
        rubricGuide: 'Candidate must explain: 1) Short-lived Access Tokens (e.g. 5-15 mins) paired with long-lived Refresh Tokens (stored in DB); 2) Distributed token blacklist/denylist in Redis Cluster with TTL matching token expiration; 3) Token versioning / epoch timestamp on User record; 4) Trade-off: pure statelessness versus instant revocation latency.',
        rubricAtoms: ['short lived access tokens', 'redis revocation blacklist ttl', 'refresh token rotation', 'token epoch user version'],
        hints: ['If a JWT expires in 5 minutes, how large does a temporary revocation blacklist need to be in Redis?'],
        followUpProbes: ['Why is asymmetric RS256 signature verification preferred over symmetric HS256 across independent microservice teams?'],
        expectedKeywords: ['JWT', 'OAuth2', 'revocation', 'blacklist', 'Redis', 'short-lived token', 'Refresh Token', 'RS256']
      }
    ]
  },
  {
    topicId: 'FND015',
    slug: 'encryption-data-security',
    title: 'Data Security: Encryption, Key Management & Secure Protocols',
    categorySlug: 'security-fundamentals',
    pillar: 'principles',
    priority: 'P1',
    difficulty: 'ADVANCED',
    durationMin: 25,
    frequency: 0.88,
    weight: 0.92,
    trend: 'RISING',
    description: 'Symmetric (AES-256-GCM) vs Asymmetric (RSA/ECC) encryption, Envelope Encryption with Cloud KMS/HSM, TLS 1.3 zero-RTT handshake, mTLS mutual authentication, and Zero-Trust network perimeters.',
    rubricAtoms: ['envelope encryption dek kek kms', 'symmetric vs asymmetric trade-offs', 'tls 1.3 handshake optimization', 'mtls zero trust service identity', 'key rotation zero downtime'],
    prerequisites: ['networking-protocols'],
    questions: [
      {
        id: 'q_fnd015_01',
        title: 'Envelope Encryption Architecture: DEK vs KEK in Cloud KMS',
        difficulty: 'ADVANCED',
        learningLevel: 'L4',
        archetype: 'architecture',
        prompt: 'Why should a database or object storage service never send multi-gigabyte files to AWS KMS or Google Cloud KMS directly for encryption? Explain the mechanics of Envelope Encryption using Data Encryption Keys (DEK) and Key Encryption Keys (KEK).',
        rubricGuide: 'Candidate must articulate: 1) KMS has strict payload size limits (typically 4KB) and request rate quotas; 2) Application calls KMS to generate a plaintext DEK and encrypted DEK; 3) Application encrypts large payload locally with plaintext DEK using high-speed symmetric AES-256-GCM; 4) Plaintext DEK is wiped from memory; 5) Encrypted DEK is stored alongside the ciphertext. Decryption reverses the flow via KMS Decrypt(encrypted DEK).',
        rubricAtoms: ['envelope encryption pattern', 'dek data encryption key local', 'kek key encryption key kms', 'aes 256 gcm authenticated encryption'],
        hints: ['How many network round trips to KMS occur when encrypting 10,000 files with envelope encryption?'],
        followUpProbes: ['How do you rotate the Master KEK without re-encrypting petabytes of underlying data files?'],
        expectedKeywords: ['Envelope Encryption', 'KMS', 'DEK', 'KEK', 'AES-256-GCM', 'key rotation', 'ciphertext']
      }
    ]
  },
  {
    topicId: 'FND016',
    slug: 'threat-modeling-defense',
    title: 'System Threat Modeling & Defense Strategies',
    categorySlug: 'security-fundamentals',
    pillar: 'principles',
    priority: 'P2',
    difficulty: 'ADVANCED',
    durationMin: 25,
    frequency: 0.85,
    weight: 0.88,
    trend: 'RISING',
    description: 'STRIDE threat modeling, Layer 3/4/7 DDoS mitigation (Anycast scrubbing, Cloudflare), Web Application Firewalls (WAF), SSRF/SQLi/XSS prevention, replay attack mitigation, and software supply-chain security (SBOM, artifact signing).',
    rubricAtoms: ['stride threat modeling', 'layer 7 ddos mitigation waf', 'ssrf and sql injection defense', 'replay attack prevention nonce', 'supply chain sbom artifact signing'],
    prerequisites: ['authn-authz-identity', 'encryption-data-security'],
    questions: [
      {
        id: 'q_fnd016_01',
        title: 'Layer 7 HTTP Flood DDoS Mitigation vs Volumetric L3/L4 Attacks',
        difficulty: 'ADVANCED',
        learningLevel: 'L4',
        archetype: 'troubleshooting',
        prompt: 'Contrast Layer 3/4 SYN floods with Layer 7 HTTP application floods. Why do standard firewall IP rate limits fail against a distributed botnet executing valid TLS handshakes and complex SQL search queries, and how does edge mitigation defend backend services?',
        rubricGuide: 'Candidate must explain: L3/L4 attacks saturate network bandwidth and SYN queues (mitigated by BGP Anycast scrubbing centers and SYN cookies). L7 attacks exhaust backend CPU/DB connections using legitimate HTTP requests from thousands of residential IPs. Defense requires: 1) Edge WAF behavioral rate limiting; 2) Proof-of-work / JavaScript cryptographic challenges (Cloudflare Turnstile); 3) Cached origin shielding; 4) Dynamic query cost quotas.',
        rubricAtoms: ['layer 3 vs layer 7 ddos', 'anycast scrubbing centers', 'edge waf behavioral analysis', 'turnstile js challenges'],
        hints: ['What happens to database thread pools when 10,000 bots request un-cached search queries simultaneously?'],
        followUpProbes: ['How do cryptographic Software Bill of Materials (SBOM) and container image signing (Sigstore/Cosign) protect production systems against supply-chain dependency injection attacks?'],
        expectedKeywords: ['DDoS', 'Layer 7', 'WAF', 'Anycast', 'SYN flood', 'botnet', 'SBOM', 'supply-chain']
      }
    ]
  },

  // 1.3 Storage & Database Fundamentals Additions
  {
    topicId: 'FND017',
    slug: 'block-file-object-storage',
    title: 'Storage Systems: Block, File & Object Storage Architecture',
    categorySlug: 'database-fundamentals',
    pillar: 'principles',
    priority: 'P1',
    difficulty: 'INTERMEDIATE',
    durationMin: 25,
    frequency: 0.90,
    weight: 0.92,
    trend: 'STABLE',
    description: 'Block Storage (EBS, SAN, NVMe) for DB volumes; File Storage (NFS, EFS) for shared POSIX files; Object Storage (S3, Ceph) for flat immutable blob namespaces; IOPS vs throughput trade-offs.',
    rubricAtoms: ['block vs file vs object storage', 'iops vs sequential throughput', 'posix locking vs rest blob immutable', 'cloud storage volume sizing'],
    prerequisites: ['intro-system-design'],
    questions: [
      {
        id: 'q_fnd017_01',
        title: 'Block vs File vs Object Storage: Workload Mapping & Trade-offs',
        difficulty: 'INTERMEDIATE',
        learningLevel: 'L3',
        archetype: 'comparison',
        prompt: 'Compare Block Storage (e.g. AWS EBS), File Storage (e.g. AWS EFS / NFS), and Object Storage (e.g. AWS S3). Which storage architecture should you select for: 1) High-performance transactional PostgreSQL data directory; 2) Shared multi-server configuration and media uploads; 3) 500 Terabytes of immutable video files? Justify based on latency, concurrency, and cost.',
        rubricGuide: 'Must map: 1) PostgreSQL requires Block Storage for low-latency random I/O, OS page cache integration, and high provisioned IOPS without network file protocol overhead; 2) Shared server config/code assets use File Storage for POSIX file semantics, directory trees, and concurrent read/write mounting across multiple VMs; 3) Video archives use Object Storage for flat addressable namespaces, HTTP byte-range downloads, 99.999999999% durability, and 10x lower cost per gigabyte.',
        rubricAtoms: ['block storage low latency iops', 'file storage posix shared mount', 'object storage blob cost scale', 'workload mapping accuracy'],
        hints: ['Can you run a high-concurrency production MySQL database directly on top of an AWS S3 bucket? Why not?'],
        followUpProbes: ['What is the difference between IOPS (Input/Output Operations Per Second) and Throughput (MB/s), and which matters more for OLTP databases?'],
        expectedKeywords: ['Block Storage', 'File Storage', 'Object Storage', 'EBS', 'EFS', 'S3', 'IOPS', 'POSIX', 'durability']
      }
    ]
  },
  {
    topicId: 'FND018',
    slug: 'distributed-newsql-databases',
    title: 'Distributed SQL & NewSQL Architecture',
    categorySlug: 'database-fundamentals',
    pillar: 'principles',
    priority: 'P2',
    difficulty: 'ADVANCED',
    durationMin: 25,
    frequency: 0.86,
    weight: 0.90,
    trend: 'RISING',
    description: 'Google Spanner, CockroachDB, and TiDB architecture; distributed ACID transactions; Raft/Paxos-replicated range tablets; horizontal write scaling without manual sharding.',
    rubricAtoms: ['distributed acid transactions', 'raft replicated range partitions', 'spanner external consistency', 'two phase commit over paxos'],
    prerequisites: ['sql-vs-nosql-modeling', 'acid-transactions-consistency'],
    questions: [
      {
        id: 'q_fnd018_01',
        title: 'Distributed ACID: 2-Phase Commit Over Multi-Raft Consensus',
        difficulty: 'ADVANCED',
        learningLevel: 'L4',
        archetype: 'mechanism',
        prompt: 'Traditional NoSQL databases sacrifice cross-partition ACID transactions for horizontal scalability. How do modern Distributed SQL (NewSQL) systems like CockroachDB and Google Spanner achieve both horizontal sharding and cross-range ACID transactions without a single central coordinator becoming a failure point?',
        rubricGuide: 'Candidate must explain: 1) Data is split into ordered key ranges (Ranges/Tablets); 2) Each Range is replicated by a dedicated Raft/Paxos group across multiple nodes for fault tolerance; 3) Local transactions within one Range commit via standard Raft quorum; 4) Cross-range transactions use 2-Phase Commit (2PC) where the transaction coordinator itself is replicated via Raft, eliminating coordinator single-point-of-failure; 5) Concurrency is managed via MVCC and hybrid/TrueTime timestamps.',
        rubricAtoms: ['multi raft consensus groups', 'range tablet partitioning', '2pc over replicated consensus', 'mvcc concurrency control'],
        hints: ['What happens in standard 2PC if the coordinator crashes? How does replicated consensus fix that flaw?'],
        followUpProbes: ['Why does range-based sharding require automatic range splitting when a range grows beyond 64MB?'],
        expectedKeywords: ['NewSQL', 'CockroachDB', 'Spanner', 'Raft', '2PC', 'Range', 'distributed ACID', 'MVCC']
      }
    ]
  },

  // 1.4 Scalability & Performance Principles Addition
  {
    topicId: 'FND019',
    slug: 'os-concurrency-primitives',
    title: 'OS & Execution Primitives: Processes, Threads, Concurrency & Memory',
    categorySlug: 'scalability-performance-principles',
    pillar: 'principles',
    priority: 'P1',
    difficulty: 'ADVANCED',
    durationMin: 25,
    frequency: 0.90,
    weight: 0.92,
    trend: 'STABLE',
    description: 'Thread-per-request vs Event-driven single-thread loop vs Goroutines/Green threads; Mutex/CAS/Semaphores; OS Page Cache; I/O multiplexing (epoll/io_uring); Garbage Collection pauses.',
    rubricAtoms: ['thread per request vs event loop', 'epoll io multiplexing', 'cas atomic compare and swap', 'os page cache dirty flush', 'gc pause tail latency'],
    prerequisites: ['intro-system-design'],
    questions: [
      {
        id: 'q_fnd019_01',
        title: 'Thread-per-Request vs Event-Driven Event Loop vs Green Threads',
        difficulty: 'ADVANCED',
        learningLevel: 'L4',
        archetype: 'comparison',
        prompt: 'Compare the concurrency models of: 1) Traditional Thread-per-request (Apache Tomcat); 2) Single-threaded non-blocking Event Loop (Node.js, Nginx, Redis); 3) M:N Green Threads / Goroutines (Go). Why does Thread-per-request collapse under 100,000 concurrent idle WebSocket connections while epoll event loops scale smoothly?',
        rubricGuide: 'Candidate must explain: 1) OS threads have significant stack memory overhead (typically 1MB–8MB per thread) and context-switching CPU penalty when scheduling thousands of threads; 2) 100k threads would consume 100GB+ RAM just for thread stacks; 3) Event loops use OS I/O multiplexing (epoll on Linux, kqueue on macOS) to monitor 100k file descriptors on a single thread with near-zero memory overhead; 4) Go M:N green threads start with tiny 2KB dynamic stacks scheduled in user space.',
        rubricAtoms: ['thread stack memory overhead', 'context switch cpu cost', 'epoll non-blocking io', 'goroutine m n user space scheduler'],
        hints: ['What is the memory size of an OS thread stack versus a Go goroutine stack?'],
        followUpProbes: ['How does a CPU-intensive synchronous task block an event-loop server, and how do worker thread pools mitigate it?'],
        expectedKeywords: ['epoll', 'thread-per-request', 'event loop', 'goroutines', 'context switch', 'I/O multiplexing', 'Node.js', 'Go']
      }
    ]
  },

  // 1.2 Networking & Communication Addition
  {
    topicId: 'FND020',
    slug: 'data-serialization-schema',
    title: 'Data Serialization, Binary Formats & Schema Evolution',
    categorySlug: 'networking-fundamentals',
    pillar: 'principles',
    priority: 'P2',
    difficulty: 'INTERMEDIATE',
    durationMin: 20,
    frequency: 0.88,
    weight: 0.86,
    trend: 'STABLE',
    description: 'JSON vs Protocol Buffers vs Apache Avro vs MessagePack; compact wire encoding; Schema Registries; forward/backward/full compatibility rules; CPU serialization overhead.',
    rubricAtoms: ['binary wire format efficiency', 'protobuf tag based encoding', 'schema registry evolution rules', 'forward vs backward compatibility'],
    prerequisites: ['api-communication-fundamentals'],
    questions: [
      {
        id: 'q_fnd020_01',
        title: 'Protobuf Binary Wire Format vs JSON: Encoding and Compatibility',
        difficulty: 'INTERMEDIATE',
        learningLevel: 'L3',
        archetype: 'mechanism',
        prompt: 'Why does Protocol Buffers (Protobuf) serialize data 5x-10x smaller and 10x faster than JSON? How does Protobuf field tag numbering guarantee backward and forward compatibility when new fields are added or deprecated?',
        rubricGuide: 'Candidate must explain: 1) JSON is text-based, repeating key names ("user_id": 12345) and quotes for every record; 2) Protobuf uses compact binary encoding (Varints, zigzag encoding, field number + wire type tags); field names are never transmitted over the wire; 3) Backward compatibility: newer consumers reading older payloads assign default values to missing field tags; 4) Forward compatibility: older consumers reading newer payloads safely skip unknown field tags.',
        rubricAtoms: ['tag number wire format', 'varint binary compression', 'omission of field names', 'forward and backward compatibility rules'],
        hints: ['Does Protobuf send the string "firstName" across the wire for every single message?'],
        followUpProbes: ['Why is deleting or renumbering an existing tag number in a .proto file considered a breaking change?'],
        expectedKeywords: ['Protobuf', 'binary encoding', 'Varint', 'tag number', 'JSON', 'backward compatibility', 'schema evolution']
      }
    ]
  },

  // 1.1 System Design Foundations Addition
  {
    topicId: 'FND021',
    slug: 'tradeoffs-technology-selection',
    title: 'System Design Trade-offs & Technology Selection Framework',
    categorySlug: 'system-design-foundations',
    pillar: 'principles',
    priority: 'P0',
    difficulty: 'INTERMEDIATE',
    durationMin: 25,
    frequency: 0.95,
    weight: 0.94,
    trend: 'STABLE',
    description: 'The Scaling Decision Matrix: when to cache vs queue vs replicate vs shard; Build vs Buy; Open-source vs Cloud Managed Services; Total Cost of Ownership (TCO) evaluation.',
    rubricAtoms: ['scaling decision matrix', 'when to cache queue replicate shard', 'build vs buy tco analysis', 'operational risk governance'],
    prerequisites: ['requirements-engineering'],
    questions: [
      {
        id: 'q_fnd021_01',
        title: 'The Scaling Decision Matrix: Cache, Queue, Replicate, or Shard',
        difficulty: 'INTERMEDIATE',
        learningLevel: 'L3',
        archetype: 'trade-off',
        prompt: 'When an application database experiences severe latency bottlenecks under growing user traffic, how do you systematically decide whether to: 1) Add Redis caching; 2) Introduce Read Replicas; 3) Asynchronously decouple writes via Message Queues; or 4) Partition and shard the database? What is the architectural cost and limitation of each?',
        rubricGuide: 'Candidate must provide a structured decision tree: 1) Read-heavy with static/infrequent updates -> Redis Cache (Trade-off: stale data, invalidation complexity); 2) Read-heavy with analytical/reporting queries -> Read Replicas (Trade-off: replication lag, read-your-writes violation); 3) Write-heavy bursty traffic with non-blocking dependencies -> Message Queues (Trade-off: eventual consistency, backpressure management); 4) Storage capacity exhausted or write throughput exceeds single-node primary hardware limit -> Sharding (Trade-off: non-sharded joins broken, resharding operational overhead).',
        rubricAtoms: ['structured decision framework', 'cache for hot reads', 'replicas for reporting reads', 'queues for write bursts', 'sharding as last resort'],
        hints: ['Why is database sharding considered the last resort rather than the first solution?'],
        followUpProbes: ['How do you evaluate "Build vs Buy" for a messaging broker (e.g. self-hosting Kafka on EC2 vs AWS Amazon MSK / SQS) taking into account operational toil and engineer salaries?'],
        expectedKeywords: ['decision matrix', 'caching', 'read replicas', 'message queues', 'sharding', 'Build vs Buy', 'TCO']
      }
    ]
  }
];

