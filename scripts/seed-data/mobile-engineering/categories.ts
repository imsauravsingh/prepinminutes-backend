import { CategorySeed } from './types';

export const MOBILE_ENGINEERING_CATEGORIES: CategorySeed[] = [
  // Tier 1: Universal Mobile Systems Architecture (Categories 1-8)
  {
    slug: 'mobile-architecture-patterns',
    name: 'Client Architecture & State Management',
    description: 'Unidirectional Data Flow (UDF), MVI, MVVM, Clean Architecture, state immutability, side-effect isolation, and event streams.',
    order: 1,
  },
  {
    slug: 'mobile-offline-sync-storage',
    name: 'Offline-First Sync & Local Storage',
    description: 'Optimistic UI mutations, write-ahead logging, delta sync, Last-Write-Wins vs CRDTs, SQLite optimization, and schema migrations.',
    order: 2,
  },
  {
    slug: 'mobile-networking-resilience',
    name: 'Networking, Image Pipelines & Flaky Connection Resilience',
    description: 'HTTP/3 QUIC, gRPC, prefetching, multi-tier disk/memory caching (LRU), bitmap downsampling, and network transition recovery.',
    order: 3,
  },
  {
    slug: 'mobile-performance-profiling',
    name: 'Performance: Frame Hitch Rate, Startup & Battery Profiling',
    description: 'V-Sync display refresh, 60/120fps hitch rate, main-thread jank elimination, cold/warm app startup time, and radio battery efficiency.',
    order: 4,
  },
  {
    slug: 'mobile-security-cryptography',
    name: 'Mobile Security, Cryptography & Secure Enclaves',
    description: 'Hardware-backed keystores (iOS Keychain, Android Keystore), biometric auth, TLS certificate pinning, and anti-tamper obfuscation.',
    order: 5,
  },
  {
    slug: 'mobile-release-cicd-modularization',
    name: 'Release Engineering, App Sizing & Modularization',
    description: 'Mobile CI/CD automation (Fastlane), staged rollouts, feature flags, remote kill switches, dynamic features, and binary size budgeting.',
    order: 6,
  },
  {
    slug: 'mobile-lifecycle-navigation',
    name: 'App Lifecycle, Navigation & Adaptive UI',
    description: 'Foreground/background transitions, deep links, universal links, process death state restoration, accessibility (a11y), and foldables.',
    order: 7,
  },
  {
    slug: 'mobile-quality-observability',
    name: 'Mobile Quality Strategy & Crash Observability',
    description: 'Mobile testing pyramid, network mocking, flaky test mitigation, crash-free user SLAs, ANR diagnostics, and symbolication.',
    order: 8,
  },

  // Tier 2A: Native iOS Track (Categories 9-12)
  {
    slug: 'mobile-ios-swift-concurrency',
    name: 'iOS Swift Concurrency & Language Internals',
    description: 'Swift async/await, Task trees, Actor isolation, @MainActor thread affinity, generics, protocols, and copy-on-write memory layout.',
    order: 9,
  },
  {
    slug: 'mobile-ios-swiftui-uikit',
    name: 'iOS SwiftUI & Modern Rendering Engine',
    description: 'SwiftUI dependency graph, state diffing, @Observable macro, UIViewRepresentable interop, and UICollectionView compositional layouts.',
    order: 10,
  },
  {
    slug: 'mobile-ios-coredata-lifecycle',
    name: 'iOS Memory (ARC), Backgrounding & Persistence',
    description: 'Automatic Reference Counting (ARC), retain cycles, memory graph leaks profiling, BGAppRefreshTask, Core Data faulting, and SwiftData.',
    order: 11,
  },
  {
    slug: 'mobile-ios-testing-quality',
    name: 'iOS Testing & Quality Engineering',
    description: 'XCTest unit suites, asynchronous expectations, XCUITest UI automation, URLProtocol mock stubs, and Swift Testing framework.',
    order: 12,
  },

  // Tier 2B: Native Android Track (Categories 13-16)
  {
    slug: 'mobile-android-kotlin-coroutines',
    name: 'Android Kotlin Coroutines & Reactive Streams',
    description: 'Structured concurrency, CoroutineScope, Dispatchers, cooperative cancellation, SharedFlow, StateFlow, and repeatOnLifecycle.',
    order: 13,
  },
  {
    slug: 'mobile-android-jetpack-compose',
    name: 'Android Jetpack Compose & UI Architecture',
    description: 'Declarative recomposition triggers, slot table internals, rememberSaveable, layout phase vs measure phase, and AndroidView interop.',
    order: 14,
  },
  {
    slug: 'mobile-android-lifecycle-workmanager',
    name: 'Android Process Lifecycle, WorkManager & Room',
    description: 'Process death restoration, LowMemoryKiller (LMK), Dagger Hilt dependency injection scopes, WorkManager constraints, and Room SQLite.',
    order: 15,
  },
  {
    slug: 'mobile-android-testing-quality',
    name: 'Android Testing & Quality Engineering',
    description: 'Local unit tests, Compose UI test rules, Espresso UI matching, UI Automator cross-app automation, and TestCoroutineDispatcher.',
    order: 16,
  },

  // Tier 2C: Cross-Platform Tracks (Categories 17-18)
  {
    slug: 'mobile-crossplatform-react-native',
    name: 'React Native Architecture & Integration',
    description: 'React Native New Architecture, JSI, Fabric renderer, TurboModules, Hermes bytecode engine, React Navigation, and native bridging.',
    order: 17,
  },
  {
    slug: 'mobile-crossplatform-flutter',
    name: 'Flutter Architecture & Platform Channels',
    description: 'Dart asynchronous isolates, Widget/Element/RenderObject trees, Impeller graphics engine, Riverpod/Bloc state, and Platform Channels.',
    order: 18,
  },
];

