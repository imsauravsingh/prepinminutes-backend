/**
 * PrepInMinutes — Cloud, DevOps & Site Reliability Engineering Roles
 * 
 * Governed by: CROSS_CUTTING_INTELLIGENCE_SPEC.md & TASK_EXECUTION_SEQUENCE.md
 */

import { RoleSeed } from "./types";

export const CLOUD_DEVOPS_ROLES: RoleSeed[] = [
  {
    slug: "devops-engineer",
    name: "DevOps & CI/CD Engineer",
    careerBand: "MID_LEVEL",
    track: "cloud",
    description:
      "Automation and platform delivery engineer focused on containerization, CI/CD pipeline optimization, infrastructure as code (Terraform), and repeatable deployment workflows.",
    minProficiency: "L3",
    minExperienceYears: 2,
    maxExperienceYears: 5,
    companyEquivalents: {
      google: "L4 DevOps",
      amazon: "L5 Systems / DevOps Engineer",
      meta: "E4 Production Engineer",
      microsoft: "61-62 DevOps",
      uber: "L4 Infrastructure",
    },
    requiredTopics: [
      { topicSlug: "ops-containers-oci-runtimes", isCore: true, priorityScore: 94, targetLevel: "L3", minimumDifficulty: "BEGINNER" },
      { topicSlug: "ops-containers-dockerfile-security", isCore: true, priorityScore: 96, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "ops-k8s-pod-lifecycle-qos", isCore: true, priorityScore: 94, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "ops-k8s-ingress-service-mesh", isCore: true, priorityScore: 92, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "ops-iac-terraform-core", isCore: true, priorityScore: 95, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "ops-iac-terraform-state-ops", isCore: true, priorityScore: 92, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "ops-gitops-argocd-flux", isCore: true, priorityScore: 90, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "ops-linux-process-systemd", isCore: true, priorityScore: 90, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "ops-aws-networking-vpc-iam", isCore: true, priorityScore: 92, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "lead-ownership-unblocking-dependencies", isCore: true, priorityScore: 90, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
    ],
  },
  {
    slug: "site-reliability-engineer",
    name: "Site Reliability Engineer (SRE)",
    careerBand: "SENIOR",
    track: "cloud",
    description:
      "Senior reliability and production systems engineer driving SLOs/SLIs, error budgets, distributed observability, incident command, chaos engineering, and Linux kernel performance.",
    minProficiency: "L4",
    minExperienceYears: 4,
    maxExperienceYears: 8,
    companyEquivalents: {
      google: "L5 Site Reliability Engineer (SRE)",
      amazon: "L6 Systems Engineer / SRE",
      meta: "E5 Production Engineer",
      microsoft: "63-64 SRE",
      netflix: "Senior Core SRE",
      uber: "L5b Site Reliability Engineer",
    },
    requiredTopics: [
      { topicSlug: "ops-linux-kernel-cgroups", isCore: true, priorityScore: 96, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "ops-networking-packet-flow-ebpf", isCore: true, priorityScore: 95, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "ops-k8s-networking-cni", isCore: true, priorityScore: 94, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "ops-k8s-scheduling-autoscaling", isCore: true, priorityScore: 95, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "ops-k8s-snapshots-operators", isCore: true, priorityScore: 94, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "metrics-observability-platform", isCore: true, priorityScore: 96, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "circuit-breaker-bulkhead", isCore: true, priorityScore: 95, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "ops-aws-compute-eks-karpenter", isCore: true, priorityScore: 94, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "ops-sre-blameless-postmortems", isCore: true, priorityScore: 98, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "lead-technical-disagreements-disagree-commit", isCore: true, priorityScore: 94, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
    ],
  },
  {
    slug: "cloud-platform-architect",
    name: "Enterprise Cloud Infrastructure Architect",
    careerBand: "STAFF",
    track: "cloud",
    description:
      "Enterprise infrastructure architect leading multi-cloud strategy, landing zone security boundaries, zero-trust network fabric, service mesh governance, and multi-region disaster recovery.",
    minProficiency: "L5",
    minExperienceYears: 8,
    maxExperienceYears: 12,
    companyEquivalents: {
      google: "L6 Cloud Infrastructure Architect",
      amazon: "L7 Principal Cloud Solutions Architect",
      meta: "E6 Infra Platform Architect",
      microsoft: "65-66 Partner Cloud Architect",
    },
    requiredTopics: [
      { topicSlug: "ops-aws-enterprise-orgs-transitgw", isCore: true, priorityScore: 98, targetLevel: "L5", minimumDifficulty: "ADVANCED" },
      { topicSlug: "ops-gcp-enterprise-shared-vpc-armor", isCore: true, priorityScore: 96, targetLevel: "L5", minimumDifficulty: "ADVANCED" },
      { topicSlug: "ops-azure-landing-zones-frontdoor", isCore: true, priorityScore: 95, targetLevel: "L5", minimumDifficulty: "ADVANCED" },
      { topicSlug: "ops-k8s-networking-cni", isCore: true, priorityScore: 96, targetLevel: "L5", minimumDifficulty: "ADVANCED" },
      { topicSlug: "tradeoffs-technology-selection", isCore: true, priorityScore: 98, targetLevel: "L5", minimumDifficulty: "EXPERT" },
      { topicSlug: "encryption-data-security", isCore: true, priorityScore: 95, targetLevel: "L5", minimumDifficulty: "ADVANCED" },
      { topicSlug: "threat-modeling-defense", isCore: true, priorityScore: 96, targetLevel: "L5", minimumDifficulty: "ADVANCED" },
      { topicSlug: "lead-cross-functional-collaboration", isCore: true, priorityScore: 97, targetLevel: "L5", minimumDifficulty: "EXPERT" },
      { topicSlug: "lead-influence-without-authority-multiteam", isCore: true, priorityScore: 97, targetLevel: "L5", minimumDifficulty: "EXPERT" },
    ],
  },
];
