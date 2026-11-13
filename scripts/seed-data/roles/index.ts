/**
 * PrepInMinutes — 28 Canonical Roles Catalog
 * 
 * Aggregates all 28 canonical engineering roles across 7 standardized career bands
 * and ensures 100% prerequisite closure mapping across all 371 curriculum topics.
 * 
 * Governed by: CROSS_CUTTING_INTELLIGENCE_SPEC.md & TASK_EXECUTION_SEQUENCE.md
 */

import { FRESHER_ROLES } from "./fresher-roles";
import { GENERAL_ROLES } from "./general-roles";
import { BACKEND_ROLES } from "./backend-roles";
import { FRONTEND_ROLES } from "./frontend-roles";
import { MOBILE_ROLES } from "./mobile-roles";
import { CLOUD_DEVOPS_ROLES } from "./cloud-devops-roles";
import { DATA_ROLES } from "./data-roles";
import { AI_ROLES } from "./ai-roles";
import { LEADERSHIP_ROLES } from "./leadership-roles";
import { RoleSeed, RoleTopicRequirement } from "./types";

export * from "./types";

export const CANONICAL_ROLES: RoleSeed[] = [
  ...FRESHER_ROLES,
  ...GENERAL_ROLES,
  ...BACKEND_ROLES,
  ...FRONTEND_ROLES,
  ...MOBILE_ROLES,
  ...CLOUD_DEVOPS_ROLES,
  ...DATA_ROLES,
  ...AI_ROLES,
  ...LEADERSHIP_ROLES,
];

/**
 * Domain-to-Role baseline affinity mapping.
 * Used to guarantee zero dangling topics: any topic not explicitly curated
 * in a role's primary list will be automatically mapped to its natural affinity role
 * as a high-yield elective.
 */
export const DOMAIN_ROLE_AFFINITIES: Record<string, { roleSlug: string; isCore: boolean; priority: number }[]> = {
  "system-design": [
    { roleSlug: "senior-backend-sde", isCore: false, priority: 80 },
    { roleSlug: "senior-general-sde", isCore: false, priority: 78 },
  ],
  "ai-system-design": [
    { roleSlug: "applied-ai-engineer", isCore: false, priority: 82 },
    { roleSlug: "llm-infra-architect", isCore: false, priority: 80 },
  ],
  "low-level-design": [
    { roleSlug: "mid-general-sde", isCore: false, priority: 80 },
    { roleSlug: "mid-backend-sde", isCore: false, priority: 78 },
  ],
  "dsa": [
    { roleSlug: "campus-fresher-sde", isCore: false, priority: 85 },
    { roleSlug: "mid-general-sde", isCore: false, priority: 82 },
  ],
  "backend-engineering": [
    { roleSlug: "mid-backend-sde", isCore: false, priority: 80 },
    { roleSlug: "senior-backend-sde", isCore: false, priority: 78 },
  ],
  "frontend-engineering": [
    { roleSlug: "mid-frontend-sde", isCore: false, priority: 80 },
    { roleSlug: "senior-frontend-sde", isCore: false, priority: 78 },
  ],
  "cloud-devops": [
    { roleSlug: "devops-engineer", isCore: false, priority: 80 },
    { roleSlug: "site-reliability-engineer", isCore: false, priority: 78 },
  ],
  "behavioral-leadership": [
    { roleSlug: "senior-general-sde", isCore: false, priority: 82 },
    { roleSlug: "engineering-manager", isCore: false, priority: 85 },
  ],
  "data-engineering": [
    { roleSlug: "data-platform-engineer", isCore: false, priority: 82 },
    { roleSlug: "analytics-engineer", isCore: false, priority: 80 },
  ],
  "mobile-engineering": [
    { roleSlug: "crossplatform-mobile-engineer", isCore: false, priority: 80 },
    { roleSlug: "ios-native-engineer", isCore: false, priority: 78 },
    { roleSlug: "android-native-engineer", isCore: false, priority: 78 },
  ],
};

