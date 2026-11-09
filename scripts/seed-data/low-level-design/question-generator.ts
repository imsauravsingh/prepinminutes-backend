import { TopicSeed, QuestionSeed } from './types';

interface ArchetypeTemplate {
  slot: number;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  learningLevel: 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
  archetype: QuestionSeed['archetype'];
  titleSuffix: string;
  promptBuilder: (topic: TopicSeed) => string;
  rubricBuilder: (topic: TopicSeed) => string;
  hintsBuilder: (topic: TopicSeed) => string[];
  followUpsBuilder: (topic: TopicSeed) => string[];
  keywordsBuilder: (topic: TopicSeed) => string[];
}

const LLD_QUESTION_ARCHETYPE_TEMPLATES: ArchetypeTemplate[] = [
  // 4 Beginner Questions (L1)
  {
    slot: 1,
    difficulty: 'BEGINNER',
    learningLevel: 'L1',
    archetype: 'conceptual',
    titleSuffix: 'Core Responsibilities & Domain Entity Identification',
    promptBuilder: (t) =>
      `When initiating the low-level design for ${t.title}, what are the core domain entities, their primary responsibilities, and how do you delineate the problem boundary?`,
    rubricBuilder: (t) =>
      `Candidate must identify the primary classes/nouns for ${t.title}, assign single clear responsibilities to each, and outline key domain relationships (${t.rubricAtoms.slice(0, 2).join(', ')}).`,
    hintsBuilder: (t) => [
      `Identify the real-world actors, resources, and transactional entities in ${t.title}.`,
      `Focus on: ${t.rubricAtoms.slice(0, 2).join(', ')}.`
    ],
    followUpsBuilder: (t) => [
      `Which entities represent mutable state versus immutable value objects?`,
      `How do you prevent a God Class from forming around the core orchestrator?`
    ],
    keywordsBuilder: (t) => [t.title, ...t.rubricAtoms.slice(0, 2), 'domain entities', 'responsibilities', 'OOD']
  },
  {
    slot: 2,
    difficulty: 'BEGINNER',
    learningLevel: 'L1',
    archetype: 'implementation',
    titleSuffix: 'Primary Interface Contracts & Class Signatures',
    promptBuilder: (t) =>
      `Define the public interface contracts and class signatures for ${t.title}. What are the primary methods, parameter types, and return values needed to support the core workflow?`,
    rubricBuilder: (t) =>
      `Must provide concrete interface definitions with clear method signatures and return types, avoiding leaky abstractions and keeping method parameters cohesive.`,
    hintsBuilder: (t) => [
      `Write out the interface in Java/TypeScript/C++ that clients will interact with.`,
      `Ensure methods represent domain actions rather than low-level database getters/setters.`
    ],
    followUpsBuilder: (t) => [
      `How do these method signatures accommodate asynchronous or reactive callers?`,
      `What custom exception hierarchy would you define for business rule violations?`
    ],
    keywordsBuilder: (t) => [t.title, 'interface', 'class signature', 'contract', 'methods']
  },
  {
    slot: 3,
    difficulty: 'BEGINNER',
    learningLevel: 'L1',
    archetype: 'conceptual',
    titleSuffix: 'OOP Pillars Application & Information Hiding',
    promptBuilder: (t) =>
      `How are the core OOP pillars (Encapsulation, Abstraction, Polymorphism) practically enforced in the architecture of ${t.title}? What internal state must be strictly encapsulated?`,
    rubricBuilder: (t) =>
      `Candidate must explain how encapsulation protects internal state, how abstraction hides implementation algorithms, and where polymorphism enables interchangeable behavior.`,
    hintsBuilder: (t) => [
      `Consider what internal data structures should NEVER be exposed directly via public getters.`
    ],
    followUpsBuilder: (t) => [
      `Why is returning unmodifiable collections or defensive copies essential here?`,
      `How does encapsulation assist in unit testing isolated components?`
    ],
    keywordsBuilder: (t) => [t.title, 'encapsulation', 'abstraction', 'polymorphism', 'information hiding']
  },
  {
    slot: 4,
    difficulty: 'BEGINNER',
    learningLevel: 'L1',
    archetype: 'comparison',
    titleSuffix: 'Inheritance vs Composition Trade-offs',
    promptBuilder: (t) =>
      `Compare where inheritance vs composition should be applied within ${t.title}. Where would a deep inheritance hierarchy create brittle coupling, and how does composition solve it?`,
    rubricBuilder: (t) =>
      `Candidate must demonstrate the 'Favor composition over inheritance' principle, identifying specific class relationships where interface composition provides better flexibility.`,
    hintsBuilder: (t) => [
      `Think about polymorphic behavior that changes at runtime vs compile-time classification.`
    ],
    followUpsBuilder: (t) => [
      `What happens if a new requirement introduces multiple orthogonal dimensions of variation?`,
      `Can you illustrate a class diagram refactoring from inheritance to composition?`
    ],
    keywordsBuilder: (t) => [t.title, 'composition vs inheritance', 'coupling', 'flexibility', 'subtyping']
  },

  // 6 Intermediate Questions (L2–L3)
  {
    slot: 5,
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L2',
    archetype: 'mechanism',
    titleSuffix: 'Creational Pattern Selection & Object Lifecycles',
    promptBuilder: (t) =>
      `Which Creational Design Pattern (Factory Method, Abstract Factory, Builder, or Singleton) best suits entity creation in ${t.title}? Walk through its implementation and lifecycle management.`,
    rubricBuilder: (t) =>
      `Candidate must justify the chosen creational pattern based on complexity of construction, immutability, or variant hierarchies, explaining how it decouples client instantiation.`,
    hintsBuilder: (t) => [
      `If entities have many optional parameters or complex validation, consider Builder.`,
      `If entity types vary by family or configuration, consider Factory Method or Abstract Factory.`
    ],
    followUpsBuilder: (t) => [
      `If using a Singleton for a central manager, how do you make it thread-safe and test-friendly?`,
      `How does the Builder pattern enforce mandatory vs optional parameters with compile-time checks?`
    ],
    keywordsBuilder: (t) => [t.title, 'creational pattern', 'factory', 'builder', 'singleton', 'instantiation']
  },
  {
    slot: 6,
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L2',
    archetype: 'mechanism',
    titleSuffix: 'Structural Pattern Integration & Adapter/Decorator Fit',
    promptBuilder: (t) =>
      `How would you apply a Structural Pattern (such as Adapter, Decorator, Facade, or Proxy) in ${t.title} to integrate third-party libraries or wrap dynamic capabilities at runtime?`,
    rubricBuilder: (t) =>
      `Must explain how Adapter bridges incompatible interfaces, Decorator wraps runtime features without subclass explosion, or Facade provides a simplified boundary to complex sub-modules.`,
    hintsBuilder: (t) => [
      `Consider how external payments, hardware sensors, or legacy pricing systems connect to your core classes.`
    ],
    followUpsBuilder: (t) => [
      `How does the Decorator pattern comply with Open-Closed Principle during feature enhancements?`,
      `What is the difference between Facade and Adapter in this architectural context?`
    ],
    keywordsBuilder: (t) => [t.title, 'adapter', 'decorator', 'facade', 'structural pattern', 'wrapping']
  },
  {
    slot: 7,
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L2',
    archetype: 'mechanism',
    titleSuffix: 'Behavioral Pattern Selection & Strategy/State Modeling',
    promptBuilder: (t) =>
      `Evaluate Behavioral Patterns for ${t.title}. Where should the Strategy Pattern, State Pattern, or Command Pattern be utilized to govern algorithm selection or entity state transitions?`,
    rubricBuilder: (t) =>
      `Must clearly distinguish between Strategy (interchangeable algorithms) and State (state-dependent behavior transitions), providing clear interface designs for the chosen pattern.`,
    hintsBuilder: (t) => [
      `Does behavior change based on an internal lifecycle state (State Pattern)? Or based on a client configuration/pricing model (Strategy Pattern)?`
    ],
    followUpsBuilder: (t) => [
      `How do you prevent state transition logic from leaking into the context class?`,
      `How does the Command pattern facilitate audit logging, transaction rollbacks, or undo operations?`
    ],
    keywordsBuilder: (t) => [t.title, 'strategy pattern', 'state pattern', 'command pattern', 'behavioral']
  },
  {
    slot: 8,
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L3',
    archetype: 'implementation',
    titleSuffix: 'SOLID: Single Responsibility & Open-Closed Verification',
    promptBuilder: (t) =>
      `Demonstrate how your design for ${t.title} strictly adheres to the Single Responsibility Principle (SRP) and Open-Closed Principle (OCP). Provide code examples of refactoring a violation.`,
    rubricBuilder: (t) =>
      `Candidate must verify that each class has only one reason to change and that new requirements can be added by introducing new classes/implementations rather than modifying existing code.`,
    hintsBuilder: (t) => [
      `Identify an area where adding a new pricing rule, vehicle type, or payment method would require editing an existing 'switch' or 'if-else' block, and refactor it.`
    ],
    followUpsBuilder: (t) => [
      `How does polymorphism replace fragile switch statements across your codebase?`,
      `What automated linting or architectural unit tests can enforce SRP boundaries?`
    ],
    keywordsBuilder: (t) => [t.title, 'SOLID', 'SRP', 'OCP', 'open-closed', 'single-responsibility']
  },
  {
    slot: 9,
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L3',
    archetype: 'comparison',
    titleSuffix: 'SOLID: Liskov Substitution & Interface Segregation Audit',
    promptBuilder: (t) =>
      `Perform an audit of Liskov Substitution Principle (LSP) and Interface Segregation Principle (ISP) across the abstractions in ${t.title}. Where could a subclass violate contract invariants?`,
    rubricBuilder: (t) =>
      `Candidate must explain how throwing UnsupportedOperationException or changing pre/post conditions violates LSP, and demonstrate breaking fat interfaces into role-specific interfaces.`,
    hintsBuilder: (t) => [
      `Do any implementers have empty or throwing stub methods because the interface forced them to implement irrelevant operations?`
    ],
    followUpsBuilder: (t) => [
      `How does ISP guide interface composition using multiple small interfaces?`,
      `What contract tests would you write to verify behavioral subtyping?`
    ],
    keywordsBuilder: (t) => [t.title, 'LSP', 'ISP', 'interface segregation', 'liskov substitution', 'invariants']
  },
  {
    slot: 10,
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L3',
    archetype: 'architecture',
    titleSuffix: 'State Machine Transitions & Entity Lifecycle Integrity',
    promptBuilder: (t) =>
      `Model the complete lifecycle and state transition graph for the core entity in ${t.title}. How do you ensure invalid state transitions are strictly prevented and audited?`,
    rubricBuilder: (t) =>
      `Candidate must draw or specify a state machine (e.g. Draft -> Active -> Suspended -> Completed), show how illegal transitions throw checked domain exceptions, and maintain audit logs.`,
    hintsBuilder: (t) => [
      `List all valid states, valid trigger events, and invalid transitions that must be rejected.`
    ],
    followUpsBuilder: (t) => [
      `How do you handle timeouts or expiration events (e.g., reservation held for 10 minutes)?`,
      `Where is state persisted to survive application restarts without corrupted lifecycles?`
    ],
    keywordsBuilder: (t) => [t.title, 'state machine', 'lifecycle', 'transitions', 'validation', 'integrity']
  },

  // 6 Advanced Questions (L3–L4)
  {
    slot: 11,
    difficulty: 'ADVANCED',
    learningLevel: 'L3',
    archetype: 'troubleshooting',
    titleSuffix: 'Multithreaded Concurrency & Race Condition Identification',
    promptBuilder: (t) =>
      `Analyze the concurrent access patterns in ${t.title}. If 100 threads concurrently invoke the core business methods, exactly where can race conditions, dirty reads, or double-allocations occur?`,
    rubricBuilder: (t) =>
      `Candidate must pinpoint the exact shared mutable state (counters, collections, entity statuses) vulnerable to thread interleaving and explain the catastrophic business consequences of an uncoordinated check-then-act.`,
    hintsBuilder: (t) => [
      `Look for check-then-act sequences (e.g. if (spot.isFree()) { spot.book(); }).`,
      `Focus on: ${t.rubricAtoms.slice(1, 3).join(', ')}.`
    ],
    followUpsBuilder: (t) => [
      `Why is using a standard HashMap or ArrayList in this critical section fatal?`,
      `How does thread scheduling jitter expose sporadic race conditions in production?`
    ],
    keywordsBuilder: (t) => [t.title, 'race condition', 'concurrency', 'multithreading', 'check-then-act', 'critical section']
  },
  {
    slot: 12,
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'implementation',
    titleSuffix: 'Synchronization Primitives & Locking Strategy',
    promptBuilder: (t) =>
      `Implement a thread-safe locking strategy for ${t.title} using explicit concurrency primitives (e.g., ReentrantLock, ReadWriteLock, StampedLock, or Atomic variables). Show the code block.`,
    rubricBuilder: (t) =>
      `Must provide proper lock acquisition and release within try-finally blocks, choosing ReadWriteLock for read-heavy operations or fine-grained locks instead of naive synchronized methods.`,
    hintsBuilder: (t) => [
      `Ensure lock.unlock() is always in a finally block to prevent permanent thread deadlocks on exceptions.`
    ],
    followUpsBuilder: (t) => [
      `What is the throughput difference between ReentrantReadWriteLock and a global synchronized block here?`,
      `When should optimistic reading with StampedLock be preferred?`
    ],
    keywordsBuilder: (t) => [t.title, 'ReentrantLock', 'ReadWriteLock', 'synchronization', 'try-finally', 'thread-safe']
  },
  {
    slot: 13,
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'failure-analysis',
    titleSuffix: 'Deadlock Prevention & Resource Acquisition Ordering',
    promptBuilder: (t) =>
      `Identify scenarios in ${t.title} where acquiring locks on multiple resources simultaneously could cause a deadlock (e.g. transfer between accounts, moving between two spots). How do you enforce global lock ordering?`,
    rubricBuilder: (t) =>
      `Candidate must explain the Coffman conditions, illustrate circular wait, and implement strict resource ordering (e.g., ordering by unique entity ID or hash code) to guarantee deadlock-free locking.`,
    hintsBuilder: (t) => [
      `If Thread A locks Resource 1 then needs Resource 2, while Thread B locks Resource 2 then needs Resource 1, a deadlock occurs. Sort the locks before acquiring.`
    ],
    followUpsBuilder: (t) => [
      `How can tryLock() with timeout be used as a circuit-breaker against indefinite deadlocks?`,
      `What diagnostic JVM tools (jstack, thread dumps) verify deadlock existence?`
    ],
    keywordsBuilder: (t) => [t.title, 'deadlock', 'lock ordering', 'Coffman conditions', 'circular wait', 'tryLock']
  },
  {
    slot: 14,
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'scenario-based',
    titleSuffix: 'Extensibility Scenario: Adding New Features Without Code Modifications',
    promptBuilder: (t) =>
      `A new product requirement arises: "Support dynamic VIP surge pricing and promotional coupon overrides" in ${t.title}. Walk through how your design accommodates this requirement without modifying existing core classes.`,
    rubricBuilder: (t) =>
      `Candidate must demonstrate the Open-Closed Principle by adding a new Strategy or Decorator implementation, registering it via dependency injection or a registry, leaving core workflows untouched.`,
    hintsBuilder: (t) => [
      `Show which interface you implement and how the orchestrator discovers or executes it.`
    ],
    followUpsBuilder: (t) => [
      `How do multiple discount strategies compose together (e.g., percentage off + flat discount)?`,
      `How do you handle conflicting strategy rules gracefully?`
    ],
    keywordsBuilder: (t) => [t.title, 'extensibility', 'open-closed', 'refactoring', 'strategy', 'plugin']
  },
  {
    slot: 15,
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'architecture',
    titleSuffix: 'Event-Driven Observer Architecture & Decoupled Notifications',
    promptBuilder: (t) =>
      `Design an in-process Event Bus / Observer pattern for ${t.title} so that downstream components (e.g., notification dispatch, analytics logging, audit trails) react to state changes without direct coupling.`,
    rubricBuilder: (t) =>
      `Candidate must define domain event objects, an EventPublisher interface, subscriber registrations, and explain how to handle synchronous vs asynchronous event processing.`,
    hintsBuilder: (t) => [
      `Define an immutable DomainEvent class containing the timestamp, entity ID, and event payload.`
    ],
    followUpsBuilder: (t) => [
      `What happens if one event subscriber throws an unhandled runtime exception?`,
      `How do you prevent event storming or infinite event loops between subscribers?`
    ],
    keywordsBuilder: (t) => [t.title, 'observer pattern', 'event bus', 'domain events', 'pub-sub', 'decoupling']
  },
  {
    slot: 16,
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'implementation',
    titleSuffix: 'Unit Testing, Test-Driven Design & Mocking Strategy',
    promptBuilder: (t) =>
      `Outline a comprehensive unit and integration testing strategy for ${t.title}. What test doubles (mocks, stubs, fakes) are needed, and how do you write deterministic tests for race conditions?`,
    rubricBuilder: (t) =>
      `Candidate must detail unit tests for core domain logic, mock external dependencies via interface boundaries, and employ CountDownLatch / ExecutorService to write concurrent multi-threaded stress tests.`,
    hintsBuilder: (t) => [
      `Use CountDownLatch to release 50 threads simultaneously against the method under test.`
    ],
    followUpsBuilder: (t) => [
      `How do you mock time-dependent logic (e.g., expirations after 15 minutes) deterministically?`,
      `What code coverage targets and mutation testing tools would you enforce?`
    ],
    keywordsBuilder: (t) => [t.title, 'unit testing', 'CountDownLatch', 'mocks', 'TDD', 'concurrent tests']
  },

  // 4 Expert Questions (L5)
  {
    slot: 17,
    difficulty: 'EXPERT',
    learningLevel: 'L5',
    archetype: 'trade-off',
    titleSuffix: 'High-Throughput Lock Contention Reduction & Striped Locking',
    promptBuilder: (t) =>
      `Under an extreme load of 50,000 requests per second on a 64-core machine, global lock contention becomes the primary bottleneck in ${t.title}. How do you re-architect the data structures using lock striping, lock-free CAS, or actor models?`,
    rubricBuilder: (t) =>
      `Must demonstrate advanced concurrency concepts: LongAdder / Striped64, lock striping by hash keys (similar to ConcurrentHashMap), lock-free algorithms with AtomicReference CAS loops, or single-threaded event loop partitions.`,
    hintsBuilder: (t) => [
      `Partition the global shared state so threads operate on independent segments without competing for the same lock.`
    ],
    followUpsBuilder: (t) => [
      `What is false sharing in CPU cache lines, and how do cache line padding annotations (@Contended) resolve it?`,
      `How does the Disruptor ring buffer pattern compare to striped locking in throughput?`
    ],
    keywordsBuilder: (t) => [t.title, 'lock striping', 'CAS', 'lock-free', 'contention', 'high-throughput', 'L5']
  },
  {
    slot: 18,
    difficulty: 'EXPERT',
    learningLevel: 'L5',
    archetype: 'failure-analysis',
    titleSuffix: 'Failure Recovery, Timeout Sweepers & Transaction Rollback',
    promptBuilder: (t) =>
      `If an operation fails halfway through execution in ${t.title} (e.g., network disconnect after reserving resources but before payment confirmation), how does your low-level design guarantee atomicity and self-healing?`,
    rubricBuilder: (t) =>
      `Must design compensatory rollback actions (Unit of Work / Saga at the in-memory level), background timeout sweepers using scheduled executor pools, and idempotent state reconciliation.`,
    hintsBuilder: (t) => [
      `Consider a background daemon thread that periodically queries and sweeps expired holds.`
    ],
    followUpsBuilder: (t) => [
      `How do you prevent race conditions between the user completing an action and the sweeper reclaiming the resource?`,
      `What idempotency keys or version tokens are stored on the entity to prevent duplicate execution?`
    ],
    keywordsBuilder: (t) => [t.title, 'rollback', 'timeout sweeper', 'atomicity', 'self-healing', 'idempotency']
  },
  {
    slot: 19,
    difficulty: 'EXPERT',
    learningLevel: 'L5',
    archetype: 'architecture',
    titleSuffix: 'Clean Architecture & Hexagonal Ports/Adapters Isolation',
    promptBuilder: (t) =>
      `Structure the package and dependency hierarchy of ${t.title} according to Hexagonal Architecture (Ports & Adapters). How are domain entities strictly isolated from databases, UI, and external protocols?`,
    rubricBuilder: (t) =>
      `Candidate must illustrate concentric architectural rings: Domain Model (pure POJO/dataclass with zero dependencies) -> Application Services (Use Cases) -> Inbound/Outbound Ports -> Adapters (DB/Web/Hardware).`,
    hintsBuilder: (t) => [
      `The core domain model must not import any database (JPA/SQL), web framework (Spring/Express), or external vendor libraries.`
    ],
    followUpsBuilder: (t) => [
      `How do Outbound Ports (Repositories) invert the dependency between business logic and database persistence?`,
      `How does this clean separation make swapping out an in-memory test store for PostgreSQL trivial?`
    ],
    keywordsBuilder: (t) => [t.title, 'hexagonal architecture', 'ports and adapters', 'clean architecture', 'dependency rule']
  },
  {
    slot: 20,
    difficulty: 'EXPERT',
    learningLevel: 'L5',
    archetype: 'follow-up-probe',
    titleSuffix: 'Production Machine Coding Rubric & Staff-Level Evaluation',
    promptBuilder: (t) =>
      `You are the Principal Interviewer conducting a 90-minute Machine Coding evaluation on ${t.title}. What is your rigorous grading rubric across Code Modularity, Concurrency Safety, Error Handling, and Testability?`,
    rubricBuilder: (t) =>
      `Must detail an executive machine coding evaluation framework: 1) Working executable code (30%), 2) SOLID & Pattern Modularity (25%), 3) Thread-Safety & Edge Cases (25%), 4) Clean Code & Unit Tests (20%).`,
    hintsBuilder: (t) => [
      `Outline the exact green flags (clean abstractions, thread-safety, graceful error handling) and fatal red flags (God class, raw mutable state, ignoring concurrency).`
    ],
    followUpsBuilder: (t) => [
      `What candidate mistakes immediately downgrade an interview from Senior to Junior?`,
      `How do you guide a candidate who prematurely optimizes before establishing a correct working domain model?`
    ],
    keywordsBuilder: (t) => [t.title, 'machine coding rubric', 'code review', 'evaluation', 'staff engineer', 'grading']
  }
];

export function generateQuestionsForTopic(topic: TopicSeed): QuestionSeed[] {
  return LLD_QUESTION_ARCHETYPE_TEMPLATES.map((tmpl) => ({
    id: `q_${topic.slug.replace(/-/g, '_')}_${String(tmpl.slot).padStart(2, '0')}`,
    title: `${topic.title}: ${tmpl.titleSuffix}`,
    difficulty: tmpl.difficulty,
    learningLevel: tmpl.learningLevel,
    archetype: tmpl.archetype,
    prompt: tmpl.promptBuilder(topic),
    scaleAnchor: topic.pillar === 'case-studies' ? '10K Concurrent Users / 50K QPS In-Process' : undefined,
    rubricGuide: tmpl.rubricBuilder(topic),
    rubricAtoms: [
      ...topic.rubricAtoms.slice(0, 3),
      tmpl.titleSuffix,
      tmpl.archetype
    ],
    hints: tmpl.hintsBuilder(topic),
    followUpProbes: tmpl.followUpsBuilder(topic),
    expectedKeywords: tmpl.keywordsBuilder(topic),
    antiPatterns: [
      'God class / Monolithic manager holding all state and logic',
      'Ignoring multithreaded concurrency and race conditions',
      'Violating Open-Closed Principle with rigid switch statements',
      'Leaking internal mutable collections directly to callers'
    ]
  }));
}

