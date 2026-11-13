/**
 * PrepInMinutes — Mobile Engineering Roles (iOS, Android, Cross-Platform)
 * 
 * Governed by: CROSS_CUTTING_INTELLIGENCE_SPEC.md & TASK_EXECUTION_SEQUENCE.md
 */

import { RoleSeed } from "./types";

export const MOBILE_ROLES: RoleSeed[] = [
  {
    slug: "ios-native-engineer",
    name: "Native iOS Engineer",
    careerBand: "MID_LEVEL",
    track: "mobile",
    description:
      "Native Apple platforms specialist focused on Swift, SwiftUI/UIKit lifecycle, Combine/async-await concurrency, ARC memory optimization, offline CoreData/Realm storage, and high-performance native user interfaces.",
    minProficiency: "L3",
    minExperienceYears: 2,
    maxExperienceYears: 6,
    companyEquivalents: {
      google: "L4-L5 iOS",
      amazon: "L5 iOS SDE",
      meta: "E4-E5 iOS",
      apple: "ICT3-ICT4 iOS Core",
      uber: "L4-L5b iOS",
      spotify: "iOS Engineer",
    },
    requiredTopics: [
      { topicSlug: "mobile-ios-arc-retain-cycles", isCore: true, priorityScore: 98, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "mobile-swift-concurrency-actors", isCore: true, priorityScore: 96, targetLevel: "L3", minimumDifficulty: "ADVANCED" },
      { topicSlug: "mobile-swift-generics-protocols-memory", isCore: true, priorityScore: 92, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "mobile-swiftui-state-diffing", isCore: true, priorityScore: 95, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "mobile-swiftui-uikit-interop-layouts", isCore: true, priorityScore: 90, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "mobile-ios-background-execution-coredata", isCore: true, priorityScore: 94, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "mobile-architecture-patterns", isCore: true, priorityScore: 92, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "mobile-offline-first-crdts", isCore: true, priorityScore: 90, targetLevel: "L3", minimumDifficulty: "ADVANCED" },
      { topicSlug: "mobile-sqlite-engine-migrations", isCore: true, priorityScore: 91, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "mobile-observability-crash-analytics-anr", isCore: true, priorityScore: 94, targetLevel: "L3", minimumDifficulty: "ADVANCED" },
      { topicSlug: "lead-ownership-unblocking-dependencies", isCore: true, priorityScore: 90, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
    ],
  },
  {
    slug: "android-native-engineer",
    name: "Native Android Engineer",
    careerBand: "MID_LEVEL",
    track: "mobile",
    description:
      "Native Android specialist focused on Kotlin coroutines/Flow, Jetpack Compose UI rendering, Room DB migrations, WorkManager background execution, Dagger/Hilt DI, and ART garbage collection profiling.",
    minProficiency: "L3",
    minExperienceYears: 2,
    maxExperienceYears: 6,
    companyEquivalents: {
      google: "L4-L5 Android",
      amazon: "L5 Android SDE",
      meta: "E4-E5 Android",
      uber: "L4-L5b Android",
      spotify: "Android Engineer",
    },
    requiredTopics: [
      { topicSlug: "mobile-android-kotlin-coroutines", isCore: true, priorityScore: 98, targetLevel: "L3", minimumDifficulty: "ADVANCED" },
      { topicSlug: "mobile-android-flow-channels-stateflow", isCore: true, priorityScore: 96, targetLevel: "L3", minimumDifficulty: "ADVANCED" },
      { topicSlug: "mobile-android-compose-architecture-recomposition", isCore: true, priorityScore: 96, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "mobile-android-workmanager-room", isCore: true, priorityScore: 92, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "mobile-android-process-lifecycle-di", isCore: true, priorityScore: 94, targetLevel: "L3", minimumDifficulty: "ADVANCED" },
      { topicSlug: "mobile-architecture-patterns", isCore: true, priorityScore: 92, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "mobile-sqlite-engine-migrations", isCore: true, priorityScore: 90, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "mobile-observability-crash-analytics-anr", isCore: true, priorityScore: 94, targetLevel: "L3", minimumDifficulty: "ADVANCED" },
      { topicSlug: "lead-ownership-unblocking-dependencies", isCore: true, priorityScore: 90, targetLevel: "L3", minimumDifficulty: "INTERMEDIATE" },
    ],
  },
  {
    slug: "crossplatform-mobile-engineer",
    name: "Cross-Platform Mobile Platform Lead",
    careerBand: "SENIOR",
    track: "mobile",
    description:
      "Staff/Senior mobile architect leading cross-platform application architecture using React Native or Flutter, native C++ bridging (JSI/TurboModules), OTA updates, mobile CI/CD pipelines, and shared runtime optimization.",
    minProficiency: "L4",
    minExperienceYears: 4,
    maxExperienceYears: 8,
    companyEquivalents: {
      google: "L5 Flutter / Mobile",
      amazon: "L6 Mobile Lead",
      meta: "E5 React Native Platform",
      uber: "L5b Mobile Platform",
      coinbase: "Senior Mobile Engineer",
    },
    requiredTopics: [
      { topicSlug: "mobile-react-native-new-architecture-jsi", isCore: true, priorityScore: 96, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "mobile-react-native-hermes-performance", isCore: true, priorityScore: 94, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "mobile-react-native-state-navigation", isCore: true, priorityScore: 92, targetLevel: "L4", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "mobile-flutter-dart-widget-rendering", isCore: true, priorityScore: 94, targetLevel: "L4", minimumDifficulty: "INTERMEDIATE" },
      { topicSlug: "mobile-flutter-state-platform-channels", isCore: true, priorityScore: 95, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "mobile-cicd-feature-flags-staged-rollouts", isCore: true, priorityScore: 94, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "mobile-offline-first-crdts", isCore: true, priorityScore: 92, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
      { topicSlug: "lead-technical-disagreements-disagree-commit", isCore: true, priorityScore: 94, targetLevel: "L4", minimumDifficulty: "ADVANCED" },
    ],
  },
];
