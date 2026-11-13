/**
 * PrepInMinutes — Canonical Interview Stages (Layer 3)
 * 
 * Governed by: CROSS_CUTTING_INTELLIGENCE_SPEC.md (Section 4) & TASK_EXECUTION_SEQUENCE.md
 */

import { InterviewStageSeed } from "./types";

export const CANONICAL_STAGES: InterviewStageSeed[] = [
  {
    slug: "online-assessment",
    name: "Online Assessment (OA)",
    defaultTimeboxMin: 75,
    evaluativeFocus:
      "Automated algorithmic screening, boundary edge cases, time/space complexity invariants, and passing all automated unit and stress tests.",
    targetDomains: ["dsa"],
    formats: [
      {
        formatSlug: "pair-programming-ide",
        isDefault: true,
        pacingNotes: "75m: 2 algorithmic problems with strict automated test execution.",
      },
    ],
  },
  {
    slug: "technical-phone-screen",
    name: "Technical Phone Screen",
    defaultTimeboxMin: 45,
    evaluativeFocus:
      "Live coding fluency, proactive communication, clarifying ambiguous requirements, and basic computer science fundamentals.",
    targetDomains: ["dsa", "backend-engineering"],
    formats: [
      {
        formatSlug: "pair-programming-ide",
        isDefault: true,
        pacingNotes: "5m intros -> 35m coding & dry-run -> 5m candidate questions.",
      },
      {
        formatSlug: "conversational-voice-qa",
        isDefault: false,
        pacingNotes: "Conversational technical probe with live audio.",
      },
    ],
  },
  {
    slug: "live-coding-dsa",
    name: "Live Algorithmic Coding",
    defaultTimeboxMin: 60,
    evaluativeFocus:
      "Data structure selection, algorithm design, space-time complexity analysis, bug-free implementation, and defensive error handling.",
    targetDomains: ["dsa"],
    formats: [
      {
        formatSlug: "pair-programming-ide",
        isDefault: true,
        pacingNotes: "5m problem breakdown -> 15m approach & complexity -> 30m implementation -> 10m test cases & edge cases.",
      },
    ],
  },
  {
    slug: "machine-coding-lld",
    name: "Machine Coding & Low-Level Design",
    defaultTimeboxMin: 90,
    evaluativeFocus:
      "Object-oriented design, SOLID principles, design patterns (Factory, Strategy, Observer), concurrency/thread safety, and working executable code with unit tests.",
    targetDomains: ["low-level-design"],
    formats: [
      {
        formatSlug: "timed-machine-coding",
        isDefault: true,
        pacingNotes: "15m class & schema design -> 60m implementation & concurrency -> 15m unit tests & demo execution.",
      },
      {
        formatSlug: "pair-programming-ide",
        isDefault: false,
        pacingNotes: "Collaborative 60m OOP pair programming session.",
      },
    ],
  },
  {
    slug: "system-design-hld",
    name: "High-Level System Design (HLD)",
    defaultTimeboxMin: 45,
    evaluativeFocus:
      "End-to-end distributed system scalability, non-functional requirements, data modeling (SQL vs NoSQL), caching, partitioning, CAP/PACELC trade-offs, and fault tolerance.",
    targetDomains: ["system-design", "ai-system-design"],
    formats: [
      {
        formatSlug: "interactive-whiteboard",
        isDefault: true,
        pacingNotes: "10m requirements & capacity -> 15m high-level architecture -> 15m deep-dive bottleneck resolution -> 5m wrap-up.",
      },
      {
        formatSlug: "conversational-voice-qa",
        isDefault: false,
        pacingNotes: "Audio-driven architectural trade-off discussion.",
      },
    ],
  },
  {
    slug: "domain-deep-dive",
    name: "Specialized Domain Deep-Dive",
    defaultTimeboxMin: 45,
    evaluativeFocus:
      "Specialized platform internals and advanced production patterns (Swift ARC, Jetpack Compose, Spark Catalyst, Kubernetes CNI, Kafka internals).",
    targetDomains: ["frontend-engineering", "mobile-engineering", "cloud-devops", "data-engineering"],
    formats: [
      {
        formatSlug: "pair-programming-ide",
        isDefault: true,
        pacingNotes: "Deep technical interrogation and live debugging of domain-specific architectures.",
      },
      {
        formatSlug: "conversational-voice-qa",
        isDefault: false,
        pacingNotes: "Technical interview on language runtime internals.",
      },
    ],
  },
  {
    slug: "behavioral-leadership",
    name: "Behavioral & STAR Leadership Round",
    defaultTimeboxMin: 45,
    evaluativeFocus:
      "Structured behavioral stories using Situation-Task-Action-Result (STAR) methodology, ownership, failure resilience, conflict resolution, and customer obsession.",
    targetDomains: ["behavioral-leadership"],
    formats: [
      {
        formatSlug: "conversational-voice-qa",
        isDefault: true,
        pacingNotes: "10m past experience -> 25m behavioral situational probes -> 10m candidate questions.",
      },
    ],
  },
  {
    slug: "bar-raiser-values",
    name: "Bar Raiser & Cultural Calibration",
    defaultTimeboxMin: 45,
    evaluativeFocus:
      "Independent cross-team culture calibration with veto authority (e.g., Amazon Leadership Principles, Googleiness). Evaluates whether the candidate raises the 50th percentile hiring bar.",
    targetDomains: ["behavioral-leadership"],
    formats: [
      {
        formatSlug: "conversational-voice-qa",
        isDefault: true,
        pacingNotes: "Rigorous behavioral probing on company core values and ethical decision-making.",
      },
    ],
  },
  {
    slug: "architecture-defense-rfc",
    name: "Architecture Defense & RFC Review",
    defaultTimeboxMin: 60,
    evaluativeFocus:
      "Staff/Principal candidate defends a real or proposed Architectural Decision Record (ADR), justifying technology selection and multi-system migration paths.",
    targetDomains: ["system-design", "ai-system-design"],
    formats: [
      {
        formatSlug: "written-rfc-defense",
        isDefault: true,
        pacingNotes: "20m architecture presentation -> 35m adversarial technical questioning -> 5m conclusion.",
      },
      {
        formatSlug: "interactive-whiteboard",
        isDefault: false,
        pacingNotes: "Interactive canvas defense of enterprise platform architecture.",
      },
    ],
  },
];

