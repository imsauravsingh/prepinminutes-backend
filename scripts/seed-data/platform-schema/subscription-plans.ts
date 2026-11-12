/**
 * Canonical Subscription Plans & Quota Limits
 * Governed by: DATABASE_ARCHITECTURE_AND_PROGRESS_TRACKING_SPEC.md
 */

export interface SubscriptionPlanDefinition {
  tier: "FREE" | "PRO_MONTHLY" | "PRO_QUARTERLY" | "LIFETIME" | "CAMPUS_ENTERPRISE";
  name: string;
  description: string;
  price: number;
  currency: string;
  billingInterval: "month" | "quarter" | "lifetime" | "annual";
  voiceMinutesLimit: number;
  mockInterviewsLimit: number;
  features: string[];
  isActive: boolean;
}

export const CANONICAL_SUBSCRIPTION_PLANS: SubscriptionPlanDefinition[] = [
  {
    tier: "FREE",
    name: "Free Community",
    description: "Essential interview preparation foundations with basic analytics.",
    price: 0.0,
    currency: "USD",
    billingInterval: "month",
    voiceMinutesLimit: 30.0,
    mockInterviewsLimit: 1,
    features: [
      "Access to Core System Design & Coding Topics",
      "30 Voice Minutes / Month with Sarah AI",
      "1 Full AI Mock Interview with Evaluation Report",
      "3 Practice Sessions / Day",
      "Basic Preparation Roadmap",
    ],
    isActive: true,
  },
  {
    tier: "PRO_MONTHLY",
    name: "Pro Monthly",
    description: "Accelerated interview preparation for active job seekers.",
    price: 29.0,
    currency: "USD",
    billingInterval: "month",
    voiceMinutesLimit: 180.0,
    mockInterviewsLimit: 5,
    features: [
      "Full Access to All 10 Domains & 371 Topics",
      "180 Voice Minutes / Month with Sarah AI",
      "5 Full AI Mock Interviews with 6-Dimension Rubric Diagnostics",
      "Unlimited Daily Practice Sessions & Code Execution",
      "Personalized 5-Factor Prerequisite Roadmap",
      "SuperMemo SM-2 Spaced Repetition Knowledge Health Queue",
      "Company-Specific Interview Stage Drill Mode",
    ],
    isActive: true,
  },
  {
    tier: "PRO_QUARTERLY",
    name: "Pro Quarterly Pass",
    description: "Most popular for candidates targeting interviews in 2–3 months.",
    price: 69.0,
    currency: "USD",
    billingInterval: "quarter",
    voiceMinutesLimit: 600.0,
    mockInterviewsLimit: 18,
    features: [
      "Everything in Pro Monthly (Save 20%)",
      "600 Voice Minutes / Quarter with Sarah AI",
      "18 Full AI Mock Interviews with Deep Dives",
      "Priority Low-Latency Voice Streaming Pipeline",
      "Custom Resume & Job Description Vector RAG Personalization",
      "Unlimited Whiteboard Architecture Diagram Storage in Cloudflare R2",
      "Detailed Strengths & Missing Rubric Atoms Breakdown",
    ],
    isActive: true,
  },
  {
    tier: "LIFETIME",
    name: "Lifetime Founder Pass",
    description: "One-time investment for lifelong career advancement across all levels.",
    price: 199.0,
    currency: "USD",
    billingInterval: "lifetime",
    voiceMinutesLimit: 1200.0, // Monthly fair-use cap
    mockInterviewsLimit: 50,
    features: [
      "Lifetime Access to All Existing & Future Domains (Zero Recurring Fees)",
      "1,200 Voice Minutes / Month Fair Use",
      "Unlimited Practice Sessions & 50 Mock Interviews / Year",
      "Immediate Access to Staff/Principal Architecture Scenarios",
      "VIP Support & Early Access to New Features",
      "Direct Priority Feedback from HOD & Staff Engineering Reviewers",
    ],
    isActive: true,
  },
];

