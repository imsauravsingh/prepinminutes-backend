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
  // 1-4: Beginner (L1) - Fundamentals & Platform Conventions
  {
    difficulty: 'BEGINNER',
    learningLevel: 'L1',
    archetype: 'mechanism',
    titleSuffix: 'Core Platform Architecture & Invariants',
    promptTemplate: (t) =>
      `Explain the fundamental architectural mechanisms and execution lifecycle of ${t.title}. How does the browser engine or framework handle this under standard rendering passes, and what invariants does it maintain?`,
    rubricGuideTemplate: (t) =>
      `Assesses foundational grasp of ${t.title} mechanisms, browser/framework lifecycle guarantees, and core mental models without superficial syntax recall.`,
    expectedKeywordsTemplate: (t) => [t.rubricAtoms[0] || 'Rendering Pipeline', 'Lifecycle Pass', 'Execution Context', 'DOM/Component State', 'Browser Invariants'],
    antiPatternsTemplate: () => ['Confusing paint operations with layout computation', 'Treating state updates as immediate synchronous DOM mutations'],
    scoreOffset: -3,
  },
  {
    difficulty: 'BEGINNER',
    learningLevel: 'L1',
    archetype: 'implementation',
    titleSuffix: 'Idiomatic Implementation & Clean Component Boundaries',
    promptTemplate: (t) =>
      `Walk through a canonical production-ready implementation of ${t.title}. What interfaces, event listeners, and cleanup handlers are required to ensure zero memory leaks and deterministic teardown?`,
    rubricGuideTemplate: (t) =>
      `Verifies ability to write clean, idiomatic, and memory-safe code for ${t.title} following modern web standards.`,
    expectedKeywordsTemplate: (t) => [t.rubricAtoms[1] || 'Component Lifecycle', 'Cleanup Handler', 'Event Delegation', 'Memory Safety', 'Scoped Styles'],
    antiPatternsTemplate: () => ['Forgetting to remove event listeners on unmount', 'Mutating state directly without triggering framework reconcilers'],
    scoreOffset: -4,
  },
  {
    difficulty: 'BEGINNER',
    learningLevel: 'L1',
    archetype: 'trade-off',
    titleSuffix: 'Architectural Alternatives & Performance Trade-offs',
    promptTemplate: (t) =>
      `When designing a user interface relying on ${t.title}, compare its implementation options. What are the trade-offs between runtime flexibility, bundle size, and initial render latency?`,
    rubricGuideTemplate: (t) =>
      `Evaluates understanding of basic engineering trade-offs when choosing between alternative techniques for ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['Bundle Overhead', 'Runtime Performance', 'Developer Ergonomics', 'Initial Paint Latency', t.rubricAtoms[0]],
    antiPatternsTemplate: () => ['Choosing heavy third-party libraries for trivial DOM tasks', 'Ignoring mobile CPU and low-power hardware constraints'],
    scoreOffset: -5,
  },
  {
    difficulty: 'BEGINNER',
    learningLevel: 'L1',
    archetype: 'troubleshooting',
    titleSuffix: 'Common Edge Cases & Defensive Safeguards',
    promptTemplate: (t) =>
      `What are the most frequent runtime bugs and visual glitches encountered with ${t.title} across desktop and mobile browsers? How do you prevent layout shifts or unhandled promise rejections defensively?`,
    rubricGuideTemplate: (t) =>
      `Tests defensiveness against cross-browser rendering inconsistencies, missing dimensions, and race condition exceptions in ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['Layout Shift Prevention', 'Defensive Checks', 'Graceful Degradation', 'Error Boundaries', t.rubricAtoms[2] || 'Cross-Browser'],
    antiPatternsTemplate: () => ['Assuming all browsers execute microtasks with identical frame timings', 'Hardcoding fixed pixel dimensions causing mobile overflow'],
    scoreOffset: -4,
  },

  // 5-10: Intermediate (L2-L3) - Practical UI Architecture, Re-render Optimization & Async Flow
  {
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L2',
    archetype: 'mechanism',
    titleSuffix: 'Reconciliation Dynamics & Re-Render Cascades',
    promptTemplate: (t) =>
      `How does ${t.title} interact with the component reconciliation tree or browser compositing layers? Explain how state or prop mutations trigger re-renders, and how you prevent costly cascade recalculations across the sub-tree.`,
    rubricGuideTemplate: (t) =>
      `Examines deep knowledge of virtual DOM diffing, shallow reference comparisons, component memoization, and compositor layer promotion for ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['Reconciliation Diffing', 'Shallow Reference Equality', 'Component Memoization', 'Cascade Re-renders', t.rubricAtoms[0], t.rubricAtoms[1]],
    antiPatternsTemplate: () => ['Creating inline arrow functions or object literals inside render without memoization', 'Using array indexes as unstable keys'],
    scoreOffset: 0,
  },
  {
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L2',
    archetype: 'scenario-based',
    titleSuffix: 'Real-Time User Interaction & Responsiveness',
    promptTemplate: (t) =>
      `A high-traffic web application receives rapid, bursty user inputs (e.g. typing at 120 WPM, continuous drag gestures) while interacting with ${t.title}. How do you structure the input pipeline to maintain a 60fps / 120fps refresh rate without stutter?`,
    rubricGuideTemplate: (t) =>
      `Tests mastery of debouncing, throttling, non-blocking input handling, and decoupling user keystrokes from heavy downstream DOM operations for ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['Frame Budget (16.6ms)', 'Debounce vs Throttle', 'Passive Event Listeners', 'Input Responsiveness', t.rubricAtoms[2]],
    antiPatternsTemplate: () => ['Performing expensive synchronous computations directly inside scroll or keydown handlers', 'Missing passive event listener flags'],
    scoreOffset: +1,
  },
  {
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L3',
    archetype: 'trade-off',
    titleSuffix: 'Client vs Server Rendering Trade-offs',
    promptTemplate: (t) =>
      `Analyze the architectural trade-offs of ${t.title} between Client-Side Rendering (CSR), Server-Side Rendering (SSR), and Static Site Generation (SSG). What are the exact impacts on TTFB, FCP, and TTI?`,
    rubricGuideTemplate: (t) =>
      `Verifies ability to evaluate rendering strategies against Web Vitals metrics (TTFB, FCP, LCP, TTI) for ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['TTFB vs FCP', 'Time to Interactive (TTI)', 'SSR Hydration Overhead', 'Static Generation (SSG)', t.rubricAtoms[1]],
    antiPatternsTemplate: () => ['Defaulting to full client-side rendering for SEO-critical e-commerce pages', 'Shipping giant server payloads that block main thread hydration'],
    scoreOffset: 0,
  },
  {
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L3',
    archetype: 'implementation',
    titleSuffix: 'Resilient Asynchronous Request Cancellation',
    promptTemplate: (t) =>
      `Design an asynchronous data-fetching workflow incorporating ${t.title} that handles rapid out-of-order responses. How do you implement AbortController signal propagation to guarantee that stale network responses never overwrite the active UI state?`,
    rubricGuideTemplate: (t) =>
      `Evaluates understanding of network race conditions, AbortController cancellation, and synchronizing async state machines in ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['AbortController & AbortSignal', 'Race Condition Elimination', 'Stale Response Discard', 'Async State Machine', t.rubricAtoms[1]],
    antiPatternsTemplate: () => ['Setting state on unmounted components without checking cancellation tokens', 'Ignoring network response arrival ordering'],
    scoreOffset: +1,
  },
  {
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L3',
    archetype: 'code-review',
    titleSuffix: 'Code Review & Anti-Pattern Remediation',
    promptTemplate: (t) =>
      `You are conducting a code review of a pull request introducing ${t.title}. The PR contains subtle anti-patterns around state synchronization, unhandled edge-cases, and potential memory leaks. Review the implementation, identify the defects, and provide the corrected refactoring.`,
    rubricGuideTemplate: (t) =>
      `Evaluates ability to conduct thorough code reviews, identify subtle anti-patterns, and mentor engineers with idiomatic refactorings for ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['Code Review Standards', 'State Synchronization', 'Anti-Pattern Remediation', 'Defensive Typing', 'Clean Refactoring', t.rubricAtoms[0]],
    antiPatternsTemplate: () => ['Focusing only on formatting nits instead of fundamental structural and memory issues', 'Approving PRs with unhandled promise rejections'],
    scoreOffset: 0,
  },
  {
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L3',
    archetype: 'debugging',
    titleSuffix: 'Root Cause Debugging & Test Isolation',
    promptTemplate: (t) =>
      `A flaky integration test in CI fails intermittently on ${t.title} under asynchronous conditions. Walk through how you use network mocking (e.g. MSW) and deterministic test timers to isolate the race condition and establish 100% reproducible test assertions.`,
    rubricGuideTemplate: (t) =>
      `Assesses debugging methodology, eliminating test flakiness, mocking network boundaries with MSW, and testing asynchronous UI state transitions in ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['Flaky Test Isolation', 'MSW Network Mocking', 'Deterministic Timers', 'Async Act Warning', 'Assertion Reliability', t.rubricAtoms[2]],
    antiPatternsTemplate: () => ['Adding arbitrary setTimeout delays to fix flaky test assertions', 'Testing implementation details rather than user-observable outcomes'],
    scoreOffset: +1,
  },

  // 11-16: Advanced (L3-L4) - Deep Internals, Concurrency, Performance & Profiling
  {
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'mechanism',
    titleSuffix: 'Under-the-Hood Fiber Scheduling & Time-Slicing',
    promptTemplate: (t) =>
      `Dissect the internal scheduling mechanism of ${t.title}. How does cooperative multitasking (e.g. React Fiber work loop, MessageChannel scheduling, requestIdleCallback) yield control back to the browser compositor to prevent dropped frames?`,
    rubricGuideTemplate: (t) =>
      `Verifies deep understanding of concurrent fiber work loops, priority lanes, yielding to the browser event loop, and time-slicing mechanics in ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['Fiber Work Loop', 'Priority Lanes', 'Yielding to Main Thread', 'MessageChannel PostMessage', 'Time-Slicing', t.rubricAtoms[0]],
    antiPatternsTemplate: () => ['Assuming time-slicing uses multithreading rather than cooperative single-thread yielding', 'Blocking the main thread with heavy synchronous loops'],
    scoreOffset: +2,
  },
  {
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'troubleshooting',
    titleSuffix: 'Detached DOM Trees & Retained Memory Profiling',
    promptTemplate: (t) =>
      `A single-page application experiences cumulative memory bloat after hours of continuous user sessions involving ${t.title}. Walk through the Chrome DevTools Memory Profiling steps: how do you capture allocation instrumentation, find detached DOM nodes, and trace the retaining path?`,
    rubricGuideTemplate: (t) =>
      `Evaluates proficiency with Chrome DevTools heap snapshots, three-snapshot technique, identifying detached HTML elements, and breaking circular closure references in ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['Detached DOM Trees', 'Heap Snapshot Profiling', 'Retaining Path', 'Closure Scope Retention', 'WeakMap / WeakSet', t.rubricAtoms[2]],
    antiPatternsTemplate: () => ['Keeping global references to removed DOM elements in third-party tooltips or chart instances', 'Assuming garbage collection frees elements held by active event closures'],
    scoreOffset: +2,
  },
  {
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'trade-off',
    titleSuffix: 'Core Web Vitals INP & Long Task Optimization',
    promptTemplate: (t) =>
      `Under the modern Core Web Vitals metric Interaction to Next Paint (INP), a component utilizing ${t.title} registers a failing score of 450ms (threshold <200ms). Dissect the breakdown between Input Delay, Processing Duration, and Presentation Delay, and detail your remediation plan.`,
    rubricGuideTemplate: (t) =>
      `Tests ability to dissect INP phases, break up Long Tasks (>50ms) using scheduler.yield() or transitions, and eliminate forced layout reflows in ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['Interaction to Next Paint (INP)', 'Long Tasks (>50ms)', 'Input Delay Breakdown', 'scheduler.yield() API', 'Presentation Delay', t.rubricAtoms[0]],
    antiPatternsTemplate: () => ['Confusing FID (first input only) with INP (worst interaction across page lifecycle)', 'Running expensive analytics trackers synchronously inside click handlers'],
    scoreOffset: +3,
  },
  {
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'failure-analysis',
    titleSuffix: 'Cascading Forced Synchronous Layouts & Layout Thrashing',
    promptTemplate: (t) =>
      `Analyze a production performance failure where scrolling a complex feed with ${t.title} causes severe frame drops (FPS plummets to 15). Trace how alternating between reading DOM geometry properties (e.g. offsetHeight) and writing style mutations causes catastrophic Layout Thrashing.`,
    rubricGuideTemplate: (t) =>
      `Assesses mastery of the browser layout engine, separating read/write passes, FastDOM patterns, and utilizing transform/opacity for 60fps animations in ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['Layout Thrashing', 'Forced Synchronous Layout', 'offsetTop / clientHeight Reads', 'Batching DOM Mutations', 'CSS will-change GPU Layer', t.rubricAtoms[1]],
    antiPatternsTemplate: () => ['Interleaving DOM read and write calls inside loops or animation frames', 'Animating top/left properties instead of CSS transform'],
    scoreOffset: +2,
  },
  {
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'implementation',
    titleSuffix: 'Virtual List Windowing & Dynamic Row Math',
    promptTemplate: (t) =>
      `Architect a zero-dependency virtual list windowing component for ${t.title} that seamlessly handles 100,000 items with dynamic variable heights. How do you implement binary search offset lookup, overscan buffer padding, and scroll jumping prevention?`,
    rubricGuideTemplate: (t) =>
      `Evaluates mathematical modeling of virtual list windowing: dynamic item size caching, binary search for visible start/end indices, overscan rendering, and scroll anchor stabilization in ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['Virtual Windowing Math', 'Binary Search Offset Lookup', 'Dynamic Height Measurement Cache', 'Overscan Buffer Padding', 'DOM Recycling', t.rubricAtoms[0]],
    antiPatternsTemplate: () => ['Rendering all 100,000 DOM nodes simultaneously causing browser tab crash', 'Recalculating all item heights on every single scroll tick'],
    scoreOffset: +3,
  },
  {
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'design-exercise',
    titleSuffix: 'Component Architecture & Contract Design',
    promptTemplate: (t) =>
      `Design an extensible, accessible component architecture for ${t.title} intended for consumption across multiple product teams. Detail the prop contracts, compound component composition, keyboard focus management, and TypeScript polymorphic typing.`,
    rubricGuideTemplate: (t) =>
      `Evaluates Senior-level component API design, compound component patterns, focus trapping, and polymorphic TypeScript prop definitions for ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['Component API Design', 'Compound Components', 'Polymorphic Typings', 'Focus Management', 'WAI-ARIA Accessibility', t.rubricAtoms[1]],
    antiPatternsTemplate: () => ['Creating deeply nested prop-drilling interfaces instead of compound composition', 'Failing to support keyboard navigation'],
    scoreOffset: +2,
  },

  // 17-20: Expert (L5) - Staff+ Architecture, Enterprise Design Systems & Catastrophic Production Failures
  {
    difficulty: 'EXPERT',
    learningLevel: 'L5',
    archetype: 'failure-analysis',
    titleSuffix: 'Critical Production Incident & Performance Post-Mortem',
    promptTemplate: (t) =>
      `Following a major e-commerce deployment involving ${t.title}, conversion rates dropped by 14% due to an unmonitored INP regression to 1.8 seconds on low-tier mobile Android devices. Author the engineering post-mortem: identify the root architectural cause, diagnostic telemetry, and preventive guards.`,
    rubricGuideTemplate: (t) =>
      `Evaluates Staff-level root cause analysis, real-user monitoring (RUM) attribution, low-end mobile device performance profiling, and continuous performance regression gates for ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['RUM Field Telemetry', 'Long Animation Frame (LoAF) API', 'Low-End Device CPU Throttling', 'Continuous INP Budget Gate', 'Post-Mortem Corrective Actions', t.rubricAtoms[0]],
    antiPatternsTemplate: () => ['Testing performance solely on high-end M-series MacBook pros without device throttling', 'Treating Web Vitals as a post-launch afterthought rather than a PR gate'],
    scoreOffset: +4,
  },
  {
    difficulty: 'EXPERT',
    learningLevel: 'L5',
    archetype: 'design-exercise',
    titleSuffix: 'Staff-Level Design System Token Architecture & Multi-Platform Scalability',
    promptTemplate: (t) =>
      `You are the Principal UI Architect designing an enterprise design system across web, mobile web, and embedded micro-frontends utilizing ${t.title}. Defend your choice of styling paradigm (CSS Variables vs CSS Modules vs Tailwind vs Zero-Runtime CSS-in-JS) and token distribution pipeline against executive leadership.`,
    rubricGuideTemplate: (t) =>
      `Measures technical leadership, design token architecture (W3C standard), CSS runtime performance overhead, micro-frontend style encapsulation, and multi-team developer velocity in ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['Design Tokens (W3C Spec)', 'Zero-Runtime CSS Compilation', 'CSS Custom Properties (Variables)', 'Micro-Frontend Style Isolation', 'TCO & Developer Velocity', t.rubricAtoms[1]],
    antiPatternsTemplate: () => ['Adopting heavy runtime CSS-in-JS libraries that inject style tags dynamically during scroll passes', 'Hardcoding hex colors and spacing tokens across independent team repositories'],
    scoreOffset: +5,
  },
  {
    difficulty: 'EXPERT',
    learningLevel: 'L5',
    archetype: 'troubleshooting',
    titleSuffix: 'Cross-Site Scripting (XSS) & Content Security Policy (CSP) Bypass Forensics',
    promptTemplate: (t) =>
      `A security audit detects a DOM-based XSS vulnerability in an interactive canvas/rich-text component built with ${t.title}. Explain how malicious payloads bypassed standard sanitizers via DOM clobbering, and implement strict Trusted Types and CSP Level 3 nonce enforcement to eradicate the vulnerability.`,
    rubricGuideTemplate: (t) =>
      `Tests deep web security expertise: DOM-based XSS, DOM Clobbering mechanics, Trusted Types API enforcement, and strict Content Security Policy (CSP) headers in ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['DOM Clobbering Forensics', 'Trusted Types API', 'Strict CSP Level 3 Nonce', 'Sanitizer API (DOMPurify)', 'Context-Aware Encoding', t.rubricAtoms[2]],
    antiPatternsTemplate: () => ['Relying on naive regex replacement to sanitize user HTML inputs', 'Using dangerouslySetInnerHTML without strict Trusted Types verification'],
    scoreOffset: +4,
  },
  {
    difficulty: 'EXPERT',
    learningLevel: 'L5',
    archetype: 'mechanism',
    titleSuffix: 'Offline-First Synchronization, CRDTs & Service Worker Cache Hierarchies',
    promptTemplate: (t) =>
      `At enterprise scale, how do you architect an offline-first collaborative web application with ${t.title}? Detail the tripartite synchronization pipeline between the in-memory React state, IndexedDB client storage, Service Worker cache, and the remote server using Conflict-Free Replicated Data Types (CRDTs).`,
    rubricGuideTemplate: (t) =>
      `Verifies top-tier mastery of offline web architecture: Service Worker CacheStorage lifecycle, IndexedDB persistence, CRDT state merge algorithms, and background sync reconciliation for ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['Offline-First Architecture', 'CRDT State Convergence', 'IndexedDB Client Persistence', 'Service Worker CacheStorage', 'Background Sync API', t.rubricAtoms[0], t.rubricAtoms[3] || 'Offline'],
    antiPatternsTemplate: () => ['Treating network connectivity as binary rather than degraded/intermittent ("Lie-Fi")', 'Using Last-Write-Wins without vector clocks leading to silent data overwrites'],
    scoreOffset: +5,
  },
];

export function generateQuestionsForTopic(topic: TopicSeed): QuestionSeed[] {
  const defaultCompanies = topic.targetCompanies && topic.targetCompanies.length > 0
    ? topic.targetCompanies
    : ['Meta', 'Google', 'Vercel', 'Uber', 'Stripe', 'Netflix'];

  return QUESTION_ARCHETYPES.map((arch, idx) => {
    const qNum = String(idx + 1).padStart(2, '0');
    const id = `${topic.topicId}-Q${qNum}`;
    const title = `${topic.title}: ${arch.titleSuffix}`;
    const rawScore = topic.frequency + arch.scoreOffset;
    const frequencyScore = Math.min(100, Math.max(70, rawScore));

    return {
      id,
      title,
      difficulty: arch.difficulty,
      learningLevel: arch.learningLevel,
      archetype: arch.archetype,
      prompt: arch.promptTemplate(topic),
      scaleAnchor: `High-traffic modern web application serving millions of monthly active users across heterogeneous desktop and low-end mobile devices under strict Core Web Vitals SLAs.`,
      rubricGuide: arch.rubricGuideTemplate(topic),
      rubricAtoms: [
        ...topic.rubricAtoms,
        ...arch.expectedKeywordsTemplate(topic).slice(0, 3)
      ],
      hints: [
        `Focus on browser engine execution, DOM reconciliation, or network transport mechanics rather than generic high-level descriptions.`,
        `Consider how the main thread budget (16.6ms for 60fps), layout recalculations, and memory allocation interact under continuous user interaction.`,
        `Structure your answer with clear diagnostic steps, trade-offs, and metrics (e.g. INP, LCP, FPS, memory heap size).`
      ],
      followUpProbes: [
        `How would your architecture change if the component had to execute on low-end budget Android mobile devices with 2GB RAM?`,
        `What specific telemetry or performance observer APIs (e.g. PerformanceObserver, Long Animation Frame API) would you integrate to monitor this in production?`
      ],
      expectedKeywords: arch.expectedKeywordsTemplate(topic),
      antiPatterns: arch.antiPatternsTemplate(topic),
      frequencyScore,
      companies: defaultCompanies
    };
  });
}
