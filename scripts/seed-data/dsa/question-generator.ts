import { TopicSeed, QuestionSeed } from './types';

interface ArchetypeTemplate {
  slot: number;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  learningLevel: 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
  archetype: QuestionSeed['archetype'];
  titleSuffix: string;
  isTop150Slot: boolean;
  isBlind75Slot: boolean;
  promptBuilder: (topic: TopicSeed) => string;
  rubricBuilder: (topic: TopicSeed) => string;
  hintsBuilder: (topic: TopicSeed) => string[];
  followUpsBuilder: (topic: TopicSeed) => string[];
  keywordsBuilder: (topic: TopicSeed) => string[];
}

const DSA_QUESTION_ARCHETYPE_TEMPLATES: ArchetypeTemplate[] = [
  // 4 Beginner Questions (L1)
  {
    slot: 1,
    difficulty: 'BEGINNER',
    learningLevel: 'L1',
    archetype: 'conceptual',
    titleSuffix: 'Pattern Mental Model & Brute-Force Baseline',
    isTop150Slot: false,
    isBlind75Slot: false,
    promptBuilder: (t) =>
      `Explain the core intuition behind the ${t.title} pattern. When presented with a raw problem, what signature constraints indicate this pattern applies, and what is the naive brute-force baseline?`,
    rubricBuilder: (t) =>
      `Candidate must define the pattern, articulate the giveaway constraints (${t.rubricAtoms.slice(0, 2).join(', ')}), and contrast the brute-force complexity against optimal time/space targets.`,
    hintsBuilder: (t) => [
      `Look at the input size: N <= 10^5 immediately rules out O(N^2) brute-force.`,
      `Focus on: ${t.rubricAtoms.slice(0, 2).join(', ')}.`
    ],
    followUpsBuilder: (t) => [
      `What common mistakes cause candidates to misidentify this problem as dynamic programming?`,
      `How does the choice of auxiliary data structure impact time vs space trade-offs?`
    ],
    keywordsBuilder: (t) => [t.title, ...t.rubricAtoms.slice(0, 2), 'brute-force', 'complexity', 'intuition']
  },
  {
    slot: 2,
    difficulty: 'BEGINNER',
    learningLevel: 'L1',
    archetype: 'implementation',
    titleSuffix: 'Standard Warm-Up Problem Implementation',
    isTop150Slot: true,
    isBlind75Slot: true,
    promptBuilder: (t) =>
      `Implement the fundamental warm-up problem for ${t.title}: "${t.anchorProblems?.[0] || t.title + ' Baseline'}". Walk through the algorithm step-by-step and write clean, working code.`,
    rubricBuilder: (t) =>
      `Candidate must provide working, syntax-clean code solving the core anchor problem, correctly initializing pointers/variables and handling standard base cases without errors.`,
    hintsBuilder: (t) => [
      `Step through a minimal 3-element example before writing the code.`,
      `Identify the primary loop termination condition.`
    ],
    followUpsBuilder: (t) => [
      `How does your solution behave on an empty array or single-element input?`,
      `Can you write this iteratively rather than recursively to guarantee O(1) auxiliary space?`
    ],
    keywordsBuilder: (t) => [t.anchorProblems?.[0] || t.title, 'implementation', 'code', 'base case']
  },
  {
    slot: 3,
    difficulty: 'BEGINNER',
    learningLevel: 'L1',
    archetype: 'comparison',
    titleSuffix: 'Time & Space Complexity Rigor',
    isTop150Slot: false,
    isBlind75Slot: false,
    promptBuilder: (t) =>
      `Derive the exact Big-O time and space complexity for ${t.title}. Distinguish between worst-case, average-case, and best-case, and account for language-specific memory overhead.`,
    rubricBuilder: (t) =>
      `Candidate must rigorously explain Big-O derivations, including implicit call-stack depth in recursion or hash table collision worst-cases, demonstrating mastery beyond memorized formulas.`,
    hintsBuilder: (t) => [
      `Count the maximum number of operations per element (amortized vs per-operation).`
    ],
    followUpsBuilder: (t) => [
      `What happens to space complexity if strings or objects are copied rather than referenced?`,
      `How does garbage collection overhead affect high-frequency allocations in tight loops?`
    ],
    keywordsBuilder: (t) => [t.title, 'time complexity', 'space complexity', 'Big-O', 'amortized']
  },
  {
    slot: 4,
    difficulty: 'BEGINNER',
    learningLevel: 'L1',
    archetype: 'troubleshooting',
    titleSuffix: 'Boundary Traps & Off-by-One Prevention',
    isTop150Slot: false,
    isBlind75Slot: false,
    promptBuilder: (t) =>
      `What are the most frequent off-by-one errors and edge case traps in ${t.title}? Detail the exact loop boundary conditions (e.g., '<' vs '<=', mid calculation, null checks).`,
    rubricBuilder: (t) =>
      `Must identify specific boundary traps (${t.rubricAtoms.join(', ')}), such as integer overflow in mid = (low + high) / 2 or fencepost errors in sliding window shrinking.`,
    hintsBuilder: (t) => [
      `Consider what happens when the window size shrinks to 0 or when low == high.`
    ],
    followUpsBuilder: (t) => [
      `How do you write invariant statements in code comments to verify loop boundaries?`,
      `What unit test inputs specifically catch fencepost errors?`
    ],
    keywordsBuilder: (t) => [t.title, 'boundary conditions', 'off-by-one', 'edge cases', 'overflow']
  },

  // 6 Intermediate Questions (L2–L3)
  {
    slot: 5,
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L2',
    archetype: 'implementation',
    titleSuffix: 'Primary Classic Interview Problem',
    isTop150Slot: true,
    isBlind75Slot: true,
    promptBuilder: (t) =>
      `Solve the primary classic interview problem for ${t.title}: "${t.anchorProblems?.[1] || t.title + ' Core Variant'}". Detail the invariant you maintain and provide the full optimal code.`,
    rubricBuilder: (t) =>
      `Candidate must deliver optimal code ($O(N)$ or $O(N \log N)$), clearly state the loop invariant, and handle all duplicate elements or state shifts gracefully.`,
    hintsBuilder: (t) => [
      `Sort the array first if pointer convergence or duplicate skipping is required.`,
      `Focus on: ${t.rubricAtoms.slice(1, 3).join(', ')}.`
    ],
    followUpsBuilder: (t) => [
      `How does your approach skip duplicate results without using an expensive HashSet?`,
      `What is the auxiliary memory consumption of your data structure?`
    ],
    keywordsBuilder: (t) => [t.anchorProblems?.[1] || t.title, 'optimal code', 'invariant', 'interview problem']
  },
  {
    slot: 6,
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L2',
    archetype: 'mechanism',
    titleSuffix: 'State Invariant Maintenance & Pointer Shifts',
    isTop150Slot: true,
    isBlind75Slot: false,
    promptBuilder: (t) =>
      `In ${t.title}, precisely explain when and why pointers, window bounds, or stack states shift. What is the mathematical condition that triggers a state update?`,
    rubricBuilder: (t) =>
      `Must clearly articulate the monotonic invariant, predicate condition, or state transition equation, avoiding hand-waving explanations of pointer updates.`,
    hintsBuilder: (t) => [
      `Frame the condition as: while (windowConditionViolated) { shrinkWindow(); }`
    ],
    followUpsBuilder: (t) => [
      `Why is each element added and removed at most once, proving O(N) amortized time?`,
      `What happens if the array contains negative numbers or zero?`
    ],
    keywordsBuilder: (t) => [t.title, 'state invariant', 'pointer shift', 'amortized time', 'condition']
  },
  {
    slot: 7,
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L2',
    archetype: 'implementation',
    titleSuffix: 'Second Classic Problem Variation',
    isTop150Slot: true,
    isBlind75Slot: false,
    promptBuilder: (t) =>
      `Implement the second canonical problem for ${t.title}: "${t.anchorProblems?.[2] || t.title + ' Variation II'}". How does the algorithm adapt when constraints are tightened?`,
    rubricBuilder: (t) =>
      `Must write complete working code demonstrating mastery of the pattern under altered problem constraints (e.g., negative numbers, duplicates, non-contiguous subarrays).`,
    hintsBuilder: (t) => [
      `Check if a prefix sum hash map or dynamic threshold changes the approach.`
    ],
    followUpsBuilder: (t) => [
      `Can this problem be solved using a rolling hash or bitmask instead?`,
      `What is the performance bottleneck under worst-case adversarial input?`
    ],
    keywordsBuilder: (t) => [t.anchorProblems?.[2] || t.title, 'variation', 'tight constraints', 'implementation']
  },
  {
    slot: 8,
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L3',
    archetype: 'trade-off',
    titleSuffix: 'Optimization: Transitioning from Quadratic to Linear Time',
    promptBuilder: (t) =>
      `Walk through how ${t.title} eliminates redundant computations to reduce time complexity from O(N^2) or O(2^N) down to O(N) or O(N log N). Exactly what duplicate work is discarded?`,
    isTop150Slot: false,
    isBlind75Slot: false,
    rubricBuilder: (t) =>
      `Candidate must pinpoint the exact redundant overlapping subproblems or monotonic exclusions that enable the asymptotic speedup.`,
    hintsBuilder: (t) => [
      `Think about why we do not need to re-scan elements already evaluated.`
    ],
    followUpsBuilder: (t) => [
      `Under what input distribution does the theoretical speedup fail to beat a simple brute-force due to cache misses?`,
      `How does this pattern scale on multi-core architectures?`
    ],
    keywordsBuilder: (t) => [t.title, 'optimization', 'asymptotic speedup', 'redundant work', 'linear time']
  },
  {
    slot: 9,
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L3',
    archetype: 'implementation',
    titleSuffix: 'Third Classic Problem: Frequency & Range Queries',
    isTop150Slot: true,
    isBlind75Slot: false,
    promptBuilder: (t) =>
      `Solve the third interview classic in ${t.title}: "${t.anchorProblems?.[3] || t.title + ' Variation III'}". Show how auxiliary data structures ensure constant-time queries.`,
    rubricBuilder: (t) =>
      `Candidate must deliver bug-free code utilizing appropriate auxiliary structures (HashMaps, Frequency tables, Deques) to maintain sub-linear query times.`,
    hintsBuilder: (t) => [
      `Use an array as a direct-mapped hash table if character sets are restricted (e.g. ASCII 128).`
    ],
    followUpsBuilder: (t) => [
      `Why is an int[26] array substantially faster than a HashMap<Character, Integer> in competitive coding?`,
      `How do you handle Unicode code points beyond ASCII?`
    ],
    keywordsBuilder: (t) => [t.anchorProblems?.[3] || t.title, 'frequency table', 'constant time', 'queries']
  },
  {
    slot: 10,
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L3',
    archetype: 'mechanism',
    titleSuffix: 'Recurrence Relations & Memoization DAG',
    isTop150Slot: false,
    isBlind75Slot: false,
    promptBuilder: (t) =>
      `If solving ${t.title} recursively, define the mathematical recurrence relation, base cases, and state parameters. Draw the subproblem dependency DAG.`,
    rubricBuilder: (t) =>
      `Must write the formal recurrence formula (e.g. dp[i][j] = min(...)), specify state transition conditions, and prove the subproblem graph is a directed acyclic graph (DAG).`,
    hintsBuilder: (t) => [
      `Identify the minimal set of parameters that uniquely identify a subproblem.`
    ],
    followUpsBuilder: (t) => [
      `What is the difference between top-down memoization and bottom-up tabulation here?`,
      `How does space optimization collapse dimensions in the DP table?`
    ],
    keywordsBuilder: (t) => [t.title, 'recurrence relation', 'memoization', 'DAG', 'state parameters']
  },

  // 6 Advanced Questions (L3–L4)
  {
    slot: 11,
    difficulty: 'ADVANCED',
    learningLevel: 'L3',
    archetype: 'implementation',
    titleSuffix: 'Primary Hard Problem Implementation',
    isTop150Slot: true,
    isBlind75Slot: true,
    promptBuilder: (t) =>
      `Implement the definitive Hard problem for ${t.title}: "${t.anchorProblems?.[4] || t.title + ' Hard Challenge'}". Walk through the complex state management and write complete code.`,
    rubricBuilder: (t) =>
      `Must deliver fully functional, production-ready code for a known Hard problem, managing multi-variable coordination and complex branch conditions without logic leaks.`,
    hintsBuilder: (t) => [
      `Break down the problem into two distinct passes or use a monotonic invariant.`,
      `Focus on: ${t.rubricAtoms.slice(2, 4).join(', ')}.`
    ],
    followUpsBuilder: (t) => [
      `How do you handle simultaneous updates when multiple events trigger on the same index?`,
      `Can this be solved with a Segment Tree or Fenwick Tree if point updates are introduced?`
    ],
    keywordsBuilder: (t) => [t.anchorProblems?.[4] || t.title, 'hard problem', 'complex state', 'implementation']
  },
  {
    slot: 12,
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'troubleshooting',
    titleSuffix: 'Cycle Traps & Infinite Loop Safeguards',
    isTop150Slot: false,
    isBlind75Slot: false,
    promptBuilder: (t) =>
      `In ${t.title}, what cyclic dependencies or state loops can cause infinite recursion or runtime timeouts? How do you implement robust 3-state graph coloring or cycle detection?`,
    rubricBuilder: (t) =>
      `Candidate must explain cycle detection mechanisms (e.g., Unvisited=0, Visiting=1, Visited=2), detect circular references, and prove loop termination under all graph topologies.`,
    hintsBuilder: (t) => [
      `Distinguish between nodes currently in the recursion stack vs nodes fully explored.`
    ],
    followUpsBuilder: (t) => [
      `What happens if the input graph contains self-loops or disconnected components?`,
      `How does topological sort identify cycles using Kahn's algorithm in-degrees?`
    ],
    keywordsBuilder: (t) => [t.title, 'cycle detection', 'graph coloring', 'infinite loop', 'recursion stack']
  },
  {
    slot: 13,
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'architecture',
    titleSuffix: 'Multi-Data Structure Coordination',
    isTop150Slot: true,
    isBlind75Slot: false,
    promptBuilder: (t) =>
      `When ${t.title} requires combining two data structures (e.g., HashMap + Doubly Linked List, Heap + HashMap, or Trie + DFS), how do you coordinate cross-references and maintain mutual consistency?`,
    rubricBuilder: (t) =>
      `Candidate must demonstrate clean composite design, ensuring both structures update atomically during additions, deletions, and moves without dangling references.`,
    hintsBuilder: (t) => [
      `Store node pointers directly in the HashMap values to achieve true O(1) removals from the linked list.`
    ],
    followUpsBuilder: (t) => [
      `How do you ensure memory safety and avoid memory leaks when removing nodes?`,
      `What thread-safety primitives are needed if multiple threads access this composite structure?`
    ],
    keywordsBuilder: (t) => [t.title, 'composite structure', 'cross-references', 'HashMap + DLL', 'consistency']
  },
  {
    slot: 14,
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'implementation',
    titleSuffix: 'Second Hard Problem: Extreme Edge Handling',
    isTop150Slot: true,
    isBlind75Slot: false,
    promptBuilder: (t) =>
      `Implement the second Hard interview challenge in ${t.title}: "${t.anchorProblems?.[5] || t.title + ' Hard Variation II'}". Address all pathological edge cases in your code.`,
    rubricBuilder: (t) =>
      `Candidate must deliver optimal code handling extreme edge inputs: all elements identical, strictly descending sequences, sparse matrices, or maximum numeric values.`,
    hintsBuilder: (t) => [
      `Test your logic against [0], [-1, -2, -3], and arrays where all values are Integer.MAX_VALUE.`
    ],
    followUpsBuilder: (t) => [
      `Does your solution cause an integer overflow during intermediate summation?`,
      `How would you prove correctness using mathematical induction?`
    ],
    keywordsBuilder: (t) => [t.anchorProblems?.[5] || t.title, 'extreme edge cases', 'pathological inputs', 'code']
  },
  {
    slot: 15,
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'failure-analysis',
    titleSuffix: 'Numerical Invariants & Overflow Protection',
    isTop150Slot: false,
    isBlind75Slot: false,
    promptBuilder: (t) =>
      `Detail how ${t.title} protects against integer overflow, floating-point precision loss, and negative modulus operations. Provide exact code examples of safe arithmetic.`,
    rubricBuilder: (t) =>
      `Candidate must demonstrate safe mid calculation (low + (high - low) / 2), 64-bit integer casting (long in Java/C++), and positive modulo arithmetic ((val % MOD + MOD) % MOD).`,
    hintsBuilder: (t) => [
      `Remember that in C++ and Java, (-5) % 3 is -2, not 1.`
    ],
    followUpsBuilder: (t) => [
      `When should modular inverse using Fermat's Little Theorem be applied?`,
      `How does Python handle arbitrarily large integers compared to fixed-width languages?`
    ],
    keywordsBuilder: (t) => [t.title, 'integer overflow', 'safe arithmetic', 'modulus', 'floating-point']
  },
  {
    slot: 16,
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'implementation',
    titleSuffix: 'Deterministic Testing & Stress Test Generation',
    isTop150Slot: false,
    isBlind75Slot: false,
    promptBuilder: (t) =>
      `How would you write a deterministic fuzzing / stress-testing generator to compare your optimal ${t.title} solution against a naive brute-force baseline across 10,000 random inputs?`,
    rubricBuilder: (t) =>
      `Candidate must outline a stress-testing harness in code, generating pseudo-random edge test cases and automatically asserting that optimal(input) == bruteForce(input).`,
    hintsBuilder: (t) => [
      `Write a small random generator for arrays of size 1..20 with values from -100 to 100.`
    ],
    followUpsBuilder: (t) => [
      `How do you automatically reduce a failing random test case to its minimal reproducing example?`,
      `What property-based testing libraries (QuickCheck, jqwik) automate this in production?`
    ],
    keywordsBuilder: (t) => [t.title, 'stress testing', 'fuzzing', 'deterministic tests', 'brute-force comparison']
  },

  // 4 Expert Questions (L5)
  {
    slot: 17,
    difficulty: 'EXPERT',
    learningLevel: 'L5',
    archetype: 'trade-off',
    titleSuffix: 'Space Complexity Optimization to O(1) Auxiliary Space',
    isTop150Slot: false,
    isBlind75Slot: false,
    promptBuilder: (t) =>
      `Re-architect your solution for ${t.title} to consume strictly O(1) auxiliary space without modifying the original input array (or by utilizing the input array itself as the state store via bit manipulation/sign flipping).`,
    rubricBuilder: (t) =>
      `Must demonstrate advanced in-place techniques: Morris Traversal for O(1) binary tree traversals, sign-negation index markers for duplicates, or bitwise state packing in 32-bit integers.`,
    hintsBuilder: (t) => [
      `Can you use the sign bit of array[abs(x)] to indicate presence?`
    ],
    followUpsBuilder: (t) => [
      `What are the trade-offs of in-place input mutation in concurrent multi-threaded systems?`,
      `How does Morris Traversal restore modified right pointers back to null?`
    ],
    keywordsBuilder: (t) => [t.title, 'O(1) space', 'in-place', 'Morris traversal', 'sign flipping', 'bit packing']
  },
  {
    slot: 18,
    difficulty: 'EXPERT',
    learningLevel: 'L5',
    archetype: 'scenario-based',
    titleSuffix: 'Streaming Inputs & Online Algorithm Adaptation',
    isTop150Slot: false,
    isBlind75Slot: false,
    promptBuilder: (t) =>
      `Adapt ${t.title} to an online streaming scenario where data arrives continuously at 100,000 elements per second and cannot fit in RAM. How do you maintain queries using streaming algorithms or rolling approximations?`,
    rubricBuilder: (t) =>
      `Candidate must articulate streaming algorithms: Reservoir Sampling, Count-Min Sketch, HyperLogLog, or Two-Heap streaming medians, explaining memory bounds and approximation tolerances.`,
    hintsBuilder: (t) => [
      `Use probabilistic data structures if exact answers require linear memory in stream length.`
    ],
    followUpsBuilder: (t) => [
      `What is the theoretical lower bound on memory for exact streaming median vs approximate percentiles?`,
      `How do sliding window streaming algorithms handle timestamp expirations?`
    ],
    keywordsBuilder: (t) => [t.title, 'streaming algorithm', 'online processing', 'Reservoir sampling', 'Count-Min Sketch']
  },
  {
    slot: 19,
    difficulty: 'EXPERT',
    learningLevel: 'L5',
    archetype: 'trade-off',
    titleSuffix: 'CPU Cache Locality & Branch Prediction Optimization',
    isTop150Slot: false,
    isBlind75Slot: false,
    promptBuilder: (t) =>
      `Analyze the low-level hardware performance of ${t.title}. How does memory layout (contiguous arrays vs node pointers) affect L1/L2/L3 cache misses and CPU branch predictor pipeline flushes?`,
    rubricBuilder: (t) =>
      `Candidate must explain spatial and temporal cache locality: why pointer-chasing in linked lists/trees suffers from random cache misses, and how flat array representations (e.g. array-based heaps, structure-of-arrays) achieve superior throughput.`,
    hintsBuilder: (t) => [
      `Contrast iterating through an ArrayList vs a LinkedList of 1,000,000 integers.`
    ],
    followUpsBuilder: (t) => [
      `How does branchless programming (e.g. ternary replacement with bitwise masks) eliminate branch mispredictions in sorting?`,
      `What is false sharing in multi-threaded array processing?`
    ],
    keywordsBuilder: (t) => [t.title, 'cache locality', 'branch prediction', 'pointer chasing', 'hardware performance']
  },
  {
    slot: 20,
    difficulty: 'EXPERT',
    learningLevel: 'L5',
    archetype: 'follow-up-probe',
    titleSuffix: 'Staff-Level Code Review & Production Refactoring',
    isTop150Slot: false,
    isBlind75Slot: false,
    promptBuilder: (t) =>
      `You are conducting a Staff-level code review on a production pull request implementing ${t.title}. What are your critical grading criteria across Modularity, Error Handling, Memory Leaks, and Concurrency Safety?`,
    rubricBuilder: (t) =>
      `Must outline a production code review framework: defensive copying, immutability, thread-safety, unit test coverage, and modular separation of business rules from data structures.`,
    hintsBuilder: (t) => [
      `Highlight the difference between competitive programming 'hack' code and production enterprise libraries.`
    ],
    followUpsBuilder: (t) => [
      `How do you design a reusable generic library API for this pattern that supports custom comparators?`,
      `What telemetry and metrics would you export to monitor this algorithm in production?`
    ],
    keywordsBuilder: (t) => [t.title, 'code review', 'production refactoring', 'staff engineer', 'enterprise library']
  }
];

export function generateQuestionsForTopic(topic: TopicSeed): QuestionSeed[] {
  const targetCompanies = topic.targetCompanies && topic.targetCompanies.length > 0
    ? topic.targetCompanies
    : ['Google', 'Amazon', 'Meta', 'Microsoft', 'Apple', 'Uber'];

  return DSA_QUESTION_ARCHETYPE_TEMPLATES.map((tmpl) => {
    // Calculate frequency score based on topic priority, trend, and question archetype
    let baseScore = topic.priority === 'P0' ? 90 : topic.priority === 'P1' ? 80 : 70;
    if (topic.trend === 'SURGING' || topic.trend === 'HOT') baseScore += 5;
    if (tmpl.isBlind75Slot) baseScore = Math.min(99, baseScore + 6);
    else if (tmpl.isTop150Slot) baseScore = Math.min(98, baseScore + 4);

    return {
      id: `q_${topic.slug.replace(/-/g, '_')}_${String(tmpl.slot).padStart(2, '0')}`,
      title: `${topic.title}: ${tmpl.titleSuffix}`,
      difficulty: tmpl.difficulty,
      learningLevel: tmpl.learningLevel,
      archetype: tmpl.archetype,
      prompt: tmpl.promptBuilder(topic),
      scaleAnchor: 'N = 10^5 elements, O(1) auxiliary space target',
      rubricGuide: tmpl.rubricBuilder(topic),
      rubricAtoms: [
        ...topic.rubricAtoms.slice(0, 3),
        tmpl.titleSuffix,
        tmpl.archetype
      ],
      hints: tmpl.hintsBuilder(topic),
      followUpProbes: tmpl.followUpsBuilder(topic),
      expectedKeywords: tmpl.keywordsBuilder(topic),
      antiPatterns: [
        'Falling back to O(N^2) brute-force when O(N) or O(N log N) is expected',
        'Failing to handle empty array, single element, or null pointers',
        'Integer overflow in arithmetic operations (midpoint or running sums)',
        'Off-by-one fencepost errors in loop boundaries'
      ],
      // Dynamic Popularity & Curated Sprints
      frequencyScore: baseScore,
      isTop150: tmpl.isTop150Slot && (topic.priority === 'P0' || topic.priority === 'P1'),
      isBlind75: tmpl.isBlind75Slot && topic.priority === 'P0',
      companies: targetCompanies
    };
  });
}

