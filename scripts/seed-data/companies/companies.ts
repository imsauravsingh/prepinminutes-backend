/**
 * PrepInMinutes — 20 Canonical Tier-1 Tech Companies & Interview Loops (Layer 2)
 * 
 * Governed by: CROSS_CUTTING_INTELLIGENCE_SPEC.md (Section 3) & TASK_EXECUTION_SEQUENCE.md
 */

import { CompanySeed } from "./types";

export const CANONICAL_COMPANIES: CompanySeed[] = [
  {
    slug: "google",
    name: "Google",
    tier: "TIER_1_FAANG",
    culturePhilosophy:
      "Pure algorithmic problem solving (hard DSA), rigorous concurrency, large-scale systems, and Googleiness (intellectual humility, navigating ambiguity).",
    primaryPillars: ["Hard DSA", "Large-Scale System Design", "Concurrency", "Googleiness"],
    websiteUrl: "https://careers.google.com",
    hiringStages: [
      { stageSlug: "technical-phone-screen", roundOrder: 1, isEliminationRound: true, stageWeight: 20 },
      { stageSlug: "live-coding-dsa", roundOrder: 2, isEliminationRound: false, stageWeight: 25 },
      { stageSlug: "live-coding-dsa", roundOrder: 3, isEliminationRound: false, stageWeight: 25 },
      { stageSlug: "system-design-hld", roundOrder: 4, isEliminationRound: false, stageWeight: 20 },
      { stageSlug: "behavioral-leadership", roundOrder: 5, isEliminationRound: false, stageWeight: 10 },
    ],
  },
  {
    slug: "meta",
    name: "Meta",
    tier: "TIER_1_FAANG",
    culturePhilosophy:
      "Fast execution velocity, product architecture, rapid live coding with optimal complexity, and behavioral focus on 'Move Fast' and building social value.",
    primaryPillars: ["Speed of Coding", "System Design", "Product Architecture", "Move Fast"],
    websiteUrl: "https://metacareers.com",
    hiringStages: [
      { stageSlug: "technical-phone-screen", roundOrder: 1, isEliminationRound: true, stageWeight: 20 },
      { stageSlug: "live-coding-dsa", roundOrder: 2, isEliminationRound: false, stageWeight: 25 },
      { stageSlug: "live-coding-dsa", roundOrder: 3, isEliminationRound: false, stageWeight: 25 },
      { stageSlug: "system-design-hld", roundOrder: 4, isEliminationRound: false, stageWeight: 20 },
      { stageSlug: "behavioral-leadership", roundOrder: 5, isEliminationRound: false, stageWeight: 10 },
    ],
  },
  {
    slug: "amazon",
    name: "Amazon",
    tier: "TIER_1_FAANG",
    culturePhilosophy:
      "Customer obsession and strict alignment with the 16 Leadership Principles (LPs). Every technical round embeds behavioral questions; the Bar Raiser holds absolute veto power.",
    primaryPillars: ["16 Leadership Principles", "High-Level System Design", "Low-Level Design", "Customer Obsession"],
    websiteUrl: "https://amazon.jobs",
    hiringStages: [
      { stageSlug: "online-assessment", roundOrder: 1, isEliminationRound: true, stageWeight: 15 },
      { stageSlug: "live-coding-dsa", roundOrder: 2, isEliminationRound: false, stageWeight: 20 },
      { stageSlug: "machine-coding-lld", roundOrder: 3, isEliminationRound: false, stageWeight: 25 },
      { stageSlug: "system-design-hld", roundOrder: 4, isEliminationRound: false, stageWeight: 20 },
      { stageSlug: "bar-raiser-values", roundOrder: 5, isEliminationRound: true, stageWeight: 20 },
    ],
  },
  {
    slug: "apple",
    name: "Apple",
    tier: "TIER_1_FAANG",
    culturePhilosophy:
      "Hardware-software co-design, native performance, memory optimization, low-level OS internals, and secrecy/attention to detail.",
    primaryPillars: ["Low-Level Systems", "Memory & Performance", "Native Architecture", "Attention to Detail"],
    websiteUrl: "https://apple.com/careers",
    hiringStages: [
      { stageSlug: "technical-phone-screen", roundOrder: 1, isEliminationRound: true, stageWeight: 20 },
      { stageSlug: "live-coding-dsa", roundOrder: 2, isEliminationRound: false, stageWeight: 25 },
      { stageSlug: "domain-deep-dive", roundOrder: 3, isEliminationRound: false, stageWeight: 25 },
      { stageSlug: "system-design-hld", roundOrder: 4, isEliminationRound: false, stageWeight: 20 },
      { stageSlug: "behavioral-leadership", roundOrder: 5, isEliminationRound: false, stageWeight: 10 },
    ],
  },
  {
    slug: "netflix",
    name: "Netflix",
    tier: "TIER_1_FAANG",
    culturePhilosophy:
      "High autonomy and responsibility, deep distributed systems, microservice resilience, chaos engineering, and hiring senior individual contributors.",
    primaryPillars: ["Distributed Resiliency", "Microservice Architecture", "Culture of Freedom & Responsibility"],
    websiteUrl: "https://jobs.netflix.com",
    hiringStages: [
      { stageSlug: "technical-phone-screen", roundOrder: 1, isEliminationRound: true, stageWeight: 20 },
      { stageSlug: "system-design-hld", roundOrder: 2, isEliminationRound: false, stageWeight: 30 },
      { stageSlug: "domain-deep-dive", roundOrder: 3, isEliminationRound: false, stageWeight: 25 },
      { stageSlug: "bar-raiser-values", roundOrder: 4, isEliminationRound: true, stageWeight: 25 },
    ],
  },
  {
    slug: "microsoft",
    name: "Microsoft",
    tier: "TIER_1_FAANG",
    culturePhilosophy:
      "Collaborative engineering, solid object-oriented design, enterprise cloud integration, and Growth Mindset.",
    primaryPillars: ["Clean OOP", "System Design", "Algorithmic Foundations", "Growth Mindset"],
    websiteUrl: "https://careers.microsoft.com",
    hiringStages: [
      { stageSlug: "online-assessment", roundOrder: 1, isEliminationRound: true, stageWeight: 15 },
      { stageSlug: "live-coding-dsa", roundOrder: 2, isEliminationRound: false, stageWeight: 25 },
      { stageSlug: "machine-coding-lld", roundOrder: 3, isEliminationRound: false, stageWeight: 25 },
      { stageSlug: "system-design-hld", roundOrder: 4, isEliminationRound: false, stageWeight: 25 },
      { stageSlug: "behavioral-leadership", roundOrder: 5, isEliminationRound: false, stageWeight: 10 },
    ],
  },
  {
    slug: "uber",
    name: "Uber",
    tier: "TIER_1_UNICORN",
    culturePhilosophy:
      "High-throughput real-time dispatch systems, geospatial algorithms, 90-minute live machine coding, and concurrency.",
    primaryPillars: ["Machine Coding", "Real-Time Systems", "High-Throughput HLD", "Concurrency"],
    websiteUrl: "https://uber.com/careers",
    hiringStages: [
      { stageSlug: "online-assessment", roundOrder: 1, isEliminationRound: true, stageWeight: 15 },
      { stageSlug: "machine-coding-lld", roundOrder: 2, isEliminationRound: false, stageWeight: 30 },
      { stageSlug: "live-coding-dsa", roundOrder: 3, isEliminationRound: false, stageWeight: 25 },
      { stageSlug: "system-design-hld", roundOrder: 4, isEliminationRound: false, stageWeight: 20 },
      { stageSlug: "behavioral-leadership", roundOrder: 5, isEliminationRound: false, stageWeight: 10 },
    ],
  },
  {
    slug: "stripe",
    name: "Stripe",
    tier: "TIER_1_UNICORN",
    culturePhilosophy:
      "Practical engineering craftsmanship: live debugging real codebases, API ergonomics, idempotent financial ledger transactions, and clean code.",
    primaryPillars: ["Bug Finding in Production Code", "API Ergonomics", "Financial Idempotency", "System Design"],
    websiteUrl: "https://stripe.com/jobs",
    hiringStages: [
      { stageSlug: "technical-phone-screen", roundOrder: 1, isEliminationRound: true, stageWeight: 20 },
      { stageSlug: "domain-deep-dive", roundOrder: 2, isEliminationRound: false, stageWeight: 25 },
      { stageSlug: "machine-coding-lld", roundOrder: 3, isEliminationRound: false, stageWeight: 25 },
      { stageSlug: "system-design-hld", roundOrder: 4, isEliminationRound: false, stageWeight: 20 },
      { stageSlug: "behavioral-leadership", roundOrder: 5, isEliminationRound: false, stageWeight: 10 },
    ],
  },
  {
    slug: "airbnb",
    name: "Airbnb",
    tier: "TIER_1_UNICORN",
    culturePhilosophy:
      "Full-stack product architecture, cross-functional empathy, Core Values interview, high UI polish, and scalable caching.",
    primaryPillars: ["Product Architecture", "Core Values", "Full-Stack Design", "Caching & Polish"],
    websiteUrl: "https://careers.airbnb.com",
    hiringStages: [
      { stageSlug: "technical-phone-screen", roundOrder: 1, isEliminationRound: true, stageWeight: 20 },
      { stageSlug: "live-coding-dsa", roundOrder: 2, isEliminationRound: false, stageWeight: 25 },
      { stageSlug: "system-design-hld", roundOrder: 3, isEliminationRound: false, stageWeight: 25 },
      { stageSlug: "bar-raiser-values", roundOrder: 4, isEliminationRound: true, stageWeight: 30 },
    ],
  },
  {
    slug: "databricks",
    name: "Databricks",
    tier: "TIER_1_UNICORN",
    culturePhilosophy:
      "Distributed compute engine internals (Spark, Tungsten), lakehouse storage formats (Delta Lake, Iceberg), and extreme runtime efficiency.",
    primaryPillars: ["Distributed Query Execution", "Storage Internals", "C++ / Systems", "Spark Engine"],
    websiteUrl: "https://databricks.com/company/careers",
    hiringStages: [
      { stageSlug: "online-assessment", roundOrder: 1, isEliminationRound: true, stageWeight: 15 },
      { stageSlug: "live-coding-dsa", roundOrder: 2, isEliminationRound: false, stageWeight: 25 },
      { stageSlug: "domain-deep-dive", roundOrder: 3, isEliminationRound: false, stageWeight: 30 },
      { stageSlug: "system-design-hld", roundOrder: 4, isEliminationRound: false, stageWeight: 20 },
      { stageSlug: "behavioral-leadership", roundOrder: 5, isEliminationRound: false, stageWeight: 10 },
    ],
  },
  {
    slug: "snowflake",
    name: "Snowflake",
    tier: "TIER_1_UNICORN",
    culturePhilosophy:
      "Cloud database engine internals, vectorized query engines, multi-tenant concurrency, and resilient cloud storage access.",
    primaryPillars: ["Query Optimizers", "C++ Systems", "Vectorized Execution", "Multi-Tenancy"],
    websiteUrl: "https://careers.snowflake.com",
    hiringStages: [
      { stageSlug: "technical-phone-screen", roundOrder: 1, isEliminationRound: true, stageWeight: 20 },
      { stageSlug: "live-coding-dsa", roundOrder: 2, isEliminationRound: false, stageWeight: 25 },
      { stageSlug: "domain-deep-dive", roundOrder: 3, isEliminationRound: false, stageWeight: 25 },
      { stageSlug: "system-design-hld", roundOrder: 4, isEliminationRound: false, stageWeight: 20 },
      { stageSlug: "behavioral-leadership", roundOrder: 5, isEliminationRound: false, stageWeight: 10 },
    ],
  },
  {
    slug: "doordash",
    name: "DoorDash",
    tier: "TIER_1_UNICORN",
    culturePhilosophy:
      "Practical machine coding, real-time logistics optimization, event-driven streaming, and strong bias for action.",
    primaryPillars: ["Machine Coding", "Logistics Optimization", "Event Streaming", "Bias for Action"],
    websiteUrl: "https://careers.doordash.com",
    hiringStages: [
      { stageSlug: "technical-phone-screen", roundOrder: 1, isEliminationRound: true, stageWeight: 20 },
      { stageSlug: "machine-coding-lld", roundOrder: 2, isEliminationRound: false, stageWeight: 30 },
      { stageSlug: "system-design-hld", roundOrder: 3, isEliminationRound: false, stageWeight: 25 },
      { stageSlug: "behavioral-leadership", roundOrder: 4, isEliminationRound: false, stageWeight: 25 },
    ],
  },
  {
    slug: "block",
    name: "Block (Square)",
    tier: "TIER_1_UNICORN",
    culturePhilosophy:
      "Pair programming with staff engineers, clean modular architecture, financial ledger safety, and open-source craftsmanship.",
    primaryPillars: ["Pair Programming", "Ledger Safety", "Test-Driven Development", "Clean Code"],
    websiteUrl: "https://block.xyz/careers",
    hiringStages: [
      { stageSlug: "technical-phone-screen", roundOrder: 1, isEliminationRound: true, stageWeight: 20 },
      { stageSlug: "machine-coding-lld", roundOrder: 2, isEliminationRound: false, stageWeight: 30 },
      { stageSlug: "system-design-hld", roundOrder: 3, isEliminationRound: false, stageWeight: 25 },
      { stageSlug: "behavioral-leadership", roundOrder: 4, isEliminationRound: false, stageWeight: 25 },
    ],
  },
  {
    slug: "bytedance",
    name: "ByteDance",
    tier: "TIER_1_UNICORN",
    culturePhilosophy:
      "High-velocity LeetCode hard rounds, extreme scale recommendation systems, live video streaming infrastructure, and high concurrency.",
    primaryPillars: ["Hard DSA", "Extreme Scale Recommendation", "Live Video Infra", "Concurrency"],
    websiteUrl: "https://jobs.bytedance.com",
    hiringStages: [
      { stageSlug: "online-assessment", roundOrder: 1, isEliminationRound: true, stageWeight: 15 },
      { stageSlug: "live-coding-dsa", roundOrder: 2, isEliminationRound: false, stageWeight: 30 },
      { stageSlug: "live-coding-dsa", roundOrder: 3, isEliminationRound: false, stageWeight: 25 },
      { stageSlug: "system-design-hld", roundOrder: 4, isEliminationRound: false, stageWeight: 20 },
      { stageSlug: "behavioral-leadership", roundOrder: 5, isEliminationRound: false, stageWeight: 10 },
    ],
  },
  {
    slug: "coinbase",
    name: "Coinbase",
    tier: "TIER_1_UNICORN",
    culturePhilosophy:
      "Blockchain security, cryptographic key management, high-volume order book matching engines, and regulatory compliance.",
    primaryPillars: ["Order Book Engines", "Cryptography", "Security & Concurrency", "High Volume"],
    websiteUrl: "https://coinbase.com/careers",
    hiringStages: [
      { stageSlug: "technical-phone-screen", roundOrder: 1, isEliminationRound: true, stageWeight: 20 },
      { stageSlug: "live-coding-dsa", roundOrder: 2, isEliminationRound: false, stageWeight: 25 },
      { stageSlug: "system-design-hld", roundOrder: 3, isEliminationRound: false, stageWeight: 30 },
      { stageSlug: "bar-raiser-values", roundOrder: 4, isEliminationRound: true, stageWeight: 25 },
    ],
  },
  {
    slug: "spotify",
    name: "Spotify",
    tier: "TIER_1_UNICORN",
    culturePhilosophy:
      "Autonomous engineering squads, client-side caching, audio streaming protocols, and cultural autonomy.",
    primaryPillars: ["Client Architecture", "Audio Streaming", "Squad Autonomy", "Event Driven"],
    websiteUrl: "https://lifeatspotify.com",
    hiringStages: [
      { stageSlug: "technical-phone-screen", roundOrder: 1, isEliminationRound: true, stageWeight: 20 },
      { stageSlug: "domain-deep-dive", roundOrder: 2, isEliminationRound: false, stageWeight: 25 },
      { stageSlug: "system-design-hld", roundOrder: 3, isEliminationRound: false, stageWeight: 25 },
      { stageSlug: "bar-raiser-values", roundOrder: 4, isEliminationRound: true, stageWeight: 30 },
    ],
  },
  {
    slug: "linkedin",
    name: "LinkedIn",
    tier: "TIER_1_UNICORN",
    culturePhilosophy:
      "Distributed log origins (Apache Kafka), distributed consensus, massive graph processing, and 'Member First' values.",
    primaryPillars: ["Kafka Internals", "Distributed Consensus", "Graph Scale", "System Design"],
    websiteUrl: "https://careers.linkedin.com",
    hiringStages: [
      { stageSlug: "online-assessment", roundOrder: 1, isEliminationRound: true, stageWeight: 15 },
      { stageSlug: "live-coding-dsa", roundOrder: 2, isEliminationRound: false, stageWeight: 25 },
      { stageSlug: "system-design-hld", roundOrder: 3, isEliminationRound: false, stageWeight: 30 },
      { stageSlug: "domain-deep-dive", roundOrder: 4, isEliminationRound: false, stageWeight: 20 },
      { stageSlug: "behavioral-leadership", roundOrder: 5, isEliminationRound: false, stageWeight: 10 },
    ],
  },
  {
    slug: "salesforce",
    name: "Salesforce",
    tier: "ENTERPRISE",
    culturePhilosophy:
      "Multi-tenant SaaS database architecture, data security, enterprise CRM workflows, and Ohana culture.",
    primaryPillars: ["Multi-Tenancy", "Enterprise Architecture", "Security & RBAC", "Clean OOP"],
    websiteUrl: "https://salesforce.com/company/careers",
    hiringStages: [
      { stageSlug: "online-assessment", roundOrder: 1, isEliminationRound: true, stageWeight: 15 },
      { stageSlug: "live-coding-dsa", roundOrder: 2, isEliminationRound: false, stageWeight: 25 },
      { stageSlug: "machine-coding-lld", roundOrder: 3, isEliminationRound: false, stageWeight: 25 },
      { stageSlug: "system-design-hld", roundOrder: 4, isEliminationRound: false, stageWeight: 25 },
      { stageSlug: "behavioral-leadership", roundOrder: 5, isEliminationRound: false, stageWeight: 10 },
    ],
  },
  {
    slug: "atlassian",
    name: "Atlassian",
    tier: "ENTERPRISE",
    culturePhilosophy:
      "Values-first culture ('Open Company, No Bullshit'), clean live machine coding, and collaborative distributed teamwork.",
    primaryPillars: ["Values Round", "Machine Coding", "Clean Architecture", "Collaboration"],
    websiteUrl: "https://atlassian.com/company/careers",
    hiringStages: [
      { stageSlug: "technical-phone-screen", roundOrder: 1, isEliminationRound: true, stageWeight: 20 },
      { stageSlug: "machine-coding-lld", roundOrder: 2, isEliminationRound: false, stageWeight: 30 },
      { stageSlug: "system-design-hld", roundOrder: 3, isEliminationRound: false, stageWeight: 25 },
      { stageSlug: "bar-raiser-values", roundOrder: 4, isEliminationRound: true, stageWeight: 25 },
    ],
  },
  {
    slug: "adobe",
    name: "Adobe",
    tier: "ENTERPRISE",
    culturePhilosophy:
      "Digital media pipelines, C++ rendering engines, cloud document collaboration, and secure scalable web services.",
    primaryPillars: ["C++ / Graphics / Media", "Web Architecture", "Document Security", "Microservices"],
    websiteUrl: "https://adobe.com/careers",
    hiringStages: [
      { stageSlug: "online-assessment", roundOrder: 1, isEliminationRound: true, stageWeight: 15 },
      { stageSlug: "live-coding-dsa", roundOrder: 2, isEliminationRound: false, stageWeight: 25 },
      { stageSlug: "domain-deep-dive", roundOrder: 3, isEliminationRound: false, stageWeight: 25 },
      { stageSlug: "system-design-hld", roundOrder: 4, isEliminationRound: false, stageWeight: 25 },
      { stageSlug: "behavioral-leadership", roundOrder: 5, isEliminationRound: false, stageWeight: 10 },
    ],
  },
];
