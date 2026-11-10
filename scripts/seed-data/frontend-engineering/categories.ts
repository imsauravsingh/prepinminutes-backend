import { CategorySeed } from './types';

export const FRONTEND_CATEGORIES: CategorySeed[] = [
  // ==========================================
  // Universal Web Platform Core (6 Categories)
  // ==========================================
  {
    slug: 'fe-browser-rendering',
    name: 'Browser Internals & Rendering Lifecycle',
    description:
      'DOM/CSSOM parsing, Layout (Reflow), Repaint, Compositor GPU layers (will-change, transform), Browser Event Loop macrotasks/microtasks, and Critical Rendering Path.',
    order: 1,
  },
  {
    slug: 'fe-html-css-layout',
    name: 'HTML, CSS & Responsive Architecture',
    description:
      'Semantic HTML5 document parsing, CSS Box Model, specificity calculation, Flexbox vs CSS Grid 2D layout engines, Stacking Contexts (z-index), and Container Queries.',
    order: 2,
  },
  {
    slug: 'fe-performance-vitals',
    name: 'Web Performance & Core Web Vitals',
    description:
      'Largest Contentful Paint (LCP < 2.5s), Interaction to Next Paint (INP < 200ms), Cumulative Layout Shift (CLS < 0.1), dynamic code chunking, tree-shaking, and detached DOM memory leak profiling.',
    order: 3,
  },
  {
    slug: 'fe-security-sandboxing',
    name: 'Web Security & Sandboxing',
    description:
      'Stored/Reflected/DOM XSS, Trusted Types API, Content Security Policy (CSP Level 3 nonces/hashes), SameSite cookies vs CSRF, Clickjacking X-Frame-Options, and CORS preflight.',
    order: 4,
  },
  {
    slug: 'fe-ui-machine-coding',
    name: 'UI Machine Coding & System Design',
    description:
      '60-minute machine coding: virtualized list windowing from scratch (100k items), typeahead autocomplete with AbortController, infinite scroll with IntersectionObserver, and WAI-ARIA accessible design systems.',
    order: 5,
  },
  {
    slug: 'fe-forms-testing-quality',
    name: 'Forms & Frontend Quality Engineering',
    description:
      'Controlled vs uncontrolled form architectures, schema validation with Zod, async validation race conditions, Testing Trophy, React Testing Library (RTL), MSW network mocking, and Playwright E2E automation.',
    order: 6,
  },

  // ==========================================
  // 3-Tier Technology Stacks (6 Categories)
  // ==========================================
  {
    slug: 'fe-lang-javascript',
    name: 'JavaScript Language Ecosystem',
    description:
      '3-Tier JavaScript: Fundamentals (Scopes, Closures, Prototypes) -> Intermediate (Async JS, Event Loop, Promise combinators) -> Advanced (V8 TurboFan JIT, Memory/GC, Proxies & Metaprogramming).',
    order: 7,
  },
  {
    slug: 'fe-lang-typescript',
    name: 'TypeScript UI Architecture',
    description:
      '3-Tier TypeScript in UI: Fundamentals (Types, Interfaces, Generics in props) -> Intermediate (Type Narrowing, Discriminated Unions, Zod inference) -> Advanced (Polymorphism, Conditional Types, Compiler AST).',
    order: 8,
  },
  {
    slug: 'fe-framework-react',
    name: 'React.js Ecosystem',
    description:
      '3-Tier React.js: Fundamentals (Components, Props, State lifecycle) -> Intermediate (Hooks deep-dive, Stale closures, useMemo/useCallback) -> Advanced (Fiber reconciliation, Time-slicing, useTransition).',
    order: 9,
  },
  {
    slug: 'fe-framework-nextjs',
    name: 'Next.js Fullstack Architecture',
    description:
      '3-Tier Next.js: Fundamentals (App Router, Layouts, Image optimization) -> Intermediate (SSR, SSG, ISR, Route Handlers, Middleware) -> Advanced (React Server Components, Suspense streaming, PPR, Hydration).',
    order: 10,
  },
  {
    slug: 'fe-framework-angular',
    name: 'Modern Angular Ecosystem (v17/18/19+)',
    description:
      '3-Tier Modern Angular: Fundamentals (Standalone components, Control flow @if/@for) -> Intermediate (Modern inject() DI, RxJS streams) -> Advanced (Signals, Zoneless reactivity, @defer deferrable views).',
    order: 11,
  },
  {
    slug: 'fe-framework-vue',
    name: 'Vue.js & Nuxt Ecosystem',
    description:
      '3-Tier Vue.js & Nuxt: Fundamentals (Templates, Directives, ref/reactive) -> Intermediate (Composition API, Composables, Pinia state) -> Advanced (Proxy reactivity internals, Nuxt universal SSR).',
    order: 12,
  },
];
