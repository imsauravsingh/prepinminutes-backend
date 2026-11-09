import { TopicSeed } from './types';
import { generateQuestionsForTopic } from './question-generator';

const RAW_PILLAR_1_PRINCIPLES: Omit<TopicSeed, 'questions'>[] = [
  {
    slug: 'oop-pillars-production',
    topicId: 'LLDP01',
    title: 'OOP Pillars in Production',
    categorySlug: 'lld-principles-concurrency',
    pillar: 'principles',
    priority: 'P0',
    difficulty: 'BEGINNER',
    durationMin: 30,
    frequency: 98,
    weight: 95,
    trend: 'STABLE',
    description:
      'Encapsulation boundaries, information hiding, abstraction contracts, inheritance versus composition trade-offs, and dynamic polymorphism dispatch in production runtimes.',
    rubricAtoms: [
      'Encapsulation & Mutability Protection',
      'Abstraction & Interface Contracts',
      'Polymorphism & Dynamic Dispatch',
      'Composition Over Inheritance'
    ],
    prerequisites: []
  },
  {
    slug: 'clean-code-refactoring',
    topicId: 'LLDP02',
    title: 'Clean Code & Code Smells',
    categorySlug: 'lld-principles-concurrency',
    pillar: 'principles',
    priority: 'P1',
    difficulty: 'BEGINNER',
    durationMin: 25,
    frequency: 85,
    weight: 80,
    trend: 'STABLE',
    description:
      'DRY, KISS, YAGNI, Law of Demeter, identifying code smells (God Class, Primitive Obsession, Feature Envy, Long Method), and automated refactoring techniques.',
    rubricAtoms: [
      'Code Smells Identification',
      'Law of Demeter & Coupling',
      'Primitive Obsession Refactoring',
      'God Class Decomposition'
    ],
    prerequisites: ['oop-pillars-production']
  },
  {
    slug: 'ooad-uml-modeling',
    topicId: 'LLDP03',
    title: 'OOAD & Technical Modeling',
    categorySlug: 'lld-principles-concurrency',
    pillar: 'principles',
    priority: 'P1',
    difficulty: 'INTERMEDIATE',
    durationMin: 30,
    frequency: 88,
    weight: 85,
    trend: 'STABLE',
    description:
      'Object-Oriented Analysis and Design (OOAD), UML Class diagrams (associations, aggregations, compositions), Sequence diagrams, Activity diagrams, and State machine specifications.',
    rubricAtoms: [
      'UML Class Diagram Associations',
      'Sequence Diagrams & Message Passing',
      'State Machine Modeling',
      'Use Case Boundary Identification'
    ],
    prerequisites: ['oop-pillars-production']
  },
  {
    slug: 'solid-srp-ocp',
    topicId: 'LLDP04',
    title: 'SOLID: Single Responsibility & Open-Closed',
    categorySlug: 'lld-principles-concurrency',
    pillar: 'principles',
    priority: 'P0',
    difficulty: 'INTERMEDIATE',
    durationMin: 35,
    frequency: 99,
    weight: 98,
    trend: 'STABLE',
    description:
      'Single Responsibility Principle (single reason to change, high cohesion) and Open-Closed Principle (open for extension, closed for modification via polymorphism).',
    rubricAtoms: [
      'Single Reason to Change',
      'Open for Extension Closed for Modification',
      'Polymorphic Extension Strategies',
      'Eliminating Rigid Switch Statements'
    ],
    prerequisites: ['oop-pillars-production']
  },
  {
    slug: 'solid-lsp-isp',
    topicId: 'LLDP05',
    title: 'SOLID: Liskov Substitution & Interface Segregation',
    categorySlug: 'lld-principles-concurrency',
    pillar: 'principles',
    priority: 'P0',
    difficulty: 'INTERMEDIATE',
    durationMin: 35,
    frequency: 96,
    weight: 94,
    trend: 'STABLE',
    description:
      'Liskov Substitution Principle (behavioral subtyping, invariant preservation) and Interface Segregation Principle (role-specific interfaces, avoiding fat interfaces).',
    rubricAtoms: [
      'Behavioral Subtyping & Invariants',
      'Pre-condition and Post-condition Rules',
      'Role-Specific Interface Segregation',
      'Avoiding UnsupportedOperationException'
    ],
    prerequisites: ['solid-srp-ocp']
  },
  {
    slug: 'solid-dip-ioc',
    topicId: 'LLDP06',
    title: 'SOLID: Dependency Inversion & IoC',
    categorySlug: 'lld-principles-concurrency',
    pillar: 'principles',
    priority: 'P0',
    difficulty: 'INTERMEDIATE',
    durationMin: 35,
    frequency: 97,
    weight: 96,
    trend: 'STABLE',
    description:
      'Dependency Inversion Principle (high-level modules depending on abstractions) and Inversion of Control (IoC), constructor dependency injection, and test mockability.',
    rubricAtoms: [
      'High-Level Abstraction Inversion',
      'Constructor Dependency Injection',
      'Inversion of Control (IoC) Patterns',
      'Decoupling Persistence from Business Logic'
    ],
    prerequisites: ['solid-lsp-isp']
  },
  {
    slug: 'concurrency-thread-safety',
    topicId: 'LLDP07',
    title: 'In-Process Concurrency & Thread-Safety',
    categorySlug: 'lld-principles-concurrency',
    pillar: 'principles',
    priority: 'P0',
    difficulty: 'ADVANCED',
    durationMin: 40,
    frequency: 99,
    weight: 99,
    trend: 'SURGING',
    description:
      'In-process multithreading: ReentrantLock, ReadWriteLock, StampedLock, Semaphore, Condition variables, atomic CAS primitives (AtomicInteger), race condition prevention, and deadlock avoidance.',
    rubricAtoms: [
      'ReentrantLock & ReadWriteLock Strategies',
      'Race Condition & Check-Then-Act Prevention',
      'Deadlock Ordering & Coffman Conditions',
      'Atomic Variables & Lock-Free CAS'
    ],
    prerequisites: ['oop-pillars-production']
  }
];

export const LLD_PILLAR_1_PRINCIPLES: TopicSeed[] = RAW_PILLAR_1_PRINCIPLES.map((t) => ({
  ...t,
  questions: generateQuestionsForTopic(t as TopicSeed)
}));

