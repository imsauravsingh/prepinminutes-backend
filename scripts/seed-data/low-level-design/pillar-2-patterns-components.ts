import { TopicSeed } from './types';
import { generateQuestionsForTopic } from './question-generator';

const RAW_PILLAR_2_COMPONENTS: Omit<TopicSeed, 'questions'>[] = [
  {
    slug: 'creational-patterns',
    topicId: 'LLDC01',
    title: 'Creational Design Patterns',
    categorySlug: 'lld-design-patterns',
    pillar: 'components',
    priority: 'P0',
    difficulty: 'INTERMEDIATE',
    durationMin: 35,
    frequency: 97,
    weight: 95,
    trend: 'STABLE',
    description:
      'Factory Method, Abstract Factory, Builder with fluent method chaining, and Singleton variants (Double-checked locking, Bill Pugh Holder, Enum singletons).',
    rubricAtoms: [
      'Factory Method vs Abstract Factory',
      'Builder Pattern & Fluent Construction',
      'Thread-Safe Singleton Implementations',
      'Object Creation Decoupling'
    ],
    prerequisites: ['oop-pillars-production', 'solid-srp-ocp'],
    foundedOn: ['solid-srp-ocp']
  },
  {
    slug: 'structural-patterns',
    topicId: 'LLDC02',
    title: 'Structural Design Patterns',
    categorySlug: 'lld-design-patterns',
    pillar: 'components',
    priority: 'P0',
    difficulty: 'INTERMEDIATE',
    durationMin: 35,
    frequency: 95,
    weight: 92,
    trend: 'STABLE',
    description:
      'Adapter pattern (bridging legacy interfaces), Decorator (runtime dynamic capability wrapping), Facade (subsystem simplification), Composite, and Proxy (lazy loading & access control).',
    rubricAtoms: [
      'Adapter Legacy Integration',
      'Decorator Dynamic Feature Wrapping',
      'Facade Unified Interface Boundaries',
      'Proxy Access Control & Caching'
    ],
    prerequisites: ['oop-pillars-production', 'solid-lsp-isp'],
    foundedOn: ['solid-lsp-isp']
  },
  {
    slug: 'behavioral-patterns-events',
    topicId: 'LLDC03',
    title: 'Behavioral Patterns: Decoupling & Events',
    categorySlug: 'lld-design-patterns',
    pillar: 'components',
    priority: 'P0',
    difficulty: 'INTERMEDIATE',
    durationMin: 40,
    frequency: 98,
    weight: 96,
    trend: 'STABLE',
    description:
      'Observer pattern (Event Bus, Pub-Sub, reactive listeners), Strategy pattern (interchangeable pricing, matching, routing algorithms), and Command pattern (encapsulated requests, undo/redo buffers).',
    rubricAtoms: [
      'Observer Pattern & In-Process Event Bus',
      'Strategy Pattern for Interchangeable Algorithms',
      'Command Pattern for Undo/Redo & Transactions',
      'Decoupling Invocations from Executions'
    ],
    prerequisites: ['solid-srp-ocp', 'solid-dip-ioc'],
    foundedOn: ['solid-srp-ocp']
  },
  {
    slug: 'behavioral-patterns-state',
    topicId: 'LLDC04',
    title: 'Behavioral Patterns: State & Workflow',
    categorySlug: 'lld-design-patterns',
    pillar: 'components',
    priority: 'P0',
    difficulty: 'INTERMEDIATE',
    durationMin: 40,
    frequency: 96,
    weight: 94,
    trend: 'STABLE',
    description:
      'State Pattern (modeling finite state machines without conditional branching), Chain of Responsibility (middleware filters, approval pipelines), Template Method, and Iterator patterns.',
    rubricAtoms: [
      'State Pattern Finite State Machine Modeling',
      'Chain of Responsibility Middleware Pipelines',
      'Template Method Invariant Workflows',
      'Preventing Conditional State Explosion'
    ],
    prerequisites: ['ooad-uml-modeling', 'solid-srp-ocp'],
    foundedOn: ['solid-srp-ocp']
  },
  {
    slug: 'architectural-lld-patterns',
    topicId: 'LLDC05',
    title: 'Architectural LLD & Clean Layers',
    categorySlug: 'lld-design-patterns',
    pillar: 'components',
    priority: 'P1',
    difficulty: 'ADVANCED',
    durationMin: 35,
    frequency: 84,
    weight: 82,
    trend: 'RISING',
    description:
      'Model-View-Controller (MVC), Repository Pattern, Ports & Adapters (Hexagonal Architecture), and Domain-Driven Design (DDD) entities, value objects, and domain services.',
    rubricAtoms: [
      'Hexagonal Architecture Ports & Adapters',
      'Repository Pattern Persistence Abstraction',
      'DDD Entities vs Value Objects',
      'Clean Architectural Dependency Inversion'
    ],
    prerequisites: ['solid-dip-ioc', 'structural-patterns'],
    foundedOn: ['solid-dip-ioc']
  },
  {
    slug: 'thread-safe-lru-lfu-cache',
    topicId: 'LLDC06',
    title: 'Thread-Safe In-Memory LRU & LFU Cache',
    categorySlug: 'lld-in-memory-components',
    pillar: 'components',
    priority: 'P0',
    difficulty: 'ADVANCED',
    durationMin: 45,
    frequency: 99,
    weight: 98,
    trend: 'STABLE',
    description:
      'Thread-safe in-memory cache class: O(1) get/put operations using Doubly Linked List + ConcurrentHashMap, ReentrantReadWriteLock, and configurable eviction policies (LRU, LFU, FIFO).',
    rubricAtoms: [
      'O(1) Doubly Linked List + HashMap Mechanics',
      'Thread-Safe ReadWriteLock Concurrency',
      'LFU Frequency List & Min-Frequency Tracking',
      'Eviction Policy Strategy Interfaces'
    ],
    prerequisites: ['concurrency-thread-safety', 'creational-patterns'],
    foundedOn: ['concurrency-thread-safety']
  },
  {
    slug: 'in-memory-rate-limiter',
    topicId: 'LLDC07',
    title: 'Thread-Safe In-Memory Rate Limiter Class',
    categorySlug: 'lld-in-memory-components',
    pillar: 'components',
    priority: 'P0',
    difficulty: 'ADVANCED',
    durationMin: 40,
    frequency: 97,
    weight: 95,
    trend: 'SURGING',
    description:
      'In-memory rate limiter class: Token Bucket and Leaky Bucket algorithms, thread-safe token refill math, sliding window logs, and atomic multi-client quota enforcement.',
    rubricAtoms: [
      'Token Bucket Algorithm Class Design',
      'Leaky Bucket Smoothing Mechanics',
      'Sliding Window Timestamp Ring Buffer',
      'Thread-Safe Atomic Token Refill'
    ],
    prerequisites: ['concurrency-thread-safety', 'behavioral-patterns-events'],
    foundedOn: ['concurrency-thread-safety']
  },
  {
    slug: 'in-memory-pubsub-broker',
    topicId: 'LLDC08',
    title: 'In-Memory Message Broker / Pub-Sub',
    categorySlug: 'lld-in-memory-components',
    pillar: 'components',
    priority: 'P1',
    difficulty: 'ADVANCED',
    durationMin: 45,
    frequency: 90,
    weight: 88,
    trend: 'RISING',
    description:
      'In-memory messaging broker class: Topic partitioning, consumer group offset tracking, bounded blocking queues, thread-safe backpressure management, and fan-out event dispatching.',
    rubricAtoms: [
      'Topic Partitioning & Consumer Groups',
      'Bounded Blocking Queue Backpressure',
      'Thread-Safe Fan-Out Event Dispatch',
      'Consumer Offset Tracking & Idempotency'
    ],
    prerequisites: ['concurrency-thread-safety', 'behavioral-patterns-events'],
    foundedOn: ['concurrency-thread-safety']
  }
];

export const LLD_PILLAR_2_COMPONENTS: TopicSeed[] = RAW_PILLAR_2_COMPONENTS.map((t) => ({
  ...t,
  questions: generateQuestionsForTopic(t as TopicSeed)
}));

