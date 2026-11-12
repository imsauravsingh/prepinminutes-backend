/**
 * Platform Global Runtime Settings & Feature Flags
 * Governed by: DATABASE_ARCHITECTURE_AND_PROGRESS_TRACKING_SPEC.md
 */

export interface PlatformConfigDefinition {
  key: string;
  value: string;
  description: string;
  isPublic: boolean;
}

export const CANONICAL_PLATFORM_CONFIGS: PlatformConfigDefinition[] = [
  {
    key: "ai.voice_model_default",
    value: "cartesia-sonic",
    description: "Primary low-latency TTS model provider for Sarah AI conversational voice.",
    isPublic: false,
  },
  {
    key: "ai.sarah_eval_model",
    value: "gemini-1.5-pro",
    description: "LLM engine used for evaluating candidate transcripts against 6-dimension rubric guides.",
    isPublic: false,
  },
  {
    key: "ai.sarah_persona_name",
    value: "Sarah",
    description: "Display persona name of the AI interviewer.",
    isPublic: true,
  },
  {
    key: "ai.sarah_persona_role",
    value: "AI Staff Infrastructure Engineer",
    description: "Professional title & persona of Sarah AI.",
    isPublic: true,
  },
  {
    key: "system.maintenance_mode",
    value: "false",
    description: "Global toggle for maintenance mode. When true, non-admin access is restricted.",
    isPublic: true,
  },
  {
    key: "system.public_signup_enabled",
    value: "true",
    description: "Controls whether new candidate registrations are permitted.",
    isPublic: true,
  },
  {
    key: "quotas.free_voice_minutes_default",
    value: "30.0",
    description: "Default voice minutes allocated upon registration for free accounts.",
    isPublic: false,
  },
  {
    key: "quotas.free_mock_interviews_default",
    value: "1",
    description: "Default mock interviews allocated upon registration for free accounts.",
    isPublic: false,
  },
  {
    key: "sm2.default_ease_factor",
    value: "2.5",
    description: "Initial ease factor multiplier for SuperMemo SM-2 spaced repetition decay.",
    isPublic: false,
  },
  {
    key: "sm2.decay_trigger_score_threshold",
    value: "60.0",
    description: "Session score threshold below which a topic is automatically added to the Revision queue.",
    isPublic: false,
  },
];

