/**
 * PrepInMinutes — Neo4j Knowledge Graph Multi-Stack Seeder
 *
 * Populates:
 * 1. Schema Constraints (Domain, Category, Topic, Question, Skill)
 * 2. Domains & Categories (System Design, DSA, Core Languages, Databases, Behavioral)
 * 3. Multi-Language Categories & Topics (Java, Go, Python, TypeScript, C#, PHP)
 * 4. Curated Prerequisite Dependency Graph ([:PREREQUISITE_FOR])
 * 5. Comprehensive Benchmark Diagnostic Questions across all levels (Beginner, Intermediate, Advanced)
 */

import "dotenv/config";
import { getNeo4jDriver, closeNeo4jDriver } from "../src/server/graph/neo4j";
import { db as prisma } from "../src/server/db/client";

// Multi-Language Categories & Topics to seed into Neo4j
const LANGUAGE_DOMAINS = [
  {
    domain: {
      slug: "core-engineering-languages",
      name: "Core Engineering & Language Runtimes",
      description: "Deep dive into language memory models, execution engines, garbage collection, and concurrency primitives.",
    },
    categories: [
      {
        slug: "java-jvm-internals",
        name: "Java Engineering & JVM Internals",
        description: "Java execution runtime, JVM memory regions, GC algorithms (G1/ZGC), and JMM concurrency.",
        topics: [
          {
            slug: "java-concurrency-primitives",
            title: "Java Concurrency & Memory Model (JMM)",
            description: "Thread synchronization, volatile semantics, ConcurrentHashMap, and CAS primitives.",
            difficulty: "ADVANCED",
            rubricAtoms: ["Happens-before order", "CAS atomic references", "Volatile cache coherence"],
            durationMin: 45,
          },
          {
            slug: "jvm-garbage-collection",
            title: "JVM Memory Management & Garbage Collection",
            description: "Heap generational architecture, G1 vs ZGC pause-time trade-offs, and OutOfMemoryError analysis.",
            difficulty: "ADVANCED",
            rubricAtoms: ["Generational heap layout", "Stop-the-world pauses", "Memory leak profiling"],
            durationMin: 45,
          },
          {
            slug: "java-spring-framework",
            title: "Spring Boot Internals & Dependency Injection",
            description: "Spring Bean lifecycles, proxy creation (CGLIB vs JDK dynamic), and transaction propagation.",
            difficulty: "INTERMEDIATE",
            rubricAtoms: ["AOP proxies", "Transactional boundaries", "Bean post-processing"],
            durationMin: 30,
          },
        ],
      },
      {
        slug: "go-systems-concurrency",
        name: "Go Systems & Concurrency",
        description: "Go runtime mechanics, GMP scheduler, goroutine multiplexing, and channels vs mutexes.",
        topics: [
          {
            slug: "go-gmp-scheduler",
            title: "Go GMP Scheduler & Goroutine Multiplexing",
            description: "Work-stealing scheduler, M-to-N threading model, sysmon, and preemption in Go.",
            difficulty: "ADVANCED",
            rubricAtoms: ["M:N scheduler structure", "Syscall preemption", "Work-stealing queue"],
            durationMin: 45,
          },
          {
            slug: "go-channels-memory",
            title: "Go Channels, Memory Safety & Race Detection",
            description: "Buffered vs unbuffered channel internals, race conditions, select statements, and context propagation.",
            difficulty: "INTERMEDIATE",
            rubricAtoms: ["Hchan struct mechanics", "Lock contention", "Context cancellation"],
            durationMin: 35,
          },
        ],
      },
      {
        slug: "python-runtime-architecture",
        name: "Python Runtime & Architecture",
        description: "CPython execution engine, Global Interpreter Lock (GIL), asyncio event loop, and memory arenas.",
        topics: [
          {
            slug: "python-gil-asyncio",
            title: "CPython GIL, Asyncio & Concurrency Trade-offs",
            description: "Global Interpreter Lock bottlenecks, asyncio event loop vs multiprocessing, and thread switching.",
            difficulty: "ADVANCED",
            rubricAtoms: ["GIL release on I/O", "Asyncio coroutines", "Multiprocessing IPC overhead"],
            durationMin: 45,
          },
          {
            slug: "python-memory-model",
            title: "Python Memory Management & Object Allocation",
            description: "Reference counting, cyclic garbage collector, pymalloc arenas, and generator efficiency.",
            difficulty: "INTERMEDIATE",
            rubricAtoms: ["Reference counting", "Generational GC for cycles", "Generator memory savings"],
            durationMin: 30,
          },
        ],
      },
      {
        slug: "typescript-nodejs-internals",
        name: "TypeScript & Node.js Internals",
        description: "V8 JavaScript engine, event loop execution phases, worker threads, and memory heap profiling.",
        topics: [
          {
            slug: "nodejs-event-loop-deep",
            title: "Node.js Event Loop, Libuv & Microtasks",
            description: "Event loop phases (Timers, Poll, Check), process.nextTick vs Promise microtasks, and thread pool sizing.",
            difficulty: "INTERMEDIATE",
            rubricAtoms: ["Libuv thread pool", "Microtask drain order", "Event loop starvation"],
            durationMin: 35,
          },
          {
            slug: "v8-memory-worker-threads",
            title: "V8 Heap Structure, Memory Leaks & Worker Threads",
            description: "New space vs Old space, Scavenge GC, worker_threads message-passing, and memory heap snapshots.",
            difficulty: "ADVANCED",
            rubricAtoms: ["Heap generation layout", "Closure leak detection", "Worker thread SharedArrayBuffer"],
            durationMin: 45,
          },
        ],
      },
      {
        slug: "csharp-dotnet-architecture",
        name: "C# & .NET Runtime Architecture",
        description: "Common Language Runtime (CLR), garbage collection generations, async/await state machines, and Span zero-allocation.",
        topics: [
          {
            slug: "csharp-clr-gc",
            title: "CLR Generational Garbage Collection & Memory",
            description: "Generations 0, 1, 2, Large Object Heap (LOH), Pinning, and high-throughput Span<T> zero-allocations.",
            difficulty: "ADVANCED",
            rubricAtoms: ["Gen 0/1/2 collection", "Large Object Heap fragmentation", "Span ref struct stack allocation"],
            durationMin: 45,
          },
          {
            slug: "csharp-async-await-state",
            title: "C# Async/Await State Machines & ThreadPool",
            description: "Compiler-generated state machine structs, SynchronizationContext, and ThreadPool starvation prevention.",
            difficulty: "INTERMEDIATE",
            rubricAtoms: ["State machine allocation", "Sync-over-async starvation", "ConfigureAwait behavior"],
            durationMin: 35,
          },
        ],
      },
      {
        slug: "php-backend-runtimes",
        name: "PHP & Modern Backend Runtimes",
        description: "PHP-FPM shared-nothing process model, OpCache bytecode optimization, and stateless horizontal scaling.",
        topics: [
          {
            slug: "php-fpm-concurrency",
            title: "PHP-FPM Worker Architecture & OpCache",
            description: "FastCGI process manager pooling, shared-nothing architecture, and persistent in-memory bytecode caching.",
            difficulty: "INTERMEDIATE",
            rubricAtoms: ["Process pooling strategies", "OpCache shared memory", "Stateless horizontal scaling"],
            durationMin: 30,
          },
        ],
      },
    ],
  },
];

// Complete Multi-Stack Benchmark Questions
const BENCHMARK_QUESTIONS = [
  // 1. JAVA QUESTIONS
  {
    topicSlug: "java-concurrency-primitives",
    title: "Java Memory Model (JMM) & ConcurrentHashMap Internals",
    difficulty: "ADVANCED",
    prompt: "In Java, how does the Java Memory Model (JMM) guarantee memory visibility and ordering across multi-core CPUs? Explain how ConcurrentHashMap achieves high concurrent write throughput without full table locks.",
    rubricGuide: "Expect happens-before rules, volatile reads/writes, CAS operations on bucket bins, and synchronized node locking only on the collision chain head.",
    hints: ["How did ConcurrentHashMap transition from Java 7 Segment locks to Java 8 CAS + Synchronized nodes?", "What is the purpose of the volatile table array reference?"],
  },
  {
    topicSlug: "jvm-garbage-collection",
    title: "JVM Garbage Collection Tuning & G1 vs ZGC",
    difficulty: "ADVANCED",
    prompt: "Compare the G1 Garbage Collector with the ultra-low latency ZGC in modern Java. How does G1 divide the heap into regions, and how does ZGC achieve sub-millisecond pause times regardless of heap size?",
    rubricGuide: "Must explain G1 region-based generational heap, Remembered Sets (R-Sets), and concurrent marking. For ZGC, explain colored pointers and load barriers.",
    hints: ["What triggers a full GC fallback in G1?", "How do load barriers intercept object references during concurrent relocation?"],
  },
  {
    topicSlug: "java-spring-framework",
    title: "Spring Bean Scopes & Transactional Proxy Mechanisms",
    difficulty: "INTERMEDIATE",
    prompt: "In Spring Boot, how does the @Transactional annotation work behind the scenes? What happens when a transactional method calls another transactional method within the same service class?",
    rubricGuide: "Candidate must explain AOP proxies (CGLIB vs Dynamic Proxies). Internal calls bypass the proxy, meaning the transaction aspect will not intercept the call.",
    hints: ["Why does self-invocation bypass proxy advice?", "How do transaction propagation modes like REQUIRED vs REQUIRES_NEW interact?"],
  },

  // 2. GO QUESTIONS
  {
    topicSlug: "go-gmp-scheduler",
    title: "Go GMP Scheduler Architecture & Cooperative Preemption",
    difficulty: "ADVANCED",
    prompt: "Walk me through Go's GMP scheduler architecture (Goroutine, Machine, Processor). How does Go achieve high concurrency with low memory overhead, and how does the runtime prevent tight CPU loops from starving other goroutines?",
    rubricGuide: "Candidate must define G, M, and P roles. Explain 2KB initial stack growth, local run queues, global run queues, work-stealing algorithm, and asynchronous preemption introduced in Go 1.14 via OS signals.",
    hints: ["Why does Go introduce Processor (P) rather than binding Goroutines directly to OS threads (M)?", "How does work-stealing balance workloads across P runqueues?"],
  },
  {
    topicSlug: "go-channels-memory",
    title: "Go Channels Internals & Channel-Based Worker Pools",
    difficulty: "INTERMEDIATE",
    prompt: "Explain how Go buffered and unbuffered channels function internally. How do you design a robust worker pool with graceful shutdown using channels, select, and sync.WaitGroup without deadlocking or leaking goroutines?",
    rubricGuide: "Explain hchan struct with circular ring buffer, wait queues (sudog), mutex lock, context cancellation propagation, and closing channels only from the sender side.",
    hints: ["What happens when reading from a closed channel versus writing to a closed channel?", "Writing panics, reading returns zero-value and false."],
  },

  // 3. PYTHON QUESTIONS
  {
    topicSlug: "python-gil-asyncio",
    title: "Python GIL Bottlenecks & Asyncio Event Loop",
    difficulty: "ADVANCED",
    prompt: "Explain how Python's Global Interpreter Lock (GIL) operates in CPython. For a high-throughput backend service with both I/O-bound database queries and CPU-bound data parsing, how would you architect concurrency using Asyncio and ProcessPoolExecutor?",
    rubricGuide: "Candidate must explain the GIL mutex protecting PyObject reference counts, why multi-threading fails to accelerate CPU tasks, cooperative async yield on await, and offloading CPU work to multiprocessing pools.",
    hints: ["When does CPython release the GIL during I/O operations?", "How do asyncio tasks differ from OS threads?"],
  },
  {
    topicSlug: "python-memory-model",
    title: "CPython Memory Management & Cyclic Garbage Collection",
    difficulty: "INTERMEDIATE",
    prompt: "How does Python manage memory allocation and deallocation? When does reference counting suffice, and how does the generational cyclic garbage collector resolve circular references between objects?",
    rubricGuide: "Candidate must identify reference counting as primary mechanism. Explain 3 generational tracking lists for cyclic references, PyMalloc small object allocator (arenas, pools, blocks), and __del__ pitfalls.",
    hints: ["Can circular references (A points to B, B points to A) be freed by reference counting alone?", "No, they require the cyclic GC traverse check."],
  },

  // 4. TYPESCRIPT / NODE.JS QUESTIONS
  {
    topicSlug: "nodejs-event-loop-deep",
    title: "Node.js Event Loop Phases & Microtask Starvation",
    difficulty: "INTERMEDIATE",
    prompt: "Walk me through the phases of the Node.js event loop (Timers, Pending Callbacks, Poll, Check, Close). How do process.nextTick() and Promise microtask queues interact with these phases, and how can an uncapped recursive nextTick crash or starve an application?",
    rubricGuide: "Must explain Libuv event loop phases, microtask queue draining between every macro task, nextTick priority over promises, and blocking I/O poll phase.",
    hints: ["What is the difference in execution timing between setImmediate() and setTimeout(..., 0)?", "Where does the poll phase wait when no timers are due?"],
  },
  {
    topicSlug: "v8-memory-worker-threads",
    title: "V8 Heap Management, Memory Leaks & Worker Threads",
    difficulty: "ADVANCED",
    prompt: "How does the V8 engine partition heap memory between New Space (Nursery/Intermediate) and Old Space? How do you profile and diagnose an unintentional memory leak caused by retained closures in an Express/Node production service?",
    rubricGuide: "Candidate must articulate Scavenge semi-space Cheney copying GC for New space, Mark-Sweep-Compact for Old space. Explain retained closure scopes, detached DOM/buffers, and taking V8 heap snapshots via chrome://inspect or clinic.js.",
    hints: ["Why does an event listener on a singleton service cause memory leaks with closures?", "How does worker_threads bypass the single-threaded CPU barrier?"],
  },

  // 5. C# / .NET QUESTIONS
  {
    topicSlug: "csharp-clr-gc",
    title: "C# CLR Garbage Collection & Zero-Allocation Span<T>",
    difficulty: "ADVANCED",
    prompt: "Explain the generational garbage collection mechanism in the .NET Common Language Runtime (CLR). How does the Large Object Heap (LOH) differ from Gen 0, 1, 2, and how do Span<T> and Memory<T> enable zero-allocation high-throughput parsing?",
    rubricGuide: "Generations 0, 1, 2 collection triggers, LOH fragmentation without compaction, Span<T> as a ref struct residing solely on the stack, and avoiding heap allocation during string/buffer slicing.",
    hints: ["What byte threshold automatically routes allocations to the Large Object Heap (85,000 bytes)?", "Why can Span<T> not be stored as a field on a heap-allocated class?"],
  },
  {
    topicSlug: "csharp-async-await-state",
    title: "C# Async/Await State Machines & ThreadPool Starvation",
    difficulty: "INTERMEDIATE",
    prompt: "How does the C# compiler transform an async method into a state machine? What causes ThreadPool starvation when developers call .Result or .Wait() on uncompleted tasks in ASP.NET Core, and how do you resolve it?",
    rubricGuide: "Explain compiler state machine generation (IAsyncStateMachine struct), execution context capture, sync-over-async blocking thread pool worker threads, and using async all the way through with ValueTask.",
    hints: ["Why does blocking on an uncompleted task tie up a ThreadPool thread?", "How does ConfigureAwait(false) prevent synchronization context deadlocks?"],
  },

  // 6. PHP QUESTIONS
  {
    topicSlug: "php-fpm-concurrency",
    title: "PHP-FPM Worker Scaling & OpCache In-Memory Bytecode",
    difficulty: "INTERMEDIATE",
    prompt: "How does the PHP-FPM execution model handle concurrent web requests under heavy traffic? How does OpCache eliminate compilation overhead, and what are the trade-offs of PHP's shared-nothing architecture compared to persistent application servers?",
    rubricGuide: "Master/worker architecture, dynamic vs ondemand process managers, OpCache compiling PHP script AST into shared memory opcode, eliminating cold boot overhead, and shared-nothing preventing in-memory state leakage across requests.",
    hints: ["What happens when all PHP-FPM workers are busy executing long-running database queries?", "How do modern runtimes like Swoole or RoadRunner persist memory?"],
  },

  // 7. DISTRIBUTED ARCHITECTURE & SCALE
  {
    topicSlug: "url-shortener",
    title: "Design a High-Throughput URL Shortener (TinyURL)",
    difficulty: "INTERMEDIATE",
    prompt: "Design a globally distributed URL shortening service capable of handling 100M new URLs/month and 1B redirects/month. Walk me through your data model, Base62 encoding, and cache strategy to ensure sub-15ms redirect latency.",
    rubricGuide: "Candidate must identify Base62 7-char hash collision strategies, calculate QPS (385 reads/sec average, 5K peak), use Redis LRU caching, and articulate SQL vs NoSQL trade-offs.",
    hints: ["Consider Key Generation Service (KGS) to avoid write-time collision checks.", "How do custom vanity aliases impact your indexing?"],
  },
  {
    topicSlug: "distributed-cache",
    title: "Distributed Caching Architecture & Thundering Herd Prevention",
    difficulty: "ADVANCED",
    prompt: "Design a distributed caching tier supporting 500,000 read QPS. Explain how you prevent cache stampede (thundering herd), handle cache penetration with Bloom filters, and maintain consistency with the primary database.",
    rubricGuide: "Expect mutex/probabilistic early expiration (XFetch), cache-aside pattern, Bloom filter for non-existent keys, and Redis Cluster hash-slot partitioning.",
    hints: ["What happens when a viral key expires under 100k concurrent requests?", "How does probabilistic early recomputation work?"],
  },
  {
    topicSlug: "rate-limiter",
    title: "High-Performance Distributed Rate Limiting",
    difficulty: "INTERMEDIATE",
    prompt: "How would you design a multi-tier rate limiter protecting an enterprise API gateway from DDoS and fair-usage violations? Compare Token Bucket vs Sliding Window Counter in Redis.",
    rubricGuide: "Expect Redis sorted sets for sliding window logs vs Lua scripts for atomic token bucket deduction without race conditions.",
    hints: ["How do you handle Redis connection latency in the critical path?", "Local in-memory token bucket + Redis sync."],
  },
  {
    topicSlug: "database-sharding",
    title: "Horizontal Database Sharding & Resharding Strategies",
    difficulty: "ADVANCED",
    prompt: "Your single PostgreSQL database is bottlenecked on write throughput. How do you design horizontal sharding across 16 database nodes? What shard key do you choose, and how do you handle cross-shard joins and rebalancing?",
    rubricGuide: "Hash-based sharding on tenant_id or user_id, virtual shards on consistent hash ring for painless rebalancing, denormalizing data to eliminate cross-shard joins, and two-phase commit or saga pattern for cross-shard writes.",
    hints: ["Why does auto-increment primary key fail as a shard key?", "How do virtual shards prevent moving 100% of rows during node additions?"],
  },
  {
    topicSlug: "circuit-breakers",
    title: "Microservice Resiliency, Circuit Breakers & Cascading Failure Prevention",
    difficulty: "INTERMEDIATE",
    prompt: "In a microservice mesh, a downstream inventory service begins timing out under heavy traffic, causing upstream API gateways to exhaust their connection pools. How do you design a Circuit Breaker pattern with bulkhead isolation to prevent cascading cluster failure?",
    rubricGuide: "Candidate must articulate 3 circuit states (CLOSED, OPEN, HALF-OPEN), error rate and timeout thresholds, bulkhead thread pool isolation, and fallback responses.",
    hints: ["What triggers the transition from OPEN to HALF-OPEN?", "How does bulkhead isolation protect thread pools of unrelated endpoints?"],
  },
  {
    topicSlug: "message-queues",
    title: "Distributed Event Streaming & Exactly-Once Semantics in Kafka",
    difficulty: "ADVANCED",
    prompt: "How does Apache Kafka guarantee high write throughput and message ordering within a partition? How do producer idempotent sequence numbers and transactional coordinators achieve exactly-once processing (EOS) in stream pipelines?",
    rubricGuide: "Sequential append-only commit log, zero-copy OS sendfile(), partition consumer offsets, transactional coordinator, and idempotent producer PIDs.",
    hints: ["How does Kafka achieve high disk throughput without random I/O?", "Sequential disk writes match memory speeds."],
  },

  // 8. DATA STRUCTURES & CORE PATTERNS
  {
    topicSlug: "lru-cache-design",
    title: "LRU Cache Design (O(1) Get & Put)",
    difficulty: "INTERMEDIATE",
    prompt: "Implement a Least Recently Used (LRU) Cache that operates with strictly O(1) time complexity for both get() and put() operations without using language built-in LinkedHashMap.",
    rubricGuide: "Must use a Doubly Linked List for O(1) node relocation and a Hash Map storing node pointers. Edge cases: empty cache, capacity of 1, duplicate keys.",
    hints: ["Use dummy head and tail sentinel nodes to eliminate null checks."],
  },
  {
    topicSlug: "sliding-window",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "BEGINNER",
    prompt: "Given a string s, find the length of the longest substring without repeating characters. Walk through time and space complexity.",
    rubricGuide: "Optimal O(N) sliding window with character index hash map. Space O(min(m, n)).",
    hints: ["Instead of shrinking the window one step at a time, jump left pointer to last seen index + 1."],
  },
  {
    topicSlug: "topological-sort",
    title: "Course Schedule & Task Dependency Resolution",
    difficulty: "ADVANCED",
    prompt: "Given N tasks and a list of prerequisite pairs, detect whether all tasks can be finished (cycle detection), and return a valid execution order.",
    rubricGuide: "Kahn's algorithm using in-degree array + BFS queue, or DFS with 3-color cycle detection (UNVISITED, VISITING, VISITED). Time O(V + E).",
    hints: ["If the processed task count is less than N, a directed cycle exists."],
  },
];

// Curated Prerequisite Relationships
const PREREQUISITES = [
  { from: "consistent-hashing", to: "distributed-cache" },
  { from: "distributed-cache", to: "database-sharding" },
  { from: "rate-limiter", to: "api-design-patterns" },
  { from: "sliding-window", to: "lru-cache-design" },
  { from: "b-tree-indexing", to: "database-transactions" },
  { from: "cap-theorem", to: "distributed-consensus" },
  { from: "java-spring-framework", to: "java-concurrency-primitives" },
  { from: "java-concurrency-primitives", to: "jvm-garbage-collection" },
  { from: "go-channels-memory", to: "go-gmp-scheduler" },
  { from: "python-memory-model", to: "python-gil-asyncio" },
  { from: "nodejs-event-loop-deep", to: "v8-memory-worker-threads" },
  { from: "csharp-async-await-state", to: "csharp-clr-gc" },
];

async function seedNeo4jKnowledgeGraph() {
  console.log("=================================================================");
  console.log("   PrepInMinutes — Neo4j Knowledge Graph Multi-Stack Seeder     ");
  console.log("=================================================================\n");

  const driver = getNeo4jDriver();
  const session = driver.session();

  try {
    // 1. Create Schema Constraints & Indexes
    console.log("1. Setting up Neo4j Cypher unique constraints...");
    await session.run(`
      CREATE CONSTRAINT domain_slug_unique IF NOT EXISTS
      FOR (d:Domain) REQUIRE d.slug IS UNIQUE
    `);
    await session.run(`
      CREATE CONSTRAINT category_slug_unique IF NOT EXISTS
      FOR (c:Category) REQUIRE c.slug IS UNIQUE
    `);
    await session.run(`
      CREATE CONSTRAINT topic_slug_unique IF NOT EXISTS
      FOR (t:Topic) REQUIRE t.slug IS UNIQUE
    `);
    await session.run(`
      CREATE CONSTRAINT question_id_unique IF NOT EXISTS
      FOR (q:Question) REQUIRE q.id IS UNIQUE
    `);
    console.log("  ✓ Constraints verified on Domain, Category, Topic, and Question.");

    // 2. Fetch existing curriculum from PostgreSQL
    console.log("\n2. Ingesting PostgreSQL curriculum taxonomy...");
    const domains = await prisma.curriculumDomain.findMany({
      include: {
        categories: {
          include: {
            topics: true,
          },
        },
      },
    });

    console.log(`  ✓ Loaded ${domains.length} domains and ${domains.flatMap(d => d.categories).length} categories from PostgreSQL.`);

    // 3. Ingest PostgreSQL Domains & Topics
    for (const domain of domains) {
      await session.run(
        `
        MERGE (d:Domain {slug: $slug})
        ON CREATE SET d.name = $name, d.description = $description, d.createdAt = datetime()
        ON MATCH SET d.name = $name, d.description = $description
        `,
        { slug: domain.slug, name: domain.name, description: domain.description }
      );

      for (const cat of domain.categories) {
        await session.run(
          `
          MATCH (d:Domain {slug: $domainSlug})
          MERGE (c:Category {slug: $slug})
          ON CREATE SET c.name = $name, c.description = $description, c.createdAt = datetime()
          ON MATCH SET c.name = $name, c.description = $description
          MERGE (d)-[:CONTAINS]->(c)
          `,
          { domainSlug: domain.slug, slug: cat.slug, name: cat.name, description: cat.description }
        );

        for (const topic of cat.topics) {
          await session.run(
            `
            MATCH (c:Category {slug: $catSlug})
            MERGE (t:Topic {slug: $slug})
            ON CREATE SET 
              t.title = $title,
              t.description = $description,
              t.difficulty = $difficulty,
              t.rubricAtoms = $rubricAtoms,
              t.durationMin = $durationMin,
              t.createdAt = datetime()
            ON MATCH SET 
              t.title = $title,
              t.description = $description,
              t.difficulty = $difficulty,
              t.rubricAtoms = $rubricAtoms,
              t.durationMin = $durationMin
            MERGE (c)-[:HAS_TOPIC]->(t)
            `,
            {
              catSlug: cat.slug,
              slug: topic.slug,
              title: topic.title,
              description: topic.description,
              difficulty: topic.difficulty,
              rubricAtoms: topic.rubricAtoms,
              durationMin: topic.durationMin,
            }
          );
        }
      }
    }
    console.log("  ✓ Synchronized PostgreSQL curriculum taxonomy into Neo4j.");

    // 4. Ingest Multi-Language Domains, Categories & Topics
    console.log("\n4. Ingesting Core Engineering Language Runtimes (Java, Go, Python, Node, C#, PHP)...");
    let langTopicCount = 0;

    for (const ld of LANGUAGE_DOMAINS) {
      await session.run(
        `
        MERGE (d:Domain {slug: $slug})
        ON CREATE SET d.name = $name, d.description = $description, d.createdAt = datetime()
        ON MATCH SET d.name = $name, d.description = $description
        `,
        { slug: ld.domain.slug, name: ld.domain.name, description: ld.domain.description }
      );

      for (const cat of ld.categories) {
        await session.run(
          `
          MATCH (d:Domain {slug: $domainSlug})
          MERGE (c:Category {slug: $slug})
          ON CREATE SET c.name = $name, c.description = $description, c.createdAt = datetime()
          ON MATCH SET c.name = $name, c.description = $description
          MERGE (d)-[:CONTAINS]->(c)
          `,
          { domainSlug: ld.domain.slug, slug: cat.slug, name: cat.name, description: cat.description }
        );

        for (const topic of cat.topics) {
          await session.run(
            `
            MATCH (c:Category {slug: $catSlug})
            MERGE (t:Topic {slug: $slug})
            ON CREATE SET 
              t.title = $title,
              t.description = $description,
              t.difficulty = $difficulty,
              t.rubricAtoms = $rubricAtoms,
              t.durationMin = $durationMin,
              t.createdAt = datetime()
            ON MATCH SET 
              t.title = $title,
              t.description = $description,
              t.difficulty = $difficulty,
              t.rubricAtoms = $rubricAtoms,
              t.durationMin = $durationMin
            MERGE (c)-[:HAS_TOPIC]->(t)
            `,
            {
              catSlug: cat.slug,
              slug: topic.slug,
              title: topic.title,
              description: topic.description,
              difficulty: topic.difficulty,
              rubricAtoms: topic.rubricAtoms,
              durationMin: topic.durationMin,
            }
          );
          langTopicCount++;
        }
      }
    }
    console.log(`  ✓ Ingested ${langTopicCount} multi-language topics linked to their language runtime categories.`);

    // 5. Establish Prerequisite Relationships
    console.log("\n5. Establishing Topic Prerequisite Graph ([:PREREQUISITE_FOR])...");
    let prereqCount = 0;
    for (const prereq of PREREQUISITES) {
      const res = await session.run(
        `
        MATCH (from:Topic {slug: $fromSlug})
        MATCH (to:Topic {slug: $toSlug})
        MERGE (from)-[:PREREQUISITE_FOR]->(to)
        RETURN count(*) as cnt
        `,
        { fromSlug: prereq.from, toSlug: prereq.to }
      );
      if (res.records[0]?.get("cnt") > 0) prereqCount++;
    }
    console.log(`  ✓ Created ${prereqCount} prerequisite dependency edges.`);

    // 6. Ingest Benchmark Diagnostic Questions
    console.log("\n6. Ingesting Multi-Stack Diagnostic & Benchmark Questions...");
    let qCount = 0;
    for (const q of BENCHMARK_QUESTIONS) {
      const qId = `q_${q.topicSlug}_${q.difficulty.toLowerCase()}`;
      await session.run(
        `
        MATCH (t:Topic {slug: $topicSlug})
        MERGE (q:Question {id: $qId})
        ON CREATE SET 
          q.title = $title,
          q.prompt = $prompt,
          q.difficulty = $difficulty,
          q.rubricGuide = $rubricGuide,
          q.hints = $hints,
          q.status = 'PUBLISHED',
          q.version = 1,
          q.createdAt = datetime()
        ON MATCH SET 
          q.title = $title,
          q.prompt = $prompt,
          q.difficulty = $difficulty,
          q.rubricGuide = $rubricGuide,
          q.hints = $hints,
          q.status = 'PUBLISHED'
        MERGE (t)-[:HAS_QUESTION]->(q)
        `,
        {
          topicSlug: q.topicSlug,
          qId,
          title: q.title,
          prompt: q.prompt,
          difficulty: q.difficulty,
          rubricGuide: q.rubricGuide,
          hints: q.hints,
        }
      );
      qCount++;
    }
    console.log(`  ✓ Successfully seeded ${qCount} vetted diagnostic & benchmark questions across Java, Go, Python, Node, C#, and Distributed Architecture.`);

    // 7. Graph Traversal Verification
    console.log("\n7. Running Verification Cypher Traversal for Multi-Language Stacks...");
    const verification = await session.run(`
      MATCH (d:Domain)-[:CONTAINS]->(c:Category)-[:HAS_TOPIC]->(t:Topic)-[:HAS_QUESTION]->(q:Question)
      RETURN c.name AS category, t.title AS topic, q.title AS question, q.difficulty AS difficulty
      ORDER BY c.name, q.difficulty
      LIMIT 8
    `);

    verification.records.forEach((r) => {
      console.log(`  • [${r.get("category")}]`);
      console.log(`    Topic: "${r.get("topic")}"`);
      console.log(`    Question: "${r.get("question")}" (${r.get("difficulty")})\n`);
    });

    console.log("=================================================================");
    console.log("   NEO4J MULTI-STACK KNOWLEDGE GRAPH SEED COMPLETE!             ");
    console.log("=================================================================\n");
  } catch (error) {
    console.error("Seeding Neo4j failed:", error);
    process.exit(1);
  } finally {
    await session.close();
    await closeNeo4jDriver();
    await prisma.$disconnect();
    process.exit(0);
  }
}

seedNeo4jKnowledgeGraph();
