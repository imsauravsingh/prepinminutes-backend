export interface CategorySeed {
  slug: string;
  name: string;
  description: string;
  pillar: 'principles' | 'components' | 'case-studies';
  sortOrder: number;
}

export const SYSTEM_DESIGN_CATEGORIES: CategorySeed[] = [
  // Pillar 1: Fundamentals & Principles
  {
    slug: 'system-design-foundations',
    name: 'System Design Foundations',
    description: 'System boundaries, requirements scoping, architectural diagrams, and service decomposition.',
    pillar: 'principles',
    sortOrder: 1
  },
  {
    slug: 'networking-fundamentals',
    name: 'Networking & Communication Fundamentals',
    description: 'Network protocols, connection handshakes, request lifecycles, and API communication semantics.',
    pillar: 'principles',
    sortOrder: 2
  },
  {
    slug: 'database-fundamentals',
    name: 'Database Fundamentals',
    description: 'Data models, relational vs NoSQL access patterns, ACID guarantees, and transaction isolation.',
    pillar: 'principles',
    sortOrder: 3
  },
  {
    slug: 'scalability-performance-principles',
    name: 'Scalability & Performance Principles',
    description: 'Horizontal vs vertical scaling, stateless service architectures, and latency percentiles (p95/p99).',
    pillar: 'principles',
    sortOrder: 4
  },
  {
    slug: 'distributed-systems-principles',
    name: 'Distributed Systems Principles',
    description: 'CAP/PACELC trade-offs, consistency models, logical clocks, and partial network failure modes.',
    pillar: 'principles',
    sortOrder: 5
  },

  // Pillar 2: Components & Patterns
  {
    slug: 'traffic-management-components',
    name: 'Traffic Management & Networking Components',
    description: 'Load balancing, API reverse proxies, CDN edge caching, and distributed admission control rate limiters.',
    pillar: 'components',
    sortOrder: 6
  },
  {
    slug: 'database-storage-components',
    name: 'Database & Storage Components',
    description: 'Database index structures, primary-replica replication, sharding, and in-memory distributed caches.',
    pillar: 'components',
    sortOrder: 7
  },
  {
    slug: 'messaging-event-driven-components',
    name: 'Messaging & Event-Driven Components',
    description: 'High-throughput event logs (Kafka), pub/sub messaging brokers, and the transactional outbox pattern.',
    pillar: 'components',
    sortOrder: 8
  },
  {
    slug: 'distributed-coordination-components',
    name: 'Distributed Coordination Components',
    description: 'Distributed locking leases, leader election consensus (Raft), and dynamic service discovery registries.',
    pillar: 'components',
    sortOrder: 9
  },
  {
    slug: 'reliability-resilience-patterns',
    name: 'Reliability & Resilience Patterns',
    description: 'Circuit breakers, exponential backoff retries, thread bulkheads, and Saga distributed workflows.',
    pillar: 'components',
    sortOrder: 10
  },

  // Pillar 3: Problems & Case Studies
  {
    slug: 'basic-application-design',
    name: 'Basic Application Design',
    description: 'High-signal fundamental systems: URL shorteners, pastebins, and multi-part blob upload services.',
    pillar: 'case-studies',
    sortOrder: 11
  },
  {
    slug: 'communication-systems',
    name: 'Communication & Media Systems',
    description: 'Real-time duplex chat, multi-channel notification fan-out, email delivery, and WebRTC video conferencing.',
    pillar: 'case-studies',
    sortOrder: 12
  },
  {
    slug: 'commerce-transaction-systems',
    name: 'Commerce & Financial Systems',
    description: 'E-commerce catalogs, double-entry financial ledgers, flash ticket booking, and real-time fraud engines.',
    pillar: 'case-studies',
    sortOrder: 13
  },
  {
    slug: 'social-content-platforms',
    name: 'Social & Content Platforms',
    description: 'Fan-out timeline news feeds, distributed search engine crawlers, and trie autocomplete suggestion engines.',
    pillar: 'case-studies',
    sortOrder: 14
  },
  {
    slug: 'media-location-systems',
    name: 'Streaming, Media & Location Systems',
    description: 'Chunked adaptive video streaming, geospatial ride-sharing dispatch, and real-time gaming leaderboards.',
    pillar: 'case-studies',
    sortOrder: 15
  },
  {
    slug: 'distributed-infrastructure-systems',
    name: 'Distributed Infrastructure & Storage Systems',
    description: 'Distributed Dynamo key-value stores, Prometheus telemetry ingest, file sync, and collaborative editors.',
    pillar: 'case-studies',
    sortOrder: 16
  }
];

