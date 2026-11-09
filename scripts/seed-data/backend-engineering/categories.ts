import { CategorySeed } from './types';

export const BACKEND_CATEGORIES: CategorySeed[] = [
  // Universal Backend Core (6 Categories)
  {
    slug: 'be-api-protocols',
    name: 'API Protocols & Contracts',
    description:
      'REST conventions, HTTP/2 multiplexing, gRPC binary Protobuf contracts, API idempotency keys, and webhook delivery guarantees.',
    order: 1,
  },
  {
    slug: 'be-databases-transactions',
    name: 'Database Engines & Transactions',
    description:
      'B-Tree and LSM-Tree index optimization, ACID transaction isolation levels, MVCC mechanics, ORM query batching, and N+1 query elimination.',
    order: 2,
  },
  {
    slug: 'be-caching-state',
    name: 'In-Memory Caching & State Management',
    description:
      'Cache-aside, write-through/behind, cache stampede / dogpiling defense with probabilistic expiration (XFetch), and distributed locking with fencing tokens.',
    order: 3,
  },
  {
    slug: 'be-os-concurrency',
    name: 'OS Concurrency & Asynchronous I/O',
    description:
      'OS process and thread models, preemptive scheduling, atomic CAS primitives, non-blocking network I/O multiplexing (epoll/kqueue), and connection pool sizing.',
    order: 4,
  },
  {
    slug: 'be-security-traffic',
    name: 'Security, Auth & Traffic Shaping',
    description:
      'Stateless JWT rotation, stateful session revocation, OAuth2.0 PKCE authorization, SQLi/SSRF defense, and distributed rate limiting algorithms.',
    order: 5,
  },
  {
    slug: 'be-resilience-telemetry',
    name: 'Fault Tolerance & Telemetry',
    description:
      'Circuit breakers, exponential backoff with full jitter, bulkheads, distributed tracing with OpenTelemetry, and structured observability.',
    order: 6,
  },

  // Language Runtime Ecosystems (5 Initial Categories)
  {
    slug: 'be-lang-java',
    name: 'Java & JVM Ecosystem',
    description:
      'Java Collections and Generics, Spring Boot IoC and transaction boundaries, JVM memory regions, GC algorithms (G1/ZGC), and Project Loom Virtual Threads.',
    order: 7,
  },
  {
    slug: 'be-lang-nodejs',
    name: 'Node.js Server Runtime',
    description:
      'JavaScript scopes and closures, CommonJS vs ESM, asynchronous microtasks, stream backpressure, libuv 6-phase event loop, and V8 heap memory profiling.',
    order: 8,
  },
  {
    slug: 'be-lang-go',
    name: 'Go (Golang) Ecosystem',
    description:
      'Go slices and pointer receivers, goroutines and channels, context cancellation pipelines, GMP work-stealing scheduler, escape analysis, and tri-color GC.',
    order: 9,
  },
  {
    slug: 'be-lang-python',
    name: 'Python Ecosystem',
    description:
      'Python data model and dunder methods, AsyncIO event loop and FastAPI dependency injection, CPython GIL preemption, and cyclic generational garbage collection.',
    order: 10,
  },
  {
    slug: 'be-lang-php',
    name: 'Modern PHP Ecosystem',
    description:
      'PHP 8+ strict types and OOP, PHP-FPM process pools, OPcache compilation, Laravel IoC container, and persistent memory coroutine runtimes (Swoole/RoadRunner).',
    order: 11,
  },
];

