import { CategorySeed } from './types';

export const LLD_CATEGORIES: CategorySeed[] = [
  {
    slug: 'lld-principles-concurrency',
    name: 'OOP Principles, Clean Code & Concurrency',
    description:
      'Object-oriented foundations, encapsulation boundaries, SOLID principles, code smell refactoring, and in-process multithreaded synchronization locks.',
    order: 1,
  },
  {
    slug: 'lld-design-patterns',
    name: 'GoF Design Patterns & Clean Architecture',
    description:
      'Creational, structural, and behavioral design patterns, event-driven decoupling, state machines, and clean hexagonal architecture layers.',
    order: 2,
  },
  {
    slug: 'lld-in-memory-components',
    name: 'High-Performance In-Memory Utilities',
    description:
      'Thread-safe in-memory data structures, LRU/LFU cache eviction, rate limiter token buckets, and pub-sub message brokers.',
    order: 3,
  },
  {
    slug: 'lld-hardware-games',
    name: 'Hardware, State Machines & Board Games',
    description:
      'Machine coding for real-world hardware systems and classic games: Parking Lot, Multi-Car Elevator, Vending Machine, ATM, Smart Lockers, Chess, and Blackjack.',
    order: 4,
  },
  {
    slug: 'lld-booking-financial',
    name: 'Booking, Scheduling & Financial Systems',
    description:
      'Complex transaction workflows: Movie Ticket Booking seat locks, Splitwise debt simplification, Meeting Schedulers, Car Rental, Hotel Reservations, and Stock Brokerage.',
    order: 5,
  },
  {
    slug: 'lld-enterprise-platforms',
    name: 'Enterprise Platforms & Consumer Applications',
    description:
      'Production-scale application design: E-Commerce checkout, Food Delivery fulfillment, StackOverflow Q&A, Social feeds, Sports commentary, and Restaurant KOT.',
    order: 6,
  },
];

