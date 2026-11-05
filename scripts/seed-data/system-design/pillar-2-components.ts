import { TopicSeed } from './types';

export const PILLAR_2_TOPICS: TopicSeed[] = [
  // 2.1 Traffic Management & Networking Components
  {
    topicId: 'CMP001',
    slug: 'load-balancers-traffic',
    title: 'Load Balancers & Traffic Distribution',
    categorySlug: 'traffic-management-components',
    pillar: 'components',
    priority: 'P1',
    difficulty: 'BEGINNER',
    durationMin: 20,
    frequency: 0.90,
    weight: 0.92,
    trend: 'STABLE',
    description: 'L4 vs L7 balancing, consistent IP hashing, active/passive health probing, and Anycast routing.',
    rubricAtoms: ['l4 vs l7 inspection', 'consistent hashing balance', 'health check probing', 'session affinity sticky'],
    prerequisites: ['networking-protocols'],
    foundedOn: ['networking-protocols', 'horizontal-vs-vertical-scaling'],
    questions: [
      {
        id: 'q_cmp001_01',
        title: 'Layer 4 vs Layer 7 Load Balancing Trade-Offs',
        difficulty: 'BEGINNER',
        learningLevel: 'L1',
        archetype: 'comparison',
        prompt: 'Contrast Layer 4 (Transport) and Layer 7 (Application) load balancing. Under what conditions would you choose HAProxy/Nginx at L7 over an L4 IP/Port load balancer like AWS NLB?',
        rubricGuide: 'Must explain packet forwarding speed and connection count of L4 vs URL path routing, header inspection, SSL termination, and cookie affinity of L7.',
        rubricAtoms: ['l4 vs l7', 'packet inspection', 'ssl termination', 'throughput vs features'],
        hints: ['Does an L4 load balancer unpack the HTTP request payload?'],
        followUpProbes: ['How does TLS termination at the load balancer affect CPU load on backend application servers?'],
        expectedKeywords: ['Layer 4', 'Layer 7', 'HAProxy', 'SSL termination', 'routing', 'TCP']
      }
    ]
  },
  {
    topicId: 'CMP002',
    slug: 'api-gateway-reverse-proxy',
    title: 'API Gateway & Reverse Proxy Architecture',
    categorySlug: 'traffic-management-components',
    pillar: 'components',
    priority: 'P1',
    difficulty: 'INTERMEDIATE',
    durationMin: 20,
    frequency: 0.92,
    weight: 0.92,
    trend: 'STABLE',
    description: 'Request routing, JWT authentication validation, rate limiting plugins, and Backend-for-Frontend (BFF).',
    rubricAtoms: ['bff pattern', 'jwt verification offload', 'reverse proxy tls', 'gateway resilience'],
    prerequisites: ['load-balancers-traffic'],
    foundedOn: ['api-communication-fundamentals'],
    questions: [
      {
        id: 'q_cmp002_01',
        title: 'The Backend-For-Frontend (BFF) Pattern',
        difficulty: 'INTERMEDIATE',
        learningLevel: 'L2',
        archetype: 'architecture',
        prompt: 'Why do modern architectures deploy separate Backend-for-Frontend (BFF) gateways for mobile apps, desktop web, and third-party partners rather than a single monolithic API gateway?',
        rubricGuide: 'Must articulate network bandwidth conservation for mobile, disparate response payload shapes, varied authentication schemes, and independent deployment lifecycles.',
        rubricAtoms: ['bff pattern', 'mobile payload optimization', 'independent deployment'],
        hints: ['Does a mobile client on 4G need the same 50 fields that a desktop admin dashboard needs?'],
        followUpProbes: ['How do you prevent the BFF layer from becoming an operational bottleneck containing duplicated business logic?'],
        expectedKeywords: ['BFF', 'mobile', 'API Gateway', 'payload aggregation', 'over-fetching']
      }
    ]
  },
  {
    topicId: 'CMP003',
    slug: 'cdn-edge-caching',
    title: 'CDN & Edge Caching Architecture',
    categorySlug: 'traffic-management-components',
    pillar: 'components',
    priority: 'P1',
    difficulty: 'BEGINNER',
    durationMin: 20,
    frequency: 0.88,
    weight: 0.90,
    trend: 'STABLE',
    description: 'Edge points of presence (PoPs), origin shielding, cache-control headers, and stale-while-revalidate.',
    rubricAtoms: ['origin shielding', 'stale while revalidate', 'edge pop distribution', 'cache purge invalidation'],
    prerequisites: ['load-balancers-traffic'],
    foundedOn: ['networking-protocols'],
    questions: [
      {
        id: 'q_cmp003_01',
        title: 'Origin Shielding & Stampede Protection at the Edge',
        difficulty: 'INTERMEDIATE',
        learningLevel: 'L2',
        archetype: 'mechanism',
        prompt: 'In a global CDN with 200 edge PoPs, what happens when a viral image expires simultaneously across all edge nodes? How does an Origin Shield architecture protect the origin server?',
        rubricGuide: 'Must explain how an Origin Shield acts as a centralized regional caching tier between edge PoPs and the origin, collapsing 200 simultaneous cache misses into a single request.',
        rubricAtoms: ['origin shield', 'cache miss collapse', 'stampede protection'],
        hints: ['If 200 edge servers all ask the origin for image.png at the exact same second, how does a regional shield node intercept them?'],
        followUpProbes: ['How does stale-while-revalidate allow serving expired content while asynchronously fetching new data in the background?'],
        expectedKeywords: ['CDN', 'Origin Shield', 'Edge PoP', 'stale-while-revalidate', 'cache invalidation']
      }
    ]
  },
  {
    topicId: 'CMP004',
    slug: 'rate-limiting-admission-control',
    title: 'Rate Limiter, Throttling & Admission Control',
    categorySlug: 'traffic-management-components',
    pillar: 'components',
    priority: 'P1',
    difficulty: 'INTERMEDIATE',
    durationMin: 25,
    frequency: 0.95,
    weight: 0.95,
    trend: 'STABLE',
    description: 'Token Bucket, Leaky Bucket, Sliding Window Log vs Counter, and distributed Redis cluster atomic synchronization.',
    rubricAtoms: ['token bucket algorithm', 'sliding window counter', 'redis atomic lua', '429 too many requests'],
    prerequisites: ['api-gateway-reverse-proxy'],
    foundedOn: ['latency-throughput-slos'],
    questions: [
      {
        id: 'q_cmp004_01',
        title: 'Token Bucket vs Sliding Window Counter Algorithm',
        difficulty: 'INTERMEDIATE',
        learningLevel: 'L2',
        archetype: 'comparison',
        prompt: 'Compare the Token Bucket and Sliding Window Counter algorithms for rate limiting. Why does the Fixed Window algorithm suffer from boundary burst issues allowing double traffic?',
        rubricGuide: 'Must explain how fixed windows allow 100% quota at minute 0:59 and another 100% at 1:00 (2x burst in 2 seconds), and how token bucket or sliding window smooths the rate.',
        rubricAtoms: ['fixed window burst', 'sliding window counter', 'token bucket replenishment'],
        hints: ['What happens at the boundary of 11:59:59 PM and 12:00:00 AM?'],
        followUpProbes: ['How do you implement a distributed sliding window counter in Redis without creating race conditions?'],
        expectedKeywords: ['Token Bucket', 'Sliding Window', 'Fixed Window', 'boundary burst', 'Redis', '429']
      }
    ]
  },

  // 2.2 Database & Storage Components
  {
    topicId: 'CMP005',
    slug: 'database-indexing-optimization',
    title: 'Database Indexing & Query Optimization',
    categorySlug: 'database-storage-components',
    pillar: 'components',
    priority: 'P1',
    difficulty: 'INTERMEDIATE',
    durationMin: 20,
    frequency: 0.92,
    weight: 0.95,
    trend: 'STABLE',
    description: 'B+ Tree structure, composite index column ordering, covering index index-only scans, and write amplification.',
    rubricAtoms: ['b+ tree leaf nodes', 'leftmost prefix rule', 'covering index', 'write penalty of indexes'],
    prerequisites: ['sql-vs-nosql-modeling'],
    foundedOn: ['acid-transactions-consistency'],
    questions: [
      {
        id: 'q_cmp005_01',
        title: 'Composite Index Column Ordering and Leftmost Prefix Rule',
        difficulty: 'INTERMEDIATE',
        learningLevel: 'L3',
        archetype: 'mechanism',
        prompt: 'You have a table with 50M rows and create a composite index on (tenant_id, status, created_at). Why does a query filtering on (tenant_id, created_at) fail to utilize the full index?',
        rubricGuide: 'Must explain the leftmost prefix rule in B+ trees, column range boundary scanning, and why skipping the status column prevents a direct range seek on created_at.',
        rubricAtoms: ['leftmost prefix', 'b+ tree range seek', 'composite index ordering'],
        hints: ['Think of a composite index like a multi-level phone book sorted by Last Name, First Name, City.'],
        followUpProbes: ['What is a Covering Index, and why does an Index-Only Scan eliminate random disk lookups on the heap table?'],
        expectedKeywords: ['composite index', 'leftmost prefix', 'B+ tree', 'range scan', 'covering index']
      }
    ]
  },
  {
    topicId: 'CMP006',
    slug: 'db-replication-sharding',
    title: 'Database Replication, Sharding & Partitioning',
    categorySlug: 'database-storage-components',
    pillar: 'components',
    priority: 'P1',
    difficulty: 'ADVANCED',
    durationMin: 25,
    frequency: 0.95,
    weight: 0.98,
    trend: 'STABLE',
    description: 'Primary-replica replication lag, horizontal sharding keys, virtual shards on hash rings, and cross-shard joins.',
    rubricAtoms: ['shard key selection', 'virtual shards consistent hashing', 'cross shard joins elimination', 'replication lag mitigation'],
    prerequisites: ['database-indexing-optimization'],
    foundedOn: ['cap-pacelc-theorems', 'consistency-models'],
    questions: [
      {
        id: 'q_cmp006_01',
        title: 'Choosing a Shard Key: Mitigating Hot-Spotting and Cross-Shard Joins',
        difficulty: 'ADVANCED',
        learningLevel: 'L4',
        archetype: 'architecture',
        prompt: 'Your single PostgreSQL database has reached write saturation. You decide to shard across 16 database clusters. What are the fatal pitfalls of choosing user_id vs tenant_id vs auto-increment id, and how do you handle cross-shard queries?',
        rubricGuide: 'Must explain auto-increment id causing 100% write hot-spotting on the newest shard, entity-group co-location under tenant_id, and denormalizing data to eliminate cross-shard joins.',
        rubricAtoms: ['hot spot shard key', 'entity co-location', 'denormalization for joins'],
        hints: ['What happens if a celebrity user with 10M followers is sharded purely on user_id?'],
        followUpProbes: ['How do virtual shards on a consistent hash ring allow rebalancing data when scaling from 16 to 32 nodes without moving 100% of rows?'],
        expectedKeywords: ['sharding', 'shard key', 'hot-spot', 'consistent hashing', 'virtual shards', 'cross-shard joins']
      }
    ]
  },
  {
    topicId: 'CMP007',
    slug: 'distributed-caching-redis',
    title: 'Distributed Caching: Redis & Memcached',
    categorySlug: 'database-storage-components',
    pillar: 'components',
    priority: 'P1',
    difficulty: 'INTERMEDIATE',
    durationMin: 25,
    frequency: 0.98,
    weight: 0.98,
    trend: 'STABLE',
    description: 'Cache-Aside, Write-Through, Cache Stampede (Thundering Herd), Bloom filters for penetration, and LRU eviction.',
    rubricAtoms: ['cache aside pattern', 'thundering herd mutex', 'bloom filter penetration', 'lru eviction memory'],
    prerequisites: ['database-indexing-optimization'],
    foundedOn: ['cap-pacelc-theorems'],
    questions: [
      {
        id: 'q_cmp007_01',
        title: 'Cache Stampede (Thundering Herd) Mitigation Strategies',
        difficulty: 'INTERMEDIATE',
        learningLevel: 'L3',
        archetype: 'scenario-based',
        prompt: 'A viral news headline is cached in Redis with a 5-minute TTL. At minute 5:00, the key expires. 50,000 concurrent requests arrive simultaneously and all miss the cache, crashing the primary SQL database. How do you prevent this Cache Stampede?',
        rubricGuide: 'Must explain Mutex Locking (single worker queries DB while others wait), Probabilistic Early Recomputation (XFetch algorithm), or Background Periodic Refresh with no explicit TTL expiration.',
        rubricAtoms: ['mutex lock on cache miss', 'xfetch probabilistic early recompute', 'background warming'],
        hints: ['Can you recalculate the cache entry 30 seconds before it officially expires?'],
        followUpProbes: ['What is Cache Penetration, and how does a Bloom filter reject queries for non-existent IDs before touching Redis or the database?'],
        expectedKeywords: ['Cache Stampede', 'Thundering Herd', 'mutex', 'XFetch', 'Bloom filter', 'TTL']
      }
    ]
  },
  {
    topicId: 'CMP008',
    slug: 'storage-engines-lsm-trees',
    title: 'Storage Engines: B-Trees vs LSM-Trees',
    categorySlug: 'database-storage-components',
    pillar: 'components',
    priority: 'P2',
    difficulty: 'ADVANCED',
    durationMin: 25,
    frequency: 0.80,
    weight: 0.85,
    trend: 'STABLE',
    description: 'Write amplification, sequential vs random I/O, Memtables, Write-Ahead Logs (WAL), and SSTable compaction (RocksDB/Cassandra).',
    rubricAtoms: ['write amplification', 'sstable compaction', 'sequential disk io', 'b+ tree random writes'],
    prerequisites: ['database-indexing-optimization'],
    foundedOn: ['acid-transactions-consistency'],
    questions: [
      {
        id: 'q_cmp008_01',
        title: 'LSM-Trees vs B-Trees for High-Write Throughput',
        difficulty: 'ADVANCED',
        learningLevel: 'L4',
        archetype: 'mechanism',
        prompt: 'Why do write-heavy databases like Cassandra and RocksDB use Log-Structured Merge (LSM) Trees instead of traditional B+ Trees like PostgreSQL and MySQL InnoDB? What is the read penalty?',
        rubricGuide: 'Must explain append-only sequential writes to WAL and in-memory Memtable converting random writes into sequential disk I/O. Contrast with SSTable multi-level compaction and read amplification requiring Bloom filters.',
        rubricAtoms: ['lsm-tree append only', 'memtable and sstable', 'compaction read penalty', 'b+ tree page in-place update'],
        hints: ['Why is sequential disk write 100x faster than random in-place page modification on both SSDs and HDDs?'],
        followUpProbes: ['What happens during major compaction storms in RocksDB when background disk I/O saturates application queries?'],
        expectedKeywords: ['LSM-Tree', 'B+ Tree', 'Memtable', 'SSTable', 'compaction', 'write amplification']
      }
    ]
  },

  // 2.3 Messaging & Event-Driven Components
  {
    topicId: 'CMP009',
    slug: 'kafka-event-streaming',
    title: 'Message Queues & Event Streaming: Kafka',
    categorySlug: 'messaging-event-driven-components',
    pillar: 'components',
    priority: 'P1',
    difficulty: 'ADVANCED',
    durationMin: 25,
    frequency: 0.95,
    weight: 0.98,
    trend: 'STABLE',
    description: 'Partition commit logs, consumer groups, offset management, message ordering, zero-copy OS sendfile, and backpressure.',
    rubricAtoms: ['partition commit log', 'consumer group rebalancing', 'zero copy sendfile', 'per partition ordering'],
    prerequisites: ['api-communication-fundamentals'],
    foundedOn: ['horizontal-vs-vertical-scaling'],
    questions: [
      {
        id: 'q_cmp009_01',
        title: 'Kafka Architecture: Partitions, Ordering, and High-Throughput Mechanics',
        difficulty: 'ADVANCED',
        learningLevel: 'L4',
        archetype: 'mechanism',
        prompt: 'How does Apache Kafka guarantee high throughput of millions of messages per second while preserving strict FIFO message ordering? What is the limitation on total concurrent consumer workers?',
        rubricGuide: 'Must explain partition-level sequential append-only disk logging, Linux page cache zero-copy OS sendfile(), and ordering guaranteed only within a partition. Explain that consumer concurrency is strictly capped by partition count.',
        rubricAtoms: ['ordering per partition', 'zero-copy sendfile', 'consumer group partition cap'],
        hints: ['Can two consumers in the same consumer group read from the same partition simultaneously?'],
        followUpProbes: ['What is the difference between RabbitMQ push-based AMQP queue broker and Kafka pull-based distributed log?'],
        expectedKeywords: ['Kafka', 'partitions', 'consumer groups', 'zero-copy', 'commit log', 'FIFO ordering']
      }
    ]
  },
  {
    topicId: 'CMP010',
    slug: 'event-driven-pub-sub',
    title: 'Event-Driven Architecture & Pub/Sub Brokers',
    categorySlug: 'messaging-event-driven-components',
    pillar: 'components',
    priority: 'P1',
    difficulty: 'INTERMEDIATE',
    durationMin: 20,
    frequency: 0.88,
    weight: 0.90,
    trend: 'STABLE',
    description: 'Event contracts, choreography vs orchestration, dead letter queues (DLQ), and schema evolution (Avro/Protobuf).',
    rubricAtoms: ['choreography vs orchestration', 'dead letter queues', 'schema registry backward compatibility', 'poison pill events'],
    prerequisites: ['kafka-event-streaming'],
    foundedOn: ['intro-system-design'],
    questions: [
      {
        id: 'q_cmp010_01',
        title: 'Event Choreography vs Event Orchestration',
        difficulty: 'INTERMEDIATE',
        learningLevel: 'L3',
        archetype: 'comparison',
        prompt: 'When building an asynchronous order processing pipeline (Order -> Payment -> Inventory -> Shipping), contrast Event Choreography (pub/sub events) with Event Orchestration (workflow coordinator).',
        rubricGuide: 'Must explain loose coupling and lack of central bottleneck in choreography vs difficulty of tracking global workflow state and cyclic dependencies. Contrast with explicit orchestrator monitoring state and compensations.',
        rubricAtoms: ['choreography loose coupling', 'orchestrator state machine', 'saga workflow visibility'],
        hints: ['If a payment succeeds but inventory fails, who triggers the refund in choreography vs orchestration?'],
        followUpProbes: ['How do you handle schema evolution when an event producer adds a new mandatory field to Kafka?'],
        expectedKeywords: ['Choreography', 'Orchestration', 'Pub/Sub', 'Saga', 'Dead Letter Queue', 'schema evolution']
      }
    ]
  },
  {
    topicId: 'CMP011',
    slug: 'transactional-outbox-cdc',
    title: 'Transactional Outbox, CDC & Idempotent Consumers',
    categorySlug: 'messaging-event-driven-components',
    pillar: 'components',
    priority: 'P1',
    difficulty: 'ADVANCED',
    durationMin: 25,
    frequency: 0.92,
    weight: 0.95,
    trend: 'STABLE',
    description: 'The dual-write problem, transactional outbox tables, Change Data Capture (Debezium), and at-least-once deduplication.',
    rubricAtoms: ['dual write failure', 'transactional outbox table', 'change data capture debezium', 'idempotency key deduplication'],
    prerequisites: ['kafka-event-streaming'],
    foundedOn: ['acid-transactions-consistency'],
    questions: [
      {
        id: 'q_cmp011_01',
        title: 'Solving the Dual-Write Problem with the Transactional Outbox Pattern',
        difficulty: 'ADVANCED',
        learningLevel: 'L4',
        archetype: 'scenario-based',
        prompt: 'In a microservice, updating a relational database and publishing a message to Kafka cannot happen in a single ACID transaction. What goes wrong if you save to the DB first and Kafka crashes? How does the Transactional Outbox pattern solve this?',
        rubricGuide: 'Must articulate the dual-write inconsistency where DB succeeds but Kafka fails (or vice versa). Explain writing the business entity and the outgoing event atomically into the same database transaction (Outbox table), and using Debezium CDC to relay to Kafka.',
        rubricAtoms: ['dual write inconsistency', 'transactional outbox table', 'change data capture relay'],
        hints: ['Can you commit a database transaction and a network Kafka write in one atomic CPU operation?'],
        followUpProbes: ['How must the downstream consumer protect against duplicate messages produced by the Outbox replay worker?'],
        expectedKeywords: ['dual-write', 'Transactional Outbox', 'Change Data Capture', 'Debezium', 'idempotency', 'WAL']
      }
    ]
  },

  // 2.4 Distributed Coordination Components
  {
    topicId: 'CMP012',
    slug: 'distributed-locks-fencing',
    title: 'Distributed Locks & Fencing Tokens',
    categorySlug: 'distributed-coordination-components',
    pillar: 'components',
    priority: 'P2',
    difficulty: 'ADVANCED',
    durationMin: 25,
    frequency: 0.82,
    weight: 0.88,
    trend: 'STABLE',
    description: 'Redis Redlock vs ZooKeeper ephemeral sequential nodes, lock lease expiration, and Martin Kleppmann fencing tokens.',
    rubricAtoms: ['redlock lease expiry', 'fencing tokens monotonically increasing', 'gc pause clock drift', 'zookeeper ephemeral znode'],
    prerequisites: ['distributed-caching-redis'],
    foundedOn: ['cap-pacelc-theorems'],
    questions: [
      {
        id: 'q_cmp012_01',
        title: 'Distributed Locks and the GC Pause Race Condition (Fencing Tokens)',
        difficulty: 'ADVANCED',
        learningLevel: 'L4',
        archetype: 'failure-analysis',
        prompt: 'Client 1 acquires a distributed lock in Redis with a 10-second TTL. Immediately after, Client 1 experiences a 15-second "Stop-the-World" JVM Garbage Collection pause. Redis expires the lock and grants it to Client 2. Client 1 wakes up and writes to storage. How do Fencing Tokens prevent data corruption?',
        rubricGuide: 'Must explain that distributed locks cannot guarantee mutual exclusion without fencing tokens. Explain monotonically increasing token numbers verified by the storage layer (rejecting writes with token < highest_seen_token).',
        rubricAtoms: ['gc pause lock expiry', 'fencing token monotonicity', 'storage side validation'],
        hints: ['Can the locking service enforce that Client 1 stops writing if Client 1 is frozen in CPU memory?'],
        followUpProbes: ['Why do consensus-backed systems like ZooKeeper or etcd provide stronger lock safety than Redis Redlock?'],
        expectedKeywords: ['distributed lock', 'Fencing Token', 'GC pause', 'Redlock', 'ZooKeeper', 'lease expiration']
      }
    ]
  },
  {
    topicId: 'CMP013',
    slug: 'leader-election-raft',
    title: 'Leader Election & Consensus (Raft / Paxos)',
    categorySlug: 'distributed-coordination-components',
    pillar: 'components',
    priority: 'P2',
    difficulty: 'ADVANCED',
    durationMin: 25,
    frequency: 0.80,
    weight: 0.85,
    trend: 'STABLE',
    description: 'Raft consensus states (Follower, Candidate, Leader), term numbers, randomized election timeouts, and log matching quorums.',
    rubricAtoms: ['raft leader election', 'quorum majority write', 'randomized election timeout', 'split brain prevention'],
    prerequisites: ['distributed-locks-fencing'],
    foundedOn: ['cap-pacelc-theorems'],
    questions: [
      {
        id: 'q_cmp013_01',
        title: 'Raft Leader Election and Split-Brain Prevention',
        difficulty: 'ADVANCED',
        learningLevel: 'L4',
        archetype: 'mechanism',
        prompt: 'In a 5-node Raft consensus cluster, a network partition isolates 2 nodes on side A and 3 nodes on side B. Can side A elect a leader? How does Raft guarantee that only one leader can commit logs across cluster splits?',
        rubricGuide: 'Must explain that electing a leader and committing logs requires a strict majority quorum ((N/2) + 1 = 3 nodes for N=5). Side A has only 2 nodes and cannot achieve quorum, preventing split-brain.',
        rubricAtoms: ['majority quorum requirement', 'split brain prevention', 'raft term number'],
        hints: ['What is 5 / 2 rounded down plus 1? Can two disjoint groups both hold 3 nodes out of 5?'],
        followUpProbes: ['How do randomized election timeouts prevent perpetual split votes among competing candidates?'],
        expectedKeywords: ['Raft', 'leader election', 'quorum', 'split-brain', 'majority', 'consensus']
      }
    ]
  },
  {
    topicId: 'CMP014',
    slug: 'service-discovery-health',
    title: 'Service Discovery & Health Checking',
    categorySlug: 'distributed-coordination-components',
    pillar: 'components',
    priority: 'P1',
    difficulty: 'INTERMEDIATE',
    durationMin: 20,
    frequency: 0.85,
    weight: 0.88,
    trend: 'STABLE',
    description: 'Client-side discovery (Eureka/Consul) vs Server-side discovery (Kubernetes CoreDNS), and liveness vs readiness probes.',
    rubricAtoms: ['client vs server side discovery', 'liveness vs readiness probes', 'ephemeral container ips', 'consul gossip protocol'],
    prerequisites: ['load-balancers-traffic'],
    foundedOn: ['intro-system-design'],
    questions: [
      {
        id: 'q_cmp014_01',
        title: 'Kubernetes Liveness vs Readiness Probes and Cascading Restarts',
        difficulty: 'INTERMEDIATE',
        learningLevel: 'L3',
        archetype: 'troubleshooting',
        prompt: 'A microservice is temporarily overloaded with heavy traffic and its p99 latency spikes. A poorly configured Liveness probe fails and Kubernetes kills the container. The remaining pods receive more traffic and their liveness probes fail too. How do Readiness probes prevent this cascading failure?',
        rubricGuide: 'Must explain that Liveness kills the container process, while Readiness only removes the pod from load balancer traffic routing until it recovers. Overloaded services should fail Readiness, not Liveness.',
        rubricAtoms: ['liveness vs readiness', 'cascading pod restarts', 'traffic removal vs process termination'],
        hints: ['If a server is busy processing a queue, is the process dead or just busy?'],
        followUpProbes: ['How does client-side service discovery with local caching prevent the service registry from becoming a single point of failure?'],
        expectedKeywords: ['Liveness', 'Readiness', 'Kubernetes', 'service discovery', 'cascading failure']
      }
    ]
  },
  {
    topicId: 'CMP017',
    slug: 'gossip-protocols-membership',
    title: 'Gossip Protocols, Cluster Membership & Failure Detection',
    categorySlug: 'distributed-coordination-components',
    pillar: 'components',
    priority: 'P2',
    difficulty: 'ADVANCED',
    durationMin: 20,
    frequency: 0.82,
    weight: 0.88,
    trend: 'RISING',
    description: 'Decentralized cluster membership, SWIM protocol, indirect ping probing, failure detection vs suspicion mechanism, and Phi-accrual failure detectors.',
    rubricAtoms: ['swim protocol indirect probing', 'phi accrual failure detector', 'suspicion state transition', 'epidemic dissemination bounds'],
    prerequisites: ['service-discovery-health'],
    foundedOn: ['service-discovery-health', 'distributed-clocks-ordering'],
    questions: [
      {
        id: 'q_cmp017_01',
        title: 'SWIM Protocol: Indirect Probing and False-Positive Failure Prevention',
        difficulty: 'ADVANCED',
        learningLevel: 'L4',
        archetype: 'mechanism',
        prompt: 'In a 1,000-node Cassandra or Consul cluster, traditional point-to-point heartbeats generate O(N^2) network packets. How does the SWIM (Structured Weakly-Consistent Infection-Style Membership) protocol achieve O(1) message overhead per node while using indirect probing and suspicion mechanisms to prevent false-positive failure declarations due to transient packet drops?',
        rubricGuide: 'Candidate must explain: 1) Node A sends direct ping to randomly selected Node B; 2) If Node B does not respond within timeout, Node A selects k random members and asks them to ping Node B indirectly (Ping-Req); 3) If indirect probes also fail, Node B is not immediately marked DEAD; it transitions to SUSPECT state with an incarnation/epoch number; 4) If Node B is alive, it refutes the suspicion by bumping its incarnation number; 5) Only after a suspicion timeout expires without refutation is Node B declared DEAD and evicted via gossip dissemination.',
        rubricAtoms: ['swim protocol o1 message overhead', 'indirect ping req mechanism', 'suspicion state incarnation bump', 'elimination of false positives'],
        hints: ['Why should a node not be immediately declared dead if a single direct ping times out over a congested network switch?'],
        followUpProbes: ['How does the Phi-Accrual failure detector (used in Akka and Cassandra) output a continuous suspicion probability rather than a binary up/down state?'],
        expectedKeywords: ['SWIM', 'gossip', 'indirect probe', 'Ping-Req', 'suspicion', 'incarnation number', 'Phi-accrual', 'Cassandra', 'Consul']
      }
    ]
  },

  // 2.5 Reliability & Resilience Patterns
  {
    topicId: 'CMP015',
    slug: 'circuit-breaker-bulkhead',
    title: 'Circuit Breakers, Retries, Jitter & Bulkheads',
    categorySlug: 'reliability-resilience-patterns',
    pillar: 'components',
    priority: 'P1',
    difficulty: 'INTERMEDIATE',
    durationMin: 20,
    frequency: 0.90,
    weight: 0.92,
    trend: 'STABLE',
    description: 'Closed, Open, Half-Open state transitions, exponential backoff with full jitter, and thread pool bulkhead isolation.',
    rubricAtoms: ['circuit breaker state machine', 'exponential backoff with jitter', 'bulkhead isolation threadpool', 'cascading failure prevention'],
    prerequisites: ['api-communication-fundamentals'],
    foundedOn: ['latency-throughput-slos'],
    questions: [
      {
        id: 'q_cmp015_01',
        title: 'Circuit Breaker State Machine & Exponential Backoff with Jitter',
        difficulty: 'INTERMEDIATE',
        learningLevel: 'L3',
        archetype: 'mechanism',
        prompt: 'Walk through the 3 states of a Circuit Breaker (Closed, Open, Half-Open). Why is adding randomized Jitter to exponential backoff retries critical to avoid thundering herd storms on a recovering downstream service?',
        rubricGuide: 'Must explain failure threshold opening circuit, immediate fallback responses without downstream calls, half-open trial requests, and jitter preventing all retry clients from hammering the service in lockstep.',
        rubricAtoms: ['circuit breaker states', 'retry storm avoidance', 'jitter synchronization breakup'],
        hints: ['If 1000 clients all retry after exactly 2.0s, 4.0s, 8.0s, what hits the database on every retry wave?'],
        followUpProbes: ['How does Bulkhead Isolation prevent a slow third-party payment API from exhausting the entire web server thread pool?'],
        expectedKeywords: ['Circuit Breaker', 'Closed', 'Open', 'Half-Open', 'exponential backoff', 'jitter', 'Bulkhead']
      }
    ]
  },
  {
    topicId: 'CMP016',
    slug: 'saga-pattern-cqrs',
    title: 'Distributed Transactions, Saga & CQRS Patterns',
    categorySlug: 'reliability-resilience-patterns',
    pillar: 'components',
    priority: 'P2',
    difficulty: 'ADVANCED',
    durationMin: 25,
    frequency: 0.85,
    weight: 0.90,
    trend: 'STABLE',
    description: 'Choreographed vs Orchestrated Sagas, compensating transactions, CQRS read/write models, and materialized views.',
    rubricAtoms: ['compensating transactions', 'orchestrated saga state', 'command query separation', 'materialized read projection'],
    prerequisites: ['transactional-outbox-cdc'],
    foundedOn: ['acid-transactions-consistency'],
    questions: [
      {
        id: 'q_cmp016_01',
        title: 'The Saga Pattern: Handling Partial Failures Across Microservices',
        difficulty: 'ADVANCED',
        learningLevel: 'L4',
        archetype: 'architecture',
        prompt: 'A user books a vacation package requiring Hotel, Flight, and Car Rental services. The Hotel and Flight reservations succeed, but Car Rental fails due to no availability. Why is 2-Phase Commit (2PC) avoided in microservices, and how does a Saga execute compensating transactions?',
        rubricGuide: 'Must explain 2PC blocking locks and availability bottlenecks across services. Explain how a Saga executes forward local transactions and, upon failure, triggers backward compensating transactions (canceling hotel and flight).',
        rubricAtoms: ['2pc blocking locks', 'compensating transactions backward', 'saga orchestrator state machine'],
        hints: ['Can you roll back a flight ticket reservation that already committed to the airline database without sending a cancel API call?'],
        followUpProbes: ['What is the semantic difference between Command Query Responsibility Segregation (CQRS) and standard Read Replicas?'],
        expectedKeywords: ['Saga', '2PC', 'compensating transaction', 'CQRS', 'eventual consistency', 'orchestrator']
      }
    ]
  }
];

