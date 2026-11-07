# System Design Domain Curriculum & Taxonomy Specification
## Classical Distributed Systems Master Catalog (62 Topics, 17 Categories, 1,240 Questions)

**Domain Slug:** `system-design`  
**Domain Name:** `System Design`  
**Version:** 5.1 (Incremental Quality Release)  
**Target Database:** Neo4j AuraDB Knowledge Graph  
**Structure:** 3 Learning Pillars (Principles, Components, Case Studies)  
**Total Categories:** 17  
**Total Topics:** 62  
**Priority Distribution:** **P0: 24 Core Must-Master | P1: 24 High-Frequency/Senior | P2: 14 Specialized/Staff+**  
**Questions per Topic:** 20 (4 Beginner, 6 Intermediate, 6 Advanced, 4 Expert)  
**Total Master Question Inventory:** **1,240 Questions**  
**Governing Standard:** [`docs/SYSTEM_DESIGN_CURRICULUM_EXCELLENCE_STANDARD.md`](../SYSTEM_DESIGN_CURRICULUM_EXCELLENCE_STANDARD.md)  
**Status:** 🟢 **CURRICULUM SPECIFICATION FROZEN — v5.1 COMPLETE RELEASE**

---

## 1. High-Level Architecture Overview

System Design focuses strictly on **timeless, durable distributed systems engineering**, while generative AI and model infrastructure is isolated in the dedicated [`ai-system-design.md`](./ai-system-design.md) domain:

```mermaid
flowchart TD
    DOMAIN["Domain: System Design (system-design)"]

    subgraph D1 ["Pillar 1: Fundamentals & Principles (21 Topics | 420 Qs)"]
        C1_1["1.1 System Design Foundations (4)"]
        C1_2["1.2 Networking & Communication (3)"]
        C1_3["1.3 Storage & Database Fundamentals (4)"]
        C1_4["1.4 Scalability & Performance (3)"]
        C1_5["1.5 Distributed Systems Principles (4)"]
        C1_6["1.6 Security in System Design (3)"]
    end

    subgraph D2 ["Pillar 2: Components & Patterns (17 Topics | 340 Qs)"]
        C2_1["2.1 Traffic Management & Networking (4)"]
        C2_2["2.2 Database & Storage Components (4)"]
        C2_3["2.3 Messaging & Event-Driven (3)"]
        C2_4["2.4 Distributed Coordination (4)"]
        C2_5["2.5 Reliability & Resilience Patterns (2)"]
    end

    subgraph D3 ["Pillar 3: Problems & Case Studies (24 Topics | 480 Qs)"]
        C3_1["3.1 Basic Application Design (3)"]
        C3_2["3.2 Communication & Media Systems (5)"]
        C3_3["3.3 Commerce & Financial Systems (4)"]
        C3_4["3.4 Social & Content Platforms (3)"]
        C3_5["3.5 Streaming, Media & Location (3)"]
        C3_6["3.6 Distributed Infrastructure & Storage (6)"]
    end

    DOMAIN --> D1
    DOMAIN --> D2
    DOMAIN --> D3

    D3 -.->|"[:USES_COMPONENT]"| D2
    D2 -.->|"[:FOUNDED_ON]"| D1
```

---

## 2. The 8-Layer Topic Depth Standard

Every topic in the curriculum is authored and evaluated against an **8-Layer Depth Specification**, ensuring that prep progresses from conceptual clarity to battle-tested architectural defense:

```mermaid
flowchart LR
    L1["1. Fundamentals"] --> L2["2. Mechanics"]
    L2 --> L3["3. Architecture"]
    L3 --> L4["4. Failure Scenarios"]
    L4 --> L5["5. Quantitative Sizing"]
    L5 --> L6["6. Trade-Offs"]
    L6 --> L7["7. Production Ops"]
    L7 --> L8["8. Architectural Defense"]
```

| Layer | Focus Area | What the Candidate Must Demonstrate |
| :---: | :--- | :--- |
| **1** | **Fundamentals** | Clear definitions, core motivations, terminology, and component mental model. |
| **2** | **Internal Mechanics** | Algorithms, data structures (e.g., skip lists, B+ trees, SSTables), and network wire protocols. |
| **3** | **Architecture & Data Flow** | Component boundaries, synchronous vs async communication paths, and API schema contracts. |
| **4** | **Failure Scenarios** | Gray failures, node crashes, network splits, asymmetric partitions, split-brain, and recovery procedures. |
| **5** | **Quantitative Engineering** | Back-of-the-envelope capacity estimations (QPS, IOPS, memory, bandwidth, RPO/RTO, and quorum overlap math). |
| **6** | **Trade-Off Analysis** | CAP/PACELC theorem evaluations, consistency vs latency budgets, and technology selection justifications. |
| **7** | **Production Engineering** | Golden signals observability, zero-downtime deployments, schema evolution, and backpressure shedding. |
| **8** | **Architectural Defense** | Defending system designs before Principal Review Boards, balancing business cost (TCO) vs SLA risk. |

---

## 3. Decoupling Readiness from Topic Count

Candidate readiness is evaluated across four distinct dimensions:
$$\text{Readiness Score} = f(\text{Topic}, \text{Depth Layer}, \text{Experience Level}, \text{Scenario Complexity})$$

| Career Level | Target Learning Level | Expected Depth Capability |
| :--- | :---: | :--- |
| **Fresher / Junior** | **L1 – L2** | Explain fundamentals (Layers 1–3), define system boundaries, calculate basic QPS, use standard tools. |
| **Mid-Level** | **L2 – L3** | Design complete components (Layers 1–5), choose appropriate databases/caches, handle timeouts and retries. |
| **Senior** | **L3 – L4** | Lead complex system designs (Layers 4–7), analyze split-brain risk, tune p99 latency, design multi-AZ failovers. |
| **Staff / Principal / Architect**| **L4 – L5** | Platform-wide correctness (Layers 6–8), multi-region active-active, formal failure proofs, TCO, operational risk. |

---

## 4. Master Category & Topic Catalog (62 Topics)

---

### Pillar 1: Fundamentals & Principles (21 Topics | 420 Questions)

#### Category 1.1: System Design Foundations (`system-design-foundations`)
| Topic ID | Topic Title | Slug | Priority | Prerequisites | Core Coverage & 8-Layer Focus |
| :---: | :--- | :--- | :---: | :--- | :--- |
| `FND001` | **Intro to System Design & Architectural Thinking** | `intro-system-design` | **P0** | None | System boundaries, component abstraction, requirement scoping, architectural block diagrams |
| `FND002` | **Functional & Non-Functional Requirements** | `requirements-engineering` | **P0** | `intro-system-design` | Use cases, SLOs/SLAs, latency percentiles (p50/p95/p99), throughput, availability calculations |
| `FND003` | **Architecture Styles: Monolith to Microservices** | `monolith-to-microservices` | **P1** | `intro-system-design` | Service boundaries, coupling, modular monoliths, decomposition, multi-tenant noisy neighbor isolation |
| `FND021` | **System Design Trade-offs & Technology Selection Framework** | `tradeoffs-technology-selection` | **P0** | `requirements-engineering` | The Scaling Decision Matrix: when to cache vs queue vs replicate vs shard; Build vs Buy; TCO evaluation |

#### Category 1.2: Networking & Communication Fundamentals (`networking-fundamentals`)
| Topic ID | Topic Title | Slug | Priority | Prerequisites | Core Coverage & 8-Layer Focus |
| :---: | :--- | :--- | :---: | :--- | :--- |
| `FND004` | **HTTP, HTTPS, TCP, UDP, DNS & TLS** | `networking-protocols` | **P0** | `intro-system-design` | Request lifecycle, TCP 3-way handshake, DNS hierarchy, TLS termination, socket buffers |
| `FND005` | **REST, GraphQL, gRPC, WebSockets & API Protocols** | `api-communication-fundamentals` | **P1** | `networking-protocols` | Synchronous REST vs GraphQL vs Protobuf binary gRPC, Server-Sent Events, WebSockets, DataLoader N+1 |
| `FND020` | **Data Serialization, Binary Formats & Schema Evolution** | `data-serialization-schema` | **P2** | `api-communication-fundamentals` | JSON vs Protobuf vs Avro vs MessagePack, compact wire encoding, Schema Registries, compatibility rules |

#### Category 1.3: Storage & Database Fundamentals (`database-fundamentals`)
| Topic ID | Topic Title | Slug | Priority | Prerequisites | Core Coverage & 8-Layer Focus |
| :---: | :--- | :--- | :---: | :--- | :--- |
| `FND006` | **Relational vs NoSQL & Access Patterns** | `sql-vs-nosql-modeling` | **P0** | `intro-system-design` | Document, key-value, wide-column, relational schema trade-offs, access pattern mapping |
| `FND007` | **ACID Properties, Isolation & Transactions** | `acid-transactions-consistency` | **P1** | `sql-vs-nosql-modeling` | Read committed, snapshot isolation, serializability, write skew, 2PC blocking nature |
| `FND017` | **Storage Systems: Block, File & Object Storage Architecture** | `block-file-object-storage` | **P1** | `intro-system-design` | Block Storage (EBS, NVMe) vs File Storage (NFS, EFS) vs Object Storage (S3, Ceph); IOPS vs throughput |
| `FND018` | **Distributed SQL & NewSQL Architecture** | `distributed-newsql-databases` | **P2** | `sql-vs-nosql-modeling`, `acid-transactions-consistency` | Spanner, CockroachDB, TiDB; distributed ACID transactions; Raft/Paxos-replicated range tablets |

#### Category 1.4: Scalability & Performance Principles (`scalability-performance-principles`)
| Topic ID | Topic Title | Slug | Priority | Prerequisites | Core Coverage & 8-Layer Focus |
| :---: | :--- | :--- | :---: | :--- | :--- |
| `FND008` | **Horizontal vs Vertical Scaling & Stateless Services** | `horizontal-vs-vertical-scaling` | **P0** | `intro-system-design` | Shared-nothing architecture, state externalization, auto-scaling thresholds, session offloading |
| `FND009` | **Latency, Throughput, Capacity Planning & SLOs** | `latency-throughput-slos` | **P1** | `requirements-engineering` | Bandwidth calculations, back-of-envelope estimation, tail latency, RPO/RTO durability budgets |
| `FND019` | **OS & Execution Primitives: Processes, Threads, Concurrency & Memory** | `os-concurrency-primitives` | **P1** | `intro-system-design` | Thread-per-request vs Event loop vs Goroutines; Mutex/CAS/Semaphores; OS Page Cache; epoll io_uring; GC pauses |

#### Category 1.5: Distributed Systems Principles (`distributed-systems-principles`)
| Topic ID | Topic Title | Slug | Priority | Prerequisites | Core Coverage & 8-Layer Focus |
| :---: | :--- | :--- | :---: | :--- | :--- |
| `FND010` | **CAP & PACELC Theorems in Practice** | `cap-pacelc-theorems` | **P0** | `latency-throughput-slos` | Partitions behaviour, CP vs AP trade-offs, latency vs consistency during normal operations |
| `FND011` | **Consistency Models: Strong to Eventual** | `consistency-models` | **P1** | `cap-pacelc-theorems` | Linearizability, sequential consistency, causal consistency, read-your-writes, monotonic reads |
| `FND012` | **Distributed Time, Ordering & Failure Models** | `distributed-clocks-ordering` | **P1** | `consistency-models` | Lamport clocks, vector clocks, NTP skew, Google Spanner TrueTime commit-wait, crash-stop vs crash-recovery |
| `FND013` | **Byzantine Fault Tolerance & Adversarial Systems** | `byzantine-fault-tolerance` | **P2** | `consistency-models` | Byzantine failure model, arbitrary node behavior, PBFT algorithm, $3f+1$ quorum math vs $2f+1$ CFT |

#### Category 1.6: Security in System Design (`security-fundamentals`)
| Topic ID | Topic Title | Slug | Priority | Prerequisites | Core Coverage & 8-Layer Focus |
| :---: | :--- | :--- | :---: | :--- | :--- |
| `FND014` | **Authentication, Authorization & Identity** | `authn-authz-identity` | **P0** | `api-communication-fundamentals` | OAuth 2.0 PKCE, OpenID Connect (OIDC), JWT stateless verification vs revocation blacklists, RBAC vs ABAC |
| `FND015` | **Data Security: Encryption, Key Management & Secure Protocols** | `encryption-data-security` | **P1** | `networking-protocols` | Symmetric (AES-256-GCM) vs Asymmetric (RSA/ECC), Envelope Encryption with Cloud KMS, TLS 1.3, mTLS Zero-Trust |
| `FND016` | **System Threat Modeling & Defense Strategies** | `threat-modeling-defense` | **P2** | `authn-authz-identity`, `encryption-data-security` | STRIDE threat modeling, Layer 7 DDoS WAF mitigation, SSRF/SQLi prevention, SBOM supply-chain artifact signing |

---

### Pillar 2: Components & Patterns (17 Topics | 340 Questions)

#### Category 2.1: Traffic Management & Networking Components (`traffic-management-components`)
| Topic ID | Topic Title | Slug | Priority | Prerequisites | Core Coverage & 8-Layer Focus |
| :---: | :--- | :--- | :---: | :--- | :--- |
| `CMP001` | **Load Balancers & Traffic Distribution** | `load-balancers-traffic` | **P0** | `networking-protocols` | L4 vs L7 balancing, consistent IP hashing, active/passive health probing, Anycast BGP |
| `CMP002` | **API Gateway & Reverse Proxy Architecture** | `api-gateway-reverse-proxy` | **P0** | `load-balancers-traffic` | Request routing, JWT validation offload, rate limiting, BFF pattern, TLS termination |
| `CMP003` | **CDN & Edge Caching Architecture** | `cdn-edge-caching` | **P1** | `networking-protocols` | Cache hierarchy, origin shielding, stale-while-revalidate, edge workers, byte-range requests |
| `CMP004` | **Rate Limiter, Throttling & Admission Control** | `rate-limiting-admission-control` | **P0** | `distributed-caching-redis` | Token bucket, sliding window log, Redis distributed counters, regional quotas, 429 semantics |

#### Category 2.2: Database & Storage Components (`database-storage-components`)
| Topic ID | Topic Title | Slug | Priority | Prerequisites | Core Coverage & 8-Layer Focus |
| :---: | :--- | :--- | :---: | :--- | :--- |
| `CMP005` | **Database Indexing & Query Optimization** | `database-indexing-optimization` | **P0** | `sql-vs-nosql-modeling` | B+ Trees, composite indexes, covering indexes, query plans, index fragmentation |
| `CMP006` | **Database Replication, Sharding & Partitioning** | `db-replication-sharding` | **P0** | `acid-transactions-consistency` | Primary-replica, read replicas, shard keys, virtual shards, connection pooling (PgBouncer), quorum linearizability races |
| `CMP007` | **Distributed Caching: Redis & Memcached** | `distributed-caching-redis` | **P0** | `horizontal-vs-vertical-scaling` | Cache-aside, write-through, stampede herd prevention, bloom filters, eviction, cross-region invalidation |
| `CMP008` | **Storage Engines: B-Trees vs LSM-Trees & WAL** | `storage-engines-lsm-trees` | **P2** | `database-indexing-optimization` | Write amplification, SSTables, memtable, compaction, WAL `fsync` bottleneck, group commit, PITR recovery |

#### Category 2.3: Messaging & Event-Driven Components (`messaging-event-driven-components`)
| Topic ID | Topic Title | Slug | Priority | Prerequisites | Core Coverage & 8-Layer Focus |
| :---: | :--- | :--- | :---: | :--- | :--- |
| `CMP009` | **Message Queues & Event Streaming: Kafka** | `kafka-event-streaming` | **P0** | `horizontal-vs-vertical-scaling` | Partitions, consumer groups, offsets, High Watermark vs LEO, leader epoch, `min.insync.replicas` |
| `CMP010` | **Event-Driven Architecture & Pub/Sub Brokers** | `event-driven-pub-sub` | **P1** | `kafka-event-streaming` | Event contracts, choreography vs orchestration, dead letter queues, schema evolution |
| `CMP011` | **Transactional Outbox, CDC & Idempotent Consumers** | `transactional-outbox-cdc` | **P1** | `acid-transactions-consistency` | Dual-write problem, Debezium CDC, idempotency keys, zero-downtime expand-contract migration |

#### Category 2.4: Distributed Coordination Components (`distributed-coordination-components`)
| Topic ID | Topic Title | Slug | Priority | Prerequisites | Core Coverage & 8-Layer Focus |
| :---: | :--- | :--- | :---: | :--- | :--- |
| `CMP012` | **Distributed Locks & Fencing Tokens** | `distributed-locks-fencing` | **P2** | `distributed-caching-redis` | Redis Redlock, ZooKeeper ephemeral nodes, lease expiry under GC pauses, fencing tokens |
| `CMP013` | **Leader Election & Consensus (Raft / Paxos)** | `leader-election-raft` | **P2** | `cap-pacelc-theorems` | Quorums, term numbers, log matching invariant, pre-vote phase, split-brain mitigation |
| `CMP014` | **Service Discovery & Health Checking** | `service-discovery-health` | **P1** | `load-balancers-traffic` | Service registries (Consul/Eureka), client vs server-side discovery, heartbeat health checks |
| `CMP017` | **Gossip Protocols, Cluster Membership & Failure Detection** | `gossip-protocols-membership` | **P2** | `service-discovery-health` | Decentralized membership, SWIM protocol, failure detection vs suspicion, indirect probing, $\Phi$-accrual |

#### Category 2.5: Reliability & Resilience Patterns (`reliability-resilience-patterns`)
| Topic ID | Topic Title | Slug | Priority | Prerequisites | Core Coverage & 8-Layer Focus |
| :---: | :--- | :--- | :---: | :--- | :--- |
| `CMP015` | **Circuit Breakers, Retries, Jitter & Bulkheads** | `circuit-breaker-bulkhead` | **P0** | `latency-throughput-slos` | State transitions, exponential backoff with jitter, retry amplification storms, load shedding, distributed tracing spans |
| `CMP016` | **Distributed Transactions, Saga & CQRS Patterns** | `saga-pattern-cqrs` | **P1** | `acid-transactions-consistency` | Compensating transactions, command/query separation, materialized read views, 2PC blocking recovery |

---

### Pillar 3: Problems & Case Studies (24 Topics | 480 Questions)

#### Category 3.1: Basic Application Design (`basic-application-design`)
| Topic ID | Problem Title | Slug | Priority | Used Components | Founded On Principles |
| :---: | :--- | :--- | :---: | :--- | :--- |
| `SYS001` | **Design a URL Shortener (TinyURL)** | `url-shortener` | **P0** | `load-balancers-traffic`, `distributed-caching-redis`, `rate-limiting-admission-control`, `db-replication-sharding` | `latency-throughput-slos`, `cap-pacelc-theorems`, `acid-transactions-consistency` |
| `SYS002` | **Design a Pastebin / Text Sharing Platform** | `pastebin-service` | **P1** | `cdn-edge-caching`, `distributed-caching-redis`, `rate-limiting-admission-control` | `latency-throughput-slos`, `horizontal-vs-vertical-scaling` |
| `SYS003` | **Design a File Upload & Storage Service (S3-like)** | `file-upload-storage` | **P1** | `cdn-edge-caching`, `distributed-caching-redis`, `api-gateway-reverse-proxy` | `latency-throughput-slos`, `acid-transactions-consistency` |

#### Category 3.2: Communication & Media Systems (`communication-systems`)
| Topic ID | Problem Title | Slug | Priority | Used Components | Founded On Principles |
| :---: | :--- | :--- | :---: | :--- | :--- |
| `SYS004` | **Design Real-Time Chat (WhatsApp / Slack)** | `realtime-chat-messaging` | **P0** | `api-gateway-reverse-proxy`, `distributed-caching-redis`, `kafka-event-streaming`, `storage-engines-lsm-trees` | `cap-pacelc-theorems`, `acid-transactions-consistency`, `distributed-clocks-ordering` |
| `SYS005` | **Design a Multi-Channel Notification Platform** | `notification-platform` | **P1** | `kafka-event-streaming`, `circuit-breaker-bulkhead`, `rate-limiting-admission-control`, `distributed-caching-redis` | `acid-transactions-consistency`, `latency-throughput-slos` |
| `SYS006` | **Design an Email Delivery & Campaign Engine** | `email-campaign-system` | **P2** | `kafka-event-streaming`, `distributed-caching-redis`, `rate-limiting-admission-control` | `horizontal-vs-vertical-scaling`, `acid-transactions-consistency` |
| `SYS007` | **Design Video Conferencing & Live Streaming (Zoom/Twitch)** | `video-conferencing-streaming` | **P2** | `load-balancers-traffic`, `service-discovery-health`, `api-gateway-reverse-proxy` | `latency-throughput-slos` |
| `SYS024` | **Design Massive-Scale Live Event & Fan-Out Chat (1M+ in 1 Room)** | `massive-live-event-chat` | **P2** | `load-balancers-traffic`, `distributed-caching-redis`, `kafka-event-streaming`, `circuit-breaker-bulkhead` | `latency-throughput-slos`, `horizontal-vs-vertical-scaling` |

#### Category 3.3: Commerce & Financial Systems (`commerce-transaction-systems`)
| Topic ID | Problem Title | Slug | Priority | Used Components | Founded On Principles |
| :---: | :--- | :--- | :---: | :--- | :--- |
| `SYS008` | **Design an E-Commerce Platform (Amazon)** | `ecommerce-platform` | **P0** | `distributed-caching-redis`, `kafka-event-streaming`, `saga-pattern-cqrs`, `api-gateway-reverse-proxy` | `acid-transactions-consistency`, `cap-pacelc-theorems` |
| `SYS009` | **Design a Payment Gateway & Accounting Ledger** | `payment-gateway-ledger` | **P0** | `transactional-outbox-cdc`, `distributed-locks-fencing`, `db-replication-sharding` | `acid-transactions-consistency`, `cap-pacelc-theorems` |
| `SYS010` | **Design Ticket Booking (Ticketmaster)** | `ticket-booking-platform` | **P1** | `distributed-locks-fencing`, `rate-limiting-admission-control`, `distributed-caching-redis`, `load-balancers-traffic` | `acid-transactions-consistency`, `horizontal-vs-vertical-scaling` |
| `SYS011` | **Design Real-Time Fraud & Risk Detection Engine (Stripe Radar)** | `fraud-risk-detection` | **P2** | `kafka-event-streaming`, `distributed-caching-redis`, `storage-engines-lsm-trees` | `latency-throughput-slos`, `cap-pacelc-theorems` |

#### Category 3.4: Social & Content Platforms (`social-content-platforms`)
| Topic ID | Problem Title | Slug | Priority | Used Components | Founded On Principles |
| :---: | :--- | :--- | :---: | :--- | :--- |
| `SYS012` | **Design a Social Media News Feed (Twitter/X)** | `social-news-feed` | **P0** | `distributed-caching-redis`, `kafka-event-streaming`, `cdn-edge-caching`, `api-gateway-reverse-proxy` | `latency-throughput-slos`, `horizontal-vs-vertical-scaling`, `acid-transactions-consistency` |
| `SYS013` | **Design a Search Engine & Web Crawler** | `search-engine-crawler` | **P1** | `kafka-event-streaming`, `storage-engines-lsm-trees`, `service-discovery-health` | `horizontal-vs-vertical-scaling`, `latency-throughput-slos` |
| `SYS014` | **Design Search Autocomplete / Typeahead (Google)** | `search-autocomplete-typeahead` | **P0** | `cdn-edge-caching`, `distributed-caching-redis`, `load-balancers-traffic` | `latency-throughput-slos`, `horizontal-vs-vertical-scaling` |

#### Category 3.5: Streaming, Media & Location Systems (`media-location-systems`)
| Topic ID | Problem Title | Slug | Priority | Used Components | Founded On Principles |
| :---: | :--- | :--- | :---: | :--- | :--- |
| `SYS015` | **Design Video Streaming & VOD Distribution (YouTube / Netflix)** | `video-streaming-platform` | **P1** | `cdn-edge-caching`, `kafka-event-streaming`, `storage-engines-lsm-trees`, `load-balancers-traffic` | `latency-throughput-slos`, `horizontal-vs-vertical-scaling` |
| `SYS016` | **Design Ride-Sharing & Dispatch (Uber / Lyft)** | `ride-sharing-dispatch` | **P0** | `distributed-caching-redis`, `kafka-event-streaming`, `api-gateway-reverse-proxy`, `distributed-locks-fencing` | `latency-throughput-slos`, `acid-transactions-consistency`, `horizontal-vs-vertical-scaling` |
| `SYS017` | **Design a Real-Time Gaming Leaderboard** | `gaming-leaderboard` | **P1** | `distributed-caching-redis`, `load-balancers-traffic`, `storage-engines-lsm-trees` | `latency-throughput-slos`, `horizontal-vs-vertical-scaling` |

#### Category 3.6: Distributed Infrastructure & Storage Systems (`distributed-infrastructure-systems`)
| Topic ID | Problem Title | Slug | Priority | Used Components | Founded On Principles |
| :---: | :--- | :--- | :---: | :--- | :--- |
| `SYS018` | **Design a Distributed Key-Value Store (Dynamo/Cassandra)** | `distributed-key-value-store` | **P0** | `storage-engines-lsm-trees`, `service-discovery-health`, `gossip-protocols-membership` | `cap-pacelc-theorems`, `acid-transactions-consistency`, `distributed-clocks-ordering` |
| `SYS019` | **Design Metrics, Telemetry & Observability (Prometheus/Datadog)** | `metrics-observability-platform` | **P1** | `storage-engines-lsm-trees`, `kafka-event-streaming`, `service-discovery-health` | `latency-throughput-slos`, `horizontal-vs-vertical-scaling` |
| `SYS020` | **Design Cloud File Storage & Sync (Google Drive / Dropbox)** | `cloud-file-sync` | **P1** | `cdn-edge-caching`, `distributed-caching-redis`, `kafka-event-streaming` | `acid-transactions-consistency`, `latency-throughput-slos` |
| `SYS021` | **Design Real-Time Collaborative Editor (Google Docs / Figma)** | `collaborative-document-editor` | **P2** | `api-gateway-reverse-proxy`, `distributed-caching-redis` | `distributed-clocks-ordering`, `acid-transactions-consistency` |
| `SYS022` | **Design an OTA Firmware Update Platform for Connected Devices** | `ota-firmware-update-platform` | **P2** | `cdn-edge-caching`, `kafka-event-streaming`, `distributed-caching-redis` | `latency-throughput-slos`, `acid-transactions-consistency` |
| `SYS023` | **Design a Distributed Job Scheduler & Durable Workflow Engine (Temporal)** | `distributed-workflow-scheduler` | **P1** | `kafka-event-streaming`, `distributed-locks-fencing`, `db-replication-sharding`, `storage-engines-lsm-trees` | `acid-transactions-consistency`, `distributed-clocks-ordering` |

---

## 5. The 20-Question Distribution Matrix (62 Topics | 1,240 Questions)

Each topic contains exactly **20 questions** (4 Beginner, 6 Intermediate, 6 Advanced, 4 Expert):

| Category | Topics | Beginner Qs | Intermediate Qs | Advanced Qs | Expert Qs | Total Questions |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **1.1 System Design Foundations** | 4 | 16 | 24 | 24 | 16 | **80** |
| **1.2 Networking & Communication** | 3 | 12 | 18 | 18 | 12 | **60** |
| **1.3 Storage & Database Fundamentals** | 4 | 16 | 24 | 24 | 16 | **80** |
| **1.4 Scalability & Performance** | 3 | 12 | 18 | 18 | 12 | **60** |
| **1.5 Distributed Systems Principles** | 4 | 16 | 24 | 24 | 16 | **80** |
| **1.6 Security in System Design** | 3 | 12 | 18 | 18 | 12 | **60** |
| **2.1 Traffic Management & Networking** | 4 | 16 | 24 | 24 | 16 | **80** |
| **2.2 Database & Storage Components** | 4 | 16 | 24 | 24 | 16 | **80** |
| **2.3 Messaging & Event-Driven** | 3 | 12 | 18 | 18 | 12 | **60** |
| **2.4 Distributed Coordination** | 4 | 16 | 24 | 24 | 16 | **80** |
| **2.5 Reliability & Resilience Patterns** | 2 | 8 | 12 | 12 | 8 | **40** |
| **3.1 Basic Application Design** | 3 | 12 | 18 | 18 | 12 | **60** |
| **3.2 Communication & Media Systems** | 5 | 20 | 30 | 30 | 20 | **100** |
| **3.3 Commerce & Financial Systems** | 4 | 16 | 24 | 24 | 16 | **80** |
| **3.4 Social & Content Platforms** | 3 | 12 | 18 | 18 | 12 | **60** |
| **3.5 Streaming, Media & Location** | 3 | 12 | 18 | 18 | 12 | **60** |
| **3.6 Distributed Infrastructure & Storage** | 6 | 24 | 36 | 36 | 24 | **120** |
| **TOTAL** | **62 Topics** | **248** | **372** | **372** | **248** | **1,240 Questions** |

---

## 6. Priority Roadmap Breakdown

The 62 topics follow a structured three-tier priority model (**P0: 24 Core Must-Master, P1: 24 High-Frequency & Senior Breadth, P2: 14 Specialized & Staff+ Deep Dives**):

```text
Priority Distribution Matrix:
├── P0 (Core Must-Master — 24 Topics | 480 Questions)
│   ├── Fast-Track Strategy: Non-negotiable fundamentals & iconic interview archetypes (2-3 weeks prep)
│   ├── Pillar 1 (Principles): 8 Topics (FND001, FND002, FND004, FND006, FND008, FND010, FND014, FND021)
│   ├── Pillar 2 (Components): 8 Topics (CMP001, CMP002, CMP004, CMP005, CMP006, CMP007, CMP009, CMP015)
│   └── Pillar 3 (Problems): 8 Topics (SYS001, SYS004, SYS008, SYS009, SYS012, SYS014, SYS016, SYS018)
│
├── P1 (High-Frequency & Senior Breadth — 24 Topics | 480 Questions)
│   ├── Full Preparation: Standard enterprise & mid-to-senior design loops (4-6 weeks prep)
│   ├── Pillar 1 (Principles): 9 Topics (FND003, FND005, FND007, FND009, FND011, FND012, FND015, FND017, FND019)
│   ├── Pillar 2 (Components): 5 Topics (CMP003, CMP010, CMP011, CMP014, CMP016)
│   └── Pillar 3 (Problems): 10 Topics (SYS002, SYS003, SYS005, SYS010, SYS013, SYS015, SYS017, SYS019, SYS020, SYS023)
│
└── P2 (Specialized & Staff/Principal Mastery — 14 Topics | 280 Questions)
    ├── Principal Deep Dives: Fault tolerance, adversarial consensus, advanced storage & high-concurrency edges
    ├── Pillar 1 (Principles): 4 Topics (FND013, FND016, FND018, FND020)
    ├── Pillar 2 (Components): 4 Topics (CMP008, CMP012, CMP013, CMP017)
    └── Pillar 3 (Problems): 6 Topics (SYS006, SYS007, SYS011, SYS021, SYS022, SYS024)

Total: 62 Topics = 1,240 Questions
```