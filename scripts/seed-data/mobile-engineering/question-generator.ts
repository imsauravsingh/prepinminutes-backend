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
  // 1-4: Beginner (L1) - Fundamentals, Architecture & Core Primitives
  {
    difficulty: 'BEGINNER',
    learningLevel: 'L1',
    archetype: 'mechanism',
    titleSuffix: 'Core Architectural Mechanics & State Flow',
    promptTemplate: (t) =>
      `Explain the fundamental architectural mechanisms and state flow of ${t.title}. How does it enforce separation of concerns, manage data flow between the UI and domain layers, and maintain a single source of truth?`,
    rubricGuideTemplate: (t) =>
      `Assesses foundational grasp of ${t.title} internal mechanics, unidirectional data flow, and separation of concerns on modern mobile platforms.`,
    expectedKeywordsTemplate: (t) => [t.rubricAtoms[0] || 'State Flow', 'Single Source of Truth', 'Separation of Concerns', 'UI Tree Binding', 'Immutability'],
    antiPatternsTemplate: () => ['Allowing view components to directly mutate shared state without actions or reducers', 'Coupling platform UI rendering directly to background business logic'],
    scoreOffset: -3,
  },
  {
    difficulty: 'BEGINNER',
    learningLevel: 'L1',
    archetype: 'implementation',
    titleSuffix: 'Idiomatic Component Lifecycle & State Binding',
    promptTemplate: (t) =>
      `Walk through a canonical production-ready implementation of a component or pipeline utilizing ${t.title}. How do you bind UI elements to state emissions while respecting the platform lifecycle?`,
    rubricGuideTemplate: (t) =>
      `Verifies ability to write idiomatic, clean, and lifecycle-aware code for ${t.title} that properly binds and cleans up reactive subscriptions.`,
    expectedKeywordsTemplate: (t) => [t.rubricAtoms[1] || 'Lifecycle Binding', 'State Observation', 'Reactive Emission', 'Resource Disposal', 'Deterministic UI'],
    antiPatternsTemplate: () => ['Subscribing to state streams in views without disposing upon view unmount or deallocation', 'Performing heavy blocking computation directly inside render/body functions'],
    scoreOffset: -4,
  },
  {
    difficulty: 'BEGINNER',
    learningLevel: 'L1',
    archetype: 'trade-off',
    titleSuffix: 'Architectural Trade-offs & State Management Alternatives',
    promptTemplate: (t) =>
      `When designing mobile modules leveraging ${t.title}, compare its design against alternative approaches. What are the key trade-offs regarding cognitive complexity, testability, boilerplate overhead, and runtime efficiency?`,
    rubricGuideTemplate: (t) =>
      `Evaluates understanding of engineering trade-offs when selecting state paradigms, storage abstractions, or rendering approaches for ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['Cognitive Complexity', 'Unit Testability', 'Boilerplate Overhead', 'Runtime Allocation', t.rubricAtoms[0]],
    antiPatternsTemplate: () => ['Adopting over-engineered architectures for simple view states', 'Mixing imperative UI mutation with declarative state trees haphazardly'],
    scoreOffset: -5,
  },
  {
    difficulty: 'BEGINNER',
    learningLevel: 'L1',
    archetype: 'troubleshooting',
    titleSuffix: 'Common Lifecycle Pitfalls & State Inconsistencies',
    promptTemplate: (t) =>
      `What are the most frequent bugs, state loss issues, and lifecycle traps developers encounter when working with ${t.title}? How do you detect and prevent them defensively?`,
    rubricGuideTemplate: (t) =>
      `Tests defensiveness against state loss across screen rotations or backgrounding, stale closures, and race conditions in ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['Lifecycle State Loss', 'Defensive Guardrails', 'Stale Closure Trap', 'State Restoration', t.rubricAtoms[2] || 'Defensive Coding'],
    antiPatternsTemplate: () => ['Assuming views are persistent singletons that survive process suspension or configuration change', 'Ignoring race conditions between concurrent user taps and async responses'],
    scoreOffset: -4,
  },

  // 5-10: Intermediate (L2-L3) - Practical Concurrency, Frame Hitch Rate, Offline Sync & Memory
  {
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L2',
    archetype: 'mechanism',
    titleSuffix: 'Main-Thread Scheduling & Background Dispatching',
    promptTemplate: (t) =>
      `How does ${t.title} interact with the mobile operating system's main thread and background worker pools? Explain thread switching mechanisms, message queue scheduling (RunLoop / Looper), and how thread starvation is prevented.`,
    rubricGuideTemplate: (t) =>
      `Examines deep knowledge of mobile thread dispatching, main-thread runloops, offloading CPU-intensive tasks, and eliminating thread hopping overhead in ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['Main Thread Affinity', 'RunLoop / Looper Dispatch', 'Background Worker Pool', 'Thread Hopping Overhead', t.rubricAtoms[0], t.rubricAtoms[1]],
    antiPatternsTemplate: () => ['Dispatching synchronous I/O or JSON parsing directly onto the UI thread', 'Uncontrolled thread spawning causing thread pool starvation and context-switch churn'],
    scoreOffset: 0,
  },
  {
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L2',
    archetype: 'scenario-based',
    titleSuffix: 'Eliminating Scroll Jank & Frame Hitch Rate under Load',
    promptTemplate: (t) =>
      `Users report noticeable stutter and frame drops (scroll hitch rate exceeding 25ms per second) in a high-velocity feed powered by ${t.title}. Walk through the diagnostic profiling workflow and concrete engineering optimizations to maintain consistent 60/120fps.`,
    rubricGuideTemplate: (t) =>
      `Assesses practical mastery of mobile display synchronization (V-Sync), frame budget calculation (8.33ms / 16.6ms), off-screen layout precomputation, and eliminating view recalculation overhead in ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['Scroll Hitch Rate', 'V-Sync Alignment', 'Frame Budget (8.33ms / 16.6ms)', 'Precomputed Layouts', 'Cell Recycling / Prefetching', t.rubricAtoms[1]],
    antiPatternsTemplate: () => ['Re-measuring or re-allocating view hierarchies inside active scroll delegate callbacks', 'Loading unscaled full-resolution image bitmaps directly into scrolling list items'],
    scoreOffset: 1,
  },
  {
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L3',
    archetype: 'implementation',
    titleSuffix: 'Offline-First Persistence, Optimistic UI & Delta Sync',
    promptTemplate: (t) =>
      `Design an offline-first data persistence and synchronization pipeline incorporating ${t.title}. How do you immediately reflect user interactions optimistically, persist changes in a local database transaction, and reconcile upstream server deltas upon reconnecting?`,
    rubricGuideTemplate: (t) =>
      `Evaluates proficiency in crafting robust offline-first mobile workflows: local write-ahead transactions, optimistic UI mutations, conflict resolution policies, and delta synchronization.`,
    expectedKeywordsTemplate: (t) => ['Optimistic UI Mutation', 'Local Database Transaction', 'Delta Synchronization', 'Conflict Resolution Strategy', 'Write-Ahead Queue', t.rubricAtoms[2] || 'Offline Sync'],
    antiPatternsTemplate: () => ['Blocking user interactions with full-screen modal loading spinners for simple CRUD operations', 'Overwriting local uncommitted changes blindly when fresh server responses arrive'],
    scoreOffset: 0,
  },
  {
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L3',
    archetype: 'code-review',
    titleSuffix: 'Retain Cycles, Leaks & Memory Contention Code Audit',
    promptTemplate: (t) =>
      `You are reviewing a Pull Request introducing complex asynchronous workflows into ${t.title}. What memory management anti-patterns (such as strong reference cycles in closures, escaping delegate references, unclosed reactive streams, or leaky singletons) would you flag?`,
    rubricGuideTemplate: (t) =>
      `Measures code review rigor in identifying mobile memory traps: strong reference captures, uncancelled async jobs, context leaks, and lingering broadcast listeners in ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['Retain Cycle Identification', 'Weak / Unowned Capture', 'Uncancelled Coroutine / Task', 'Context Leak Prevention', 'Reactive Stream Teardown', t.rubricAtoms[0]],
    antiPatternsTemplate: () => ['Capturing self strongly inside escaping closures or asynchronous blocks without weak references', 'Holding strong references to Activity or UI ViewController instances in long-lived singletons'],
    scoreOffset: 1,
  },
  {
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L3',
    archetype: 'troubleshooting',
    titleSuffix: 'Resilient Networking, Flaky Connections & Retry Backoff',
    promptTemplate: (t) =>
      `In mobile production environments operating on flaky 3G/4G networks or elevator transitions, ${t.title} triggers frequent timeout failures and duplicated requests. How do you design an adaptive networking strategy with connection pooling, exponential backoff with jitter, and idempotency keys?`,
    rubricGuideTemplate: (t) =>
      `Tests understanding of low-bandwidth mobile networking: socket connection reuse, idempotency tokens to prevent duplicate charging/mutations, exponential backoff with jitter, and offline request caching.`,
    expectedKeywordsTemplate: (t) => ['Flaky Network Resilience', 'Exponential Backoff with Jitter', 'Idempotency Key Verification', 'Connection Pool Reuse', 'Adaptive Timeout Policy'],
    antiPatternsTemplate: () => ['Retrying failed non-idempotent POST mutations immediately in a tight loop without backoff', 'Hardcoding strict 5-second timeouts that consistently fail on congested cellular networks'],
    scoreOffset: 0,
  },
  {
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L2',
    archetype: 'debugging',
    titleSuffix: 'Diagnosing Memory Leaks, LowMemoryKiller & OOM Crashes',
    promptTemplate: (t) =>
      `Production crash telemetry reveals spikes in Out-of-Memory (OOM) terminations and silent LowMemoryKiller (LMK) process evictions involving ${t.title}. Walk through your step-by-step diagnostic strategy using memory graph profilers, heap dump analysis, and bitmap allocation audits.`,
    rubricGuideTemplate: (t) =>
      `Verifies ability to capture and analyze heap dumps, trace object allocation trees, detect leaked view roots, and audit off-heap native memory buffers in ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['LowMemoryKiller (LMK)', 'Heap Dump Allocation Audit', 'Retained Heap Size', 'Native Bitmap Allocation', 'View Root Leak Isolation'],
    antiPatternsTemplate: () => ['Assuming memory leaks only happen in garbage-collected languages or ARC-managed code', 'Ignoring system trim-memory callbacks (onTrimMemory / applicationDidReceiveMemoryWarning)'],
    scoreOffset: 2,
  },

  // 11-16: Advanced (L3-L4) - Deep Internals, Concurrency, Crash Loops & Device Hardening
  {
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'mechanism',
    titleSuffix: 'Low-Level Rendering Pipeline & Layout Diffing Internals',
    promptTemplate: (t) =>
      `Deep-dive into the low-level rendering pipeline, measure/layout phases, and node diffing algorithms powering ${t.title}. How does the runtime evaluate state mutations, skip redundant subtrees, and issue hardware-accelerated draw calls to the GPU?`,
    rubricGuideTemplate: (t) =>
      `Examines staff-level depth in mobile declarative rendering engines: node graph traversal, tree diffing complexity, stability markers, layout caching, and GPU command buffer batching in ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['Layout Tree Diffing', 'Measure vs Layout Phase', 'Subtree Evaluation Skipping', 'GPU Command Buffers', 'Hardware Acceleration', t.rubricAtoms[0]],
    antiPatternsTemplate: () => ['Assuming declarative UI runtimes rebuild and redraw all native OS views on every state change', 'Mutating view attributes inside layout pass callbacks causing infinite layout loops'],
    scoreOffset: 2,
  },
  {
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'trade-off',
    titleSuffix: 'Structured Concurrency, Actor Isolation & Deadlock Prevention',
    promptTemplate: (t) =>
      `Analyze the concurrency model and thread isolation semantics governing ${t.title}. How does structured concurrency enforce parent-child task lifecycles, and what are the trade-offs between shared-state locking vs isolated actor/dispatcher message-passing in avoiding priority inversions and deadlocks?`,
    rubricGuideTemplate: (t) =>
      `Evaluates understanding of structured concurrency hierarchies, cooperative task cancellation, actor data race protection, priority inversion mitigation, and deadlock prevention in ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['Structured Concurrency Hierarchy', 'Cooperative Cancellation', 'Actor / Thread Isolation', 'Priority Inversion Mitigation', 'Deadlock Elimination', t.rubricAtoms[1]],
    antiPatternsTemplate: () => ['Using unbounded thread pools or raw locks that cause priority inversion between background workers and UI thread', 'Failing to check cooperative cancellation flags inside long-running loops'],
    scoreOffset: 3,
  },
  {
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'failure-analysis',
    titleSuffix: 'Production Crash Loops, Watchdog ANRs & Hotfix Rollbacks',
    promptTemplate: (t) =>
      `A newly deployed app version causes an instant crash loop at launch or triggers widespread Application Not Responding (ANR) / iOS 0x8badf00d watchdog kills related to ${t.title}. How do you isolate the root cause from production crash symbols and execute an automated hotfix rollback or remote feature flag disablement?`,
    rubricGuideTemplate: (t) =>
      `Assesses crisis incident leadership: stack trace symbolication (dSYM / ProGuard mapping), watchdog crash logs, main thread deadlock diagnosis, and staged rollout halting via remote kill switches.`,
    expectedKeywordsTemplate: (t) => ['Watchdog Kill (ANR / 0x8badf00d)', 'Crash Symbolication (dSYM / ProGuard)', 'Remote Kill Switch Activation', 'Main Thread Deadlock Diagnosis', 'Staged Rollout Halt'],
    antiPatternsTemplate: () => ['Attempting an emergency App Store release without having remote feature flag kill switches available', 'Relying on obfuscated stack traces without verifying mapping file deployment'],
    scoreOffset: 3,
  },
  {
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'scenario-based',
    titleSuffix: 'Radio Wakeups, Battery Drain & Background Execution Limits',
    promptTemplate: (t) =>
      `App telemetry shows unexpected battery consumption and background energy spikes traced to ${t.title}. How do you restructure background work to comply with modern OS backgrounding constraints (iOS BackgroundTasks framework / Android WorkManager & Doze mode) and optimize cellular radio power state transitions?`,
    rubricGuideTemplate: (t) =>
      `Evaluates deep knowledge of mobile OS background policies: Doze mode, App Standby buckets, background task expiration timeouts, batching network requests, and avoiding frequent radio awake states.`,
    expectedKeywordsTemplate: (t) => ['Background Execution Limits', 'Doze Mode / App Standby', 'Radio State Transitions (Tail State)', 'WorkManager / BGAppRefreshTask', 'Battery Drain Optimization'],
    antiPatternsTemplate: () => ['Keeping cellular radios active with frequent small heartbeat pings instead of batched payloads', 'Ignoring background task expiration handlers, causing the OS to forcibly terminate the app'],
    scoreOffset: 2,
  },
  {
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'debugging',
    titleSuffix: 'Asynchronous UI Test Flakiness & Deterministic Synchronization',
    promptTemplate: (t) =>
      `Your automated mobile end-to-end and UI test suite exhibits a 15% flakiness rate due to timing races between animation transitions, network stubs, and asynchronous state updates in ${t.title}. How do you eliminate arbitrary sleeps and establish deterministic test synchronization?`,
    rubricGuideTemplate: (t) =>
      `Measures mastery of mobile automated testing frameworks: idling resources, Compose test clocks, custom test dispatchers, network stubbing (URLProtocol / MockWebServer), and eliminating timing flakes.`,
    expectedKeywordsTemplate: (t) => ['Test Flakiness Elimination', 'Idling Resource Synchronization', 'Compose Test Clocks / Dispatchers', 'Mock Network Stubbing', 'Deterministic State Verification'],
    antiPatternsTemplate: () => ['Inserting Thread.sleep() or arbitrary delays in UI tests to wait for animations to complete', 'Relying on live production APIs for continuous integration UI test runs'],
    scoreOffset: 3,
  },
  {
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'troubleshooting',
    titleSuffix: 'Hardware-Backed Key Storage, Biometrics & Security Hardening',
    promptTemplate: (t) =>
      `Design the end-to-end security architecture for authenticating users and protecting sensitive offline tokens utilizing ${t.title}. How do you leverage hardware-backed enclaves (iOS Secure Enclave / Android TEE & StrongBox), biometric prompts, and TLS certificate/public key pinning against reverse engineering?`,
    rubricGuideTemplate: (t) =>
      `Tests comprehensive mobile security: Secure Enclave / TEE asymmetric key generation, biometric access control flags, certificate/public key pinning, and defending against runtime hooking (Frida/Jailbreak).`,
    expectedKeywordsTemplate: (t) => ['Secure Enclave / TEE / StrongBox', 'Biometric Access Control', 'TLS Certificate & Public Key Pinning', 'Anti-Hooking / Jailbreak Detection', 'Encrypted Storage at Rest'],
    antiPatternsTemplate: () => ['Storing unencrypted session tokens in shared preferences, UserDefaults, or plain SQLite', 'Implementing custom home-grown encryption algorithms instead of standard platform cryptographic APIs'],
    scoreOffset: 2,
  },

  // 17-20: Expert (L4-L5) - Modular Architecture, Release Strategy, Cross-Platform Strategy & Observability
  {
    difficulty: 'EXPERT',
    learningLevel: 'L5',
    archetype: 'design-exercise',
    titleSuffix: 'Modular Multi-Package Architecture & Dynamic Binary Sizing',
    promptTemplate: (t) =>
      `Architect a large-scale mobile codebase spanning 40+ engineering feature squads utilizing ${t.title}. Detail the module boundaries (feature, core, domain, api), dependency inversion mechanisms, build graph optimization (Bazel/Tuist/Gradle), and techniques for keeping app download size under cellular download thresholds.`,
    rubricGuideTemplate: (t) =>
      `Evaluates Principal/Staff mobile architectural authority: dependency inversion in multi-module graphs, API module extraction, dynamic feature delivery, compilation caching, and asset optimization to stay below cellular size limits.`,
    expectedKeywordsTemplate: (t) => ['Multi-Module Architecture', 'Dependency Inversion Boundaries', 'Build Graph Optimization', 'Dynamic Feature Delivery', 'App Size Budgeting', t.rubricAtoms[0]],
    antiPatternsTemplate: () => ['Allowing circular dependencies between feature modules, creating a monolithic compilation bottleneck', 'Including uncompressed high-resolution assets and unused third-party SDK bloat in the main binary'],
    scoreOffset: 4,
  },
  {
    difficulty: 'EXPERT',
    learningLevel: 'L5',
    archetype: 'failure-analysis',
    titleSuffix: 'Catastrophic Mobile Launch Outage & Staged Rollout Remediation',
    promptTemplate: (t) =>
      `A critical release containing ${t.title} begins crashing on 12% of devices within 10 minutes of hitting the App Store and Google Play. Because native app store review cycles take hours to days, formulate the emergency incident response strategy: phased ring halting, server-side circuit breaking, runtime configuration toggling, and post-mortem review.`,
    rubricGuideTemplate: (t) =>
      `Assesses crisis engineering leadership on mobile platforms: immediate staged rollout halt, dynamic feature flag disabling, CDN configuration updates to bypass crashing logic, and post-incident regression prevention.`,
    expectedKeywordsTemplate: (t) => ['Phased Rollout Halting', 'Remote Configuration Toggling', 'Server-Side Circuit Breaker', 'App Store Expedited Review', 'Incident Post-Mortem Runbook'],
    antiPatternsTemplate: () => ['Pushing a release to 100% of the user base on day one without phased rings (1% -> 5% -> 20% -> 100%)', 'Lacking server-driven dynamic flags to disable broken mobile features without a binary update'],
    scoreOffset: 5,
  },
  {
    difficulty: 'EXPERT',
    learningLevel: 'L5',
    archetype: 'trade-off',
    titleSuffix: 'Native Specialization vs Cross-Platform Bridge Economics',
    promptTemplate: (t) =>
      `Evaluate the architectural trade-offs of adopting ${t.title} within an enterprise engineering organization. Compare pure native implementations (Swift/Kotlin) against cross-platform frameworks (React Native / Flutter) across startup performance, memory footprints, bridge serialization overhead, engineering velocity, and total cost of ownership (TCO).`,
    rubricGuideTemplate: (t) =>
      `Examines staff-level technology strategy: bridge serialization taxes, memory footprint differentials, access to day-zero platform APIs, team skill allocation, and cross-platform maintenance economics.`,
    expectedKeywordsTemplate: (t) => ['Cross-Platform vs Native TCO', 'Bridge Serialization Tax (JSI / Channels)', 'Startup Latency & Memory Footprint', 'Day-Zero OS API Support', 'Engineering Velocity vs Platform Depth'],
    antiPatternsTemplate: () => ['Treating cross-platform frameworks as a panacea that eliminates the need for native platform expertise', 'Rewriting entire mature native applications without benchmarking real performance gains and trade-offs'],
    scoreOffset: 4,
  },
  {
    difficulty: 'EXPERT',
    learningLevel: 'L5',
    archetype: 'design-exercise',
    titleSuffix: 'Enterprise Mobile Observability, Frozen Frames & 99.9% Crash-Free SLA',
    promptTemplate: (t) =>
      `Design an enterprise-grade mobile observability, performance tracking, and telemetry infrastructure for an application with 50M+ MAU utilizing ${t.title}. Formulate the monitoring pipeline for crash-free users (99.9% SLA), cold/warm start tracking, frozen frames, network latency pings, and battery attribution.`,
    rubricGuideTemplate: (t) =>
      `Assesses ability to lead mobile platform observability: high-precision telemetry sampling, client-side breadcrumbs, distributed tracing across mobile-to-backend calls, frozen frame tracking, and automated release blockers.`,
    expectedKeywordsTemplate: (t) => ['Crash-Free User SLA (99.9%)', 'Client-Side Telemetry Sampling', 'Frozen Frame Detection', 'Distributed Trace Propagation', 'Automated Release Gatekeeping'],
    antiPatternsTemplate: () => ['Sending unthrottled verbose telemetry payloads from client devices, exhausting user cellular data plans', 'Tracking only raw crash counts while ignoring ANRs, frozen frames, and silent background terminations'],
    scoreOffset: 4,
  },
];

export function generateQuestionsForTopic(topic: TopicSeed): QuestionSeed[] {
  const companiesPool = topic.targetCompanies && topic.targetCompanies.length > 0
    ? topic.targetCompanies
    : ['Apple', 'Google', 'Meta', 'Uber', 'Airbnb', 'Spotify', 'Netflix', 'DoorDash'];

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
        `Anchor your answer on the core architectural invariants and platform lifecycles of ${topic.title}.`,
        `Consider memory management, thread dispatching, and mobile-specific battery/network constraints.`,
        `Discuss concrete production trade-offs rather than generic high-level buzzwords.`,
      ],
      followUpProbes: [
        `What happens when the operating system abruptly evicts the background process under memory pressure?`,
        `How would you monitor and measure this metric across millions of diverse mobile devices in production?`,
        `What is the automated rollback or fallback mitigation if this component crashes at launch?`,
      ],
      expectedKeywords: arch.expectedKeywordsTemplate(topic),
      antiPatterns: arch.antiPatternsTemplate(topic),
      frequencyScore,
      companies: companySample,
    };
  });
}

