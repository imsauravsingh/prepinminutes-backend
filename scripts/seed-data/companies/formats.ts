/**
 * PrepInMinutes — Canonical Interview Formats (Layer 4)
 * 
 * Governed by: CROSS_CUTTING_INTELLIGENCE_SPEC.md (Section 5) & TASK_EXECUTION_SEQUENCE.md
 */

import { InterviewFormatSeed } from "./types";

export const CANONICAL_FORMATS: InterviewFormatSeed[] = [
  {
    slug: "interactive-whiteboard",
    name: "Interactive Whiteboard Canvas",
    defaultTimeboxMin: 45,
    toolingAndPacing:
      "Box-and-arrow visual canvas with pre-built architectural components (DB, Cache, LB, Message Bus). Pacing: 10m Requirements & Sizing -> 15m High-Level Architecture -> 15m Component Deep-Dive -> 5m Resiliency & Scale.",
  },
  {
    slug: "pair-programming-ide",
    name: "Pair Programming Live IDE",
    defaultTimeboxMin: 60,
    toolingAndPacing:
      "Collaborative synchronized editor with language runtimes, automated test suite runners, terminal output, and real-time execution feedback.",
  },
  {
    slug: "timed-machine-coding",
    name: "Timed Machine Coding Workspace",
    defaultTimeboxMin: 90,
    toolingAndPacing:
      "Isolated multi-file development workspace with starter scaffolding, unit test harness, strict 90-minute timebox countdown, and automatic code evaluation.",
  },
  {
    slug: "conversational-voice-qa",
    name: "Conversational Voice Interview Dock",
    defaultTimeboxMin: 45,
    toolingAndPacing:
      "Real-time bidirectional audio dock powered by Cartesia & Gemini AI (Sarah AI Persona) with live waveform visualization, barge-in interruption handling, and deep STAR drill probes.",
  },
  {
    slug: "take-home-assignment",
    name: "Take-Home Project Assignment",
    defaultTimeboxMin: 180,
    toolingAndPacing:
      "Asynchronous repository-based assignment with production requirements, unit/integration test expectations, and GitHub Pull Request review workflow.",
  },
  {
    slug: "written-rfc-defense",
    name: "Written Architecture RFC Defense",
    defaultTimeboxMin: 60,
    toolingAndPacing:
      "Architectural Decision Record (ADR) presentation where candidate defends system trade-offs, capacity numbers, failure recovery, and non-functional requirements under cross-examination.",
  },
];
