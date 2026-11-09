import { TopicSeed } from './types';
import { generateQuestionsForTopic } from './question-generator';

const RAW_DSA_TOPICS: Omit<TopicSeed, 'questions'>[] = [
  // Category 1: Arrays, Two Pointers & Sliding Window (5 Topics)
  {
    slug: 'arrays-two-pointers',
    topicId: 'DSA01',
    title: 'Two Pointers & In-Place Operations',
    categorySlug: 'dsa-arrays-two-pointers',
    priority: 'P0',
    difficulty: 'BEGINNER',
    durationMin: 35,
    frequency: 99,
    weight: 98,
    trend: 'HOT',
    description:
      'Converging two pointers, running pairs, and in-place array partitioning: Two Sum, 3Sum, 4Sum, Container with Most Water, Sort 0s/1s/2s (Dutch National Flag), and Remove Duplicates.',
    rubricAtoms: ['Two Pointers Convergence', 'Dutch National Flag Sort', 'Skipping Duplicates in O(1)', 'Pointer Invariant Proof'],
    prerequisites: [],
    anchorProblems: ['Two Sum', '3Sum', '4Sum', 'Container with Most Water', 'Sort array of 0s 1s 2s'],
    targetCompanies: ['Google', 'Amazon', 'Meta', 'Microsoft', 'Adobe', 'Flipkart']
  },
  {
    slug: 'sliding-window-fixed-dynamic',
    topicId: 'DSA02',
    title: 'Sliding Window (Fixed & Dynamic)',
    categorySlug: 'dsa-arrays-two-pointers',
    priority: 'P0',
    difficulty: 'INTERMEDIATE',
    durationMin: 40,
    frequency: 98,
    weight: 97,
    trend: 'HOT',
    description:
      'Fixed and dynamic sliding window sub-arrays: Longest Substring Without Repeating Characters, Minimum Window Substring, Permutation in String, Max Consecutive Ones III, and Fruit Into Baskets.',
    rubricAtoms: ['Dynamic Window Expansion & Contraction', 'Frequency Table Updates in O(1)', 'Subarray Boundary Tracking', 'At Most K Conditions'],
    prerequisites: ['arrays-two-pointers'],
    anchorProblems: ['Longest substring without repeating', 'Minimum Window Substring', 'Permutation in String', 'Max Consecutive Ones III'],
    targetCompanies: ['Amazon', 'Google', 'Microsoft', 'Meta', 'Atlassian', 'Uber']
  },
  {
    slug: 'prefix-sums-hash-tables',
    topicId: 'DSA03',
    title: 'Prefix Sums & Subarray Hash Maps',
    categorySlug: 'dsa-arrays-two-pointers',
    priority: 'P0',
    difficulty: 'INTERMEDIATE',
    durationMin: 35,
    frequency: 97,
    weight: 95,
    trend: 'HOT',
    description:
      'Prefix sums combined with hash maps: Subarray Sum Equals K, Continuous Subarray Sum, Product of Array Except Self, and 2D Range Sum Matrix Queries.',
    rubricAtoms: ['Prefix Sum Cumulative State', 'HashMap Subarray Lookup O(1)', 'Product Without Self Division', '2D Matrix Prefix Math'],
    prerequisites: ['arrays-two-pointers'],
    anchorProblems: ['Subarray sum equals k', 'Product of array except itself', 'Continuous Subarray Sum', 'Range Sum Query 2D'],
    targetCompanies: ['Meta', 'Amazon', 'Google', 'Microsoft', 'Morgan Stanley']
  },
  {
    slug: 'kadane-inversions-math',
    topicId: 'DSA04',
    title: 'Kadane Algorithm & Array Inversions',
    categorySlug: 'dsa-arrays-two-pointers',
    priority: 'P0',
    difficulty: 'INTERMEDIATE',
    durationMin: 40,
    frequency: 96,
    weight: 94,
    trend: 'HOT',
    description:
      'Maximum subarray Kadane algorithm, Maximum Product Subarray, Majority Element (Boyer-Moore Voting), Stock Buy & Sell I & II, Count Inversions (Merge Sort), and Reverse Pairs.',
    rubricAtoms: ['Kadane Max Subarray Dynamic State', 'Boyer-Moore Voting Algorithm', 'Merge Sort Counting Inversions', 'Reverse Pairs Modified Binary Search'],
    prerequisites: ['arrays-two-pointers'],
    anchorProblems: ['Kadane Algorithm', 'Majority Element', 'Stock Buy & Sell', 'Count Inversions', 'Reverse pairs'],
    targetCompanies: ['Amazon', 'Microsoft', 'Google', 'Meta', 'Goldman Sachs', 'Adobe']
  },
  {
    slug: 'matrix-traversal-manipulation',
    topicId: 'DSA05',
    title: '2D Matrix Traversal & Manipulation',
    categorySlug: 'dsa-arrays-two-pointers',
    priority: 'P1',
    difficulty: 'INTERMEDIATE',
    durationMin: 35,
    frequency: 90,
    weight: 88,
    trend: 'STABLE',
    description:
      '2D grid manipulation: Set Matrix Zeroes in O(1) space, Rotate Image / Matrix 90° clockwise in-place, Spiral Matrix traversal, and Search in 2D Matrix I & II (Staircase search).',
    rubricAtoms: ['In-Place Matrix Rotation & Transpose', 'O(1) Space Row/Column Flags', 'Spiral Boundary Contraction', 'Staircase Search O(M+N)'],
    prerequisites: ['arrays-two-pointers'],
    anchorProblems: ['Set matrix zeroes', 'Search a 2D matrix', 'Rotate Image', 'Spiral Matrix'],
    targetCompanies: ['Microsoft', 'Amazon', 'Apple', 'Google', 'Uber']
  },

  // Category 2: Strings & Pattern Matching (3 Topics)
  {
    slug: 'strings-palindromes-parsing',
    topicId: 'DSA06',
    title: 'String Parsing & Palindromes',
    categorySlug: 'dsa-strings-matching',
    priority: 'P0',
    difficulty: 'BEGINNER',
    durationMin: 30,
    frequency: 97,
    weight: 94,
    trend: 'STABLE',
    description:
      'String parsing and palindrome verification: Valid Palindrome, Reverse Words in a String, Longest Common Prefix, and in-place String Compression.',
    rubricAtoms: ['Alphanumeric Filtering & Two Pointers', 'In-Place Word Reversal', 'Prefix Triplet Comparison', 'String Compression Pointer Shifts'],
    prerequisites: ['arrays-two-pointers'],
    anchorProblems: ['Valid Palindrome', 'Reverse Words in String', 'Longest Common Prefix', 'String Compression'],
    targetCompanies: ['Amazon', 'Meta', 'Google', 'Microsoft', 'Paytm', 'Zoho']
  },
  {
    slug: 'strings-anagrams-grouping',
    topicId: 'DSA07',
    title: 'Anagrams & Frequency Counting',
    categorySlug: 'dsa-strings-matching',
    priority: 'P0',
    difficulty: 'BEGINNER',
    durationMin: 30,
    frequency: 96,
    weight: 93,
    trend: 'STABLE',
    description:
      'Anagram detection and grouping: Valid Anagram, Group Anagrams using sorted tuple or 26-character frequency signatures, and Remove All Occurrences of String.',
    rubricAtoms: ['26-Character Array Frequency Hashing', 'Group Anagrams Key Normalization', 'Substring Elimination Invariants', 'Direct-Mapped Hash Table'],
    prerequisites: ['strings-palindromes-parsing'],
    anchorProblems: ['Valid Anagram', 'Group Anagrams', 'Remove All Occurrences of String'],
    targetCompanies: ['Google', 'Adobe', 'Amazon', 'Samsung', 'Flipkart']
  },
  {
    slug: 'string-matching-kmp-rabin-karp',
    topicId: 'DSA08',
    title: 'Pattern Matching: KMP & Rabin-Karp',
    categorySlug: 'dsa-strings-matching',
    priority: 'P1',
    difficulty: 'ADVANCED',
    durationMin: 45,
    frequency: 88,
    weight: 86,
    trend: 'RISING',
    description:
      'Advanced substring pattern matching: Knuth-Morris-Pratt (KMP) Longest Prefix Suffix (LPS) array in O(N+M), Rabin-Karp polynomial rolling hash, and Repeated String Match.',
    rubricAtoms: ['KMP LPS Array Construction', 'O(N+M) Deterministic Substring Search', 'Rabin-Karp Rolling Hash Math', 'Spurious Hash Collision Handling'],
    prerequisites: ['strings-palindromes-parsing'],
    anchorProblems: ['Kmp Algorithm', 'Robin Karp', 'Repeated String Match'],
    targetCompanies: ['Google', 'Microsoft', 'Amazon', 'Meta', 'Uber']
  },

  // Category 3: Binary Search & Answer Spaces (4 Topics)
  {
    slug: 'binary-search-boundaries',
    topicId: 'DSA09',
    title: 'Classic Binary Search & Boundaries',
    categorySlug: 'dsa-binary-search',
    priority: 'P0',
    difficulty: 'BEGINNER',
    durationMin: 30,
    frequency: 98,
    weight: 96,
    trend: 'STABLE',
    description:
      'Logarithmic search and boundary conditions: Classic Binary Search, Peak Index in Mountain Array, Single Element in Sorted Array, and First & Last Occurrence.',
    rubricAtoms: ['Lower & Upper Bound Invariants', 'Safe Midpoint Calculation', 'Peak Detection Derivative Sign', 'Even-Odd Pair Index Invariant'],
    prerequisites: ['arrays-two-pointers'],
    anchorProblems: ['Search in rotated sorted', 'Peak index in mountain array', 'Single element in sorted array'],
    targetCompanies: ['Google', 'Microsoft', 'Amazon', 'Adobe', 'Meta']
  },
  {
    slug: 'binary-search-rotated-arrays',
    topicId: 'DSA10',
    title: 'Search in Rotated & Modified Arrays',
    categorySlug: 'dsa-binary-search',
    priority: 'P0',
    difficulty: 'INTERMEDIATE',
    durationMin: 35,
    frequency: 98,
    weight: 97,
    trend: 'HOT',
    description:
      'Binary search on rotated and modified sorted arrays: Search in Rotated Sorted Array I (distinct), Search in Rotated Sorted Array II (duplicates), and Find Minimum in Rotated Sorted Array.',
    rubricAtoms: ['Sorted Half Identification', 'Duplicate Boundary Disambiguation', 'Rotation Pivot Finding', 'Strictly Increasing Monotonic Checks'],
    prerequisites: ['binary-search-boundaries'],
    anchorProblems: ['Search in rotated sorted', 'Find Minimum in Rotated Sorted Array'],
    targetCompanies: ['Amazon', 'Google', 'Microsoft', 'Meta', 'Flipkart', 'Paytm']
  },
  {
    slug: 'binary-search-answer-space',
    topicId: 'DSA11',
    title: 'Binary Search on Answer Space',
    categorySlug: 'dsa-binary-search',
    priority: 'P0',
    difficulty: 'INTERMEDIATE',
    durationMin: 45,
    frequency: 99,
    weight: 98,
    trend: 'SURGING',
    description:
      'Minimax optimization using binary search on the predicate answer space: Allocate Minimum Pages (Book Allocation), Painter’s Partition, Aggressive Cows, and Capacity to Ship Packages Within D Days.',
    rubricAtoms: ['Feasibility Predicate Function Design', 'Search Space Range Derivation [min, max]', 'Minimax Monotonicity Property', 'Greedy Capacity Allocation Verification'],
    prerequisites: ['binary-search-boundaries'],
    anchorProblems: ['Allocate Minimum Pages (Book Allocation)', 'Painter’s Partition', 'Aggressive cows', 'Capacity to Ship Packages'],
    targetCompanies: ['Google', 'Amazon', 'Microsoft', 'Adobe', 'Infosys', 'Codenation']
  },
  {
    slug: 'binary-search-median-two-arrays',
    topicId: 'DSA12',
    title: 'Median & K-th Element in Two Arrays',
    categorySlug: 'dsa-binary-search',
    priority: 'P1',
    difficulty: 'ADVANCED',
    durationMin: 50,
    frequency: 92,
    weight: 90,
    trend: 'STABLE',
    description:
      'Binary partition on two sorted arrays: Median of Two Sorted Arrays in O(log(min(N, M))) and K-th Element of Two Sorted Arrays using left/right partition boundary invariants.',
    rubricAtoms: ['Binary Partition Symmetry', 'Left-Max <= Right-Min Boundary Checks', 'Odd/Even Median Formulation', 'O(log(min(N, M))) Termination'],
    prerequisites: ['binary-search-boundaries'],
    anchorProblems: ['Median of 2 Sorted Arrays', 'K-th Element of Two Sorted Arrays'],
    targetCompanies: ['Amazon', 'Google', 'Microsoft', 'Samsung', 'Meta']
  },

  // Category 4: Linked Lists & Fast/Slow Pointers (4 Topics)
  {
    slug: 'linked-list-reversals-cycles',
    topicId: 'DSA13',
    title: 'Reversals, Cycles & Fast/Slow Pointers',
    categorySlug: 'dsa-linked-lists',
    priority: 'P0',
    difficulty: 'BEGINNER',
    durationMin: 35,
    frequency: 99,
    weight: 98,
    trend: 'STABLE',
    description:
      'In-place pointer reversal and Floyd cycle detection: Reverse a Linked List, Middle of Linked List (Tortoise & Hare), Detect Cycle in LL, Remove Cycle, and Palindrome Linked List.',
    rubricAtoms: ['Three-Pointer In-Place Reversal', 'Floyd Cycle Detection Algorithm', 'Cycle Entry Point Derivation (2k = k + nr)', 'Palindrome Mid-Point Split & Compare'],
    prerequisites: ['arrays-two-pointers'],
    anchorProblems: ['Reverse a LL', 'Middle of LL', 'Detect Cycle in LL', 'Remove Cycle in LL', 'Check if LL Is Palindrome or Not'],
    targetCompanies: ['Google', 'Meta', 'Amazon', 'Apple', 'Microsoft', 'PayPal', 'Qualcomm']
  },
  {
    slug: 'linked-list-multi-merge-math',
    topicId: 'DSA14',
    title: 'Multi-List Merging & Arithmetic',
    categorySlug: 'dsa-linked-lists',
    priority: 'P0',
    difficulty: 'INTERMEDIATE',
    durationMin: 40,
    frequency: 98,
    weight: 97,
    trend: 'HOT',
    description:
      'Multi-list coordination and pointer math: Merge 2 Sorted Lists, Add Two Numbers (with carry-over), Reverse Nodes in K-Groups (sub-list reversals), and Rotate a Linked List.',
    rubricAtoms: ['Dummy Head Sentinel Pointer Pattern', 'Carry-Over Arithmetic Invariant', 'K-Group Sub-segment Reversal & Reconnection', 'Length Modulo Pointer Splicing'],
    prerequisites: ['linked-list-reversals-cycles'],
    anchorProblems: ['Merge 2 Sorted LL', 'Add 2 Numbers', 'Reverse Nodes in K Groups', 'Rotate a LL'],
    targetCompanies: ['Amazon', 'Google', 'Microsoft', 'Meta', 'Uber', 'Adobe']
  },
  {
    slug: 'linked-list-complex-pointers',
    topicId: 'DSA15',
    title: 'Complex Pointer Manipulation',
    categorySlug: 'dsa-linked-lists',
    priority: 'P1',
    difficulty: 'INTERMEDIATE',
    durationMin: 40,
    frequency: 91,
    weight: 89,
    trend: 'STABLE',
    description:
      'Deep pointer structural manipulation: Clone a Linked List with Random Pointers (interweaving nodes in O(1) space), Flatten a Multilevel Linked List, and Reverse Linked List II.',
    rubricAtoms: ['Interweaving Nodes O(1) Clone Technique', 'Random Pointer Deep Copy Invariant', 'Multilevel Child-to-Next Flattening', 'Bounded Sub-list Reversal Window'],
    prerequisites: ['linked-list-reversals-cycles'],
    anchorProblems: ['Clone LL with Random Pointers', 'Flatten LL', 'Reverse Linked List 2'],
    targetCompanies: ['Meta', 'Amazon', 'Microsoft', 'Google', 'Intel', 'Nvidia']
  },
  {
    slug: 'lru-cache-composite-structure',
    topicId: 'DSA16',
    title: 'LRU Cache Composite Class',
    categorySlug: 'dsa-linked-lists',
    priority: 'P0',
    difficulty: 'ADVANCED',
    durationMin: 45,
    frequency: 99,
    weight: 99,
    trend: 'HOT',
    description:
      'Composite data structure design: Least Recently Used (LRU) Cache implementing O(1) get and put operations via Doubly Linked List node splicing and Hash Map pointer lookups.',
    rubricAtoms: ['Doubly Linked List Head/Tail Sentinels', 'O(1) HashMap Pointer Splicing', 'Node Eviction & Capacity Invariant', 'Thread-Safe Synchronization Hooks'],
    prerequisites: ['linked-list-reversals-cycles'],
    anchorProblems: ['LRU Cache'],
    targetCompanies: ['Google', 'Meta', 'Amazon', 'Microsoft', 'Nvidia', 'Oracle', 'Morgan Stanley']
  },

  // Category 5: Stacks, Queues & Monotonic Deques (4 Topics)
  {
    slug: 'stack-queue-foundations',
    topicId: 'DSA17',
    title: 'Stack Foundations & Expression Parsing',
    categorySlug: 'dsa-stacks-queues',
    priority: 'P0',
    difficulty: 'BEGINNER',
    durationMin: 30,
    frequency: 99,
    weight: 98,
    trend: 'STABLE',
    description:
      'LIFO and FIFO fundamental data structures: Valid Parentheses, Implement Stack using Queue, Implement Queue using Stack, and Min Stack (O(1) getMin using value/min tracking).',
    rubricAtoms: ['Matching Bracket Stack LIFO Invariant', 'Amortized Cost of 2-Stack Queue', 'Auxiliary Min Tracking (Pairs / Difference)', 'Stack Underflow & Overflow Checks'],
    prerequisites: ['arrays-two-pointers'],
    anchorProblems: ['Valid Parenthesis', 'Implement Stack using Queue', 'Implement Queue using Stack', 'Get Min Element from Stack'],
    targetCompanies: ['Google', 'Meta', 'Amazon', 'Microsoft', 'LinkedIn', 'Visa', 'Intuit']
  },
  {
    slug: 'monotonic-stack-next-greater',
    topicId: 'DSA18',
    title: 'Monotonic Stack: Next Greater Elements',
    categorySlug: 'dsa-stacks-queues',
    priority: 'P0',
    difficulty: 'INTERMEDIATE',
    durationMin: 40,
    frequency: 98,
    weight: 97,
    trend: 'HOT',
    description:
      'Monotonic stack linear time optimizations: Next Greater Element I & II (circular array), Previous Smaller Element, Stock Span, and Daily Temperatures.',
    rubricAtoms: ['Strictly Monotonic Decreasing Stack', 'Circular Array Index Modulo Trick (2N Pass)', 'Amortized O(N) Element Push/Pop Proof', 'Span Distance Calculation'],
    prerequisites: ['stack-queue-foundations'],
    anchorProblems: ['Next Greater Element I', 'Next Greater Element II', 'Previous Smaller Element', 'Stock Span'],
    targetCompanies: ['Amazon', 'Google', 'Microsoft', 'Uber', 'Apple', 'Citadel', 'PhonePe']
  },
  {
    slug: 'monotonic-stack-histograms',
    topicId: 'DSA19',
    title: 'Monotonic Stack: Histograms & Water',
    categorySlug: 'dsa-stacks-queues',
    priority: 'P0',
    difficulty: 'ADVANCED',
    durationMin: 45,
    frequency: 99,
    weight: 99,
    trend: 'HOT',
    description:
      'Monotonic stack geometric extremes: Largest Rectangle in Histogram, Maximal Rectangle in 2D Binary Matrix, Trapping Rain Water (Two Pointers vs Monotonic Stack), and Celebrity Problem.',
    rubricAtoms: ['Histogram Left/Right Smaller Boundaries', 'Width Expansion Calculation (right - left - 1)', 'Trapping Rain Water Elevation Minima', 'Celebrity Elimination Invariant'],
    prerequisites: ['monotonic-stack-next-greater'],
    anchorProblems: ['Largest rectangle in a histogram', 'Trapping Rainwater', 'Celebrity Problem'],
    targetCompanies: ['Adobe', 'Apple', 'Meta', 'Amazon', 'Google', 'Microsoft', 'Samsung']
  },
  {
    slug: 'monotonic-deque-sliding-window',
    topicId: 'DSA20',
    title: 'Monotonic Deques & Circular Queues',
    categorySlug: 'dsa-stacks-queues',
    priority: 'P1',
    difficulty: 'ADVANCED',
    durationMin: 45,
    frequency: 95,
    weight: 94,
    trend: 'SURGING',
    description:
      'Double-ended queues and multi-source BFS: Sliding Window Maximum (Monotonic Deque in O(N)), First Non-Repeating Character in Stream, Circular Tour / Gas Station, and Rotten Oranges.',
    rubricAtoms: ['Monotonic Deque Index Eviction Invariant', 'Window Boundary Index Validation', 'Multi-Source Level-by-Level BFS Queue', 'Greedy Gas Station Balance Running Sum'],
    prerequisites: ['stack-queue-foundations', 'sliding-window-fixed-dynamic'],
    anchorProblems: ['Sliding window maximum', '1st Non Repeating in Stream', 'Circular Tour / Gas Station', 'Rotten Oranges'],
    targetCompanies: ['Amazon', 'Google', 'Microsoft', 'Meta', 'Directi', 'Flipkart']
  },

  // Category 6: Binary Trees & Tree Traversals (4 Topics)
  {
    slug: 'binary-tree-dfs-traversals',
    topicId: 'DSA21',
    title: 'Tree DFS Traversals & Depth',
    categorySlug: 'dsa-binary-trees',
    priority: 'P0',
    difficulty: 'BEGINNER',
    durationMin: 35,
    frequency: 99,
    weight: 98,
    trend: 'STABLE',
    description:
      'Depth-First Search traversals and tree invariants: Inorder, Preorder, Postorder (Recursive & Iterative using stacks), Morris Inorder Traversal (O(1) space), Maximum Depth, Diameter of Binary Tree, and Height Balanced Tree.',
    rubricAtoms: ['Recursive vs Iterative DFS Stack Mechanics', 'Morris Inorder Threaded Binary Tree O(1) Space', 'Diameter Subtree Depth Recurrence', 'Height Balanced Tree -1 Signal Pattern'],
    prerequisites: ['stack-queue-foundations'],
    anchorProblems: ['Inorder', 'Preorder', 'Postorder', 'Morris Inorder Traversal', 'Diameter', 'Check if Tree is Height Balanced'],
    targetCompanies: ['Google', 'Amazon', 'Meta', 'Microsoft', 'Apple', 'Adobe', 'Uber']
  },
  {
    slug: 'binary-tree-symmetry-views',
    topicId: 'DSA22',
    title: 'Tree Symmetry, BFS & Boundary Views',
    categorySlug: 'dsa-binary-trees',
    priority: 'P0',
    difficulty: 'INTERMEDIATE',
    durationMin: 40,
    frequency: 97,
    weight: 96,
    trend: 'STABLE',
    description:
      'Breadth-First Search and structural perspective views: Symmetric Tree, Mirror check, Level Order Traversal, Zig-Zag Traversal, Top View of Binary Tree, Bottom View of Binary Tree, and Maximum Width of Binary Tree.',
    rubricAtoms: ['Level-by-Level Queue BFS', 'Horizontal Coordinate Distance Map', 'Top/Bottom View Vertical Projection', 'Zig-Zag Alternating Deque Direction'],
    prerequisites: ['binary-tree-dfs-traversals'],
    anchorProblems: ['Symmetric Tree', 'Level Order', 'Zig Zag Traversal of BT', 'Top View of a Tree', 'Bottom View of a Tree', 'Max Width of BT'],
    targetCompanies: ['Amazon', 'Google', 'Meta', 'Microsoft', 'Oracle', 'Flipkart']
  },
  {
    slug: 'binary-tree-lca-paths',
    topicId: 'DSA23',
    title: 'Lowest Common Ancestor & Path Sums',
    categorySlug: 'dsa-binary-trees',
    priority: 'P0',
    difficulty: 'ADVANCED',
    durationMin: 45,
    frequency: 98,
    weight: 97,
    trend: 'HOT',
    description:
      'Ancestry and path optimization: Lowest Common Ancestor (LCA) in Binary Tree, Maximum Path Sum (any node to any node), Kth Ancestor of Node, and Minimum Distance Between Two Nodes.',
    rubricAtoms: ['Recursive LCA Branch Convergence', 'Maximum Path Sum Subtree Gain Contribution', 'Binary Lifting Kth Ancestor Table', 'Node Distance LCA Derivation (d1 + d2 - 2*dLCA)'],
    prerequisites: ['binary-tree-dfs-traversals'],
    anchorProblems: ['LCA', 'Max Path Sum', 'Kth Ancestor', 'Minimum Distance between Nodes'],
    targetCompanies: ['Meta', 'Amazon', 'Google', 'Microsoft', 'Goldman Sachs', 'Uber']
  },
  {
    slug: 'binary-tree-construction',
    topicId: 'DSA24',
    title: 'Tree Construction & Flattening',
    categorySlug: 'dsa-binary-trees',
    priority: 'P1',
    difficulty: 'INTERMEDIATE',
    durationMin: 40,
    frequency: 92,
    weight: 90,
    trend: 'STABLE',
    description:
      'Reconstructing and reshaping trees: Construct Binary Tree from Inorder & Preorder, Construct from Inorder & Postorder, Flatten Binary Tree to Linked List, and Transform to Sum Tree.',
    rubricAtoms: ['Inorder Index Map Subtree Partitioning', 'Preorder Root Index Recursion Window', 'In-Place Right-Splice Tree Flattening', 'Subtree Sum Bottom-Up Propagation'],
    prerequisites: ['binary-tree-dfs-traversals'],
    anchorProblems: ['Construct BT from Inorder & Pre order', 'Construct BT from Inorder & Post order', 'Flatten BT to LL', 'Transform to Sum Tree'],
    targetCompanies: ['Google', 'Meta', 'Amazon', 'Microsoft', 'Adobe', 'Apple']
  },

  // Category 7: Binary Search Trees (3 Topics)
  {
    slug: 'bst-validation-ordering',
    topicId: 'DSA25',
    title: 'BST Validation & Ordering Invariants',
    categorySlug: 'dsa-binary-search-trees',
    priority: 'P0',
    difficulty: 'INTERMEDIATE',
    durationMin: 35,
    frequency: 98,
    weight: 97,
    trend: 'STABLE',
    description:
      'Binary Search Tree ordering invariants: Validate BST using min/max range boundaries (-inf < val < +inf), Kth Smallest Element in BST, Kth Largest in BST, LCA in BST, and Inorder Successor & Predecessor.',
    rubricAtoms: ['Range Boundary Invariant Validation', 'Inorder Traversal Monotonic Increasing Property', 'BST LCA Search Direction O(H)', 'Successor/Predecessor Pointer Walking'],
    prerequisites: ['binary-tree-dfs-traversals', 'binary-search-boundaries'],
    anchorProblems: ['Validate BST', 'Kth Smallest in BST', 'Kth largest in BST', 'LCA in BST', 'Inorder Successor'],
    targetCompanies: ['Amazon', 'Google', 'Meta', 'Microsoft', 'Salesforce', 'Citadel', 'Atlassian']
  },
  {
    slug: 'bst-conversions-iterators',
    topicId: 'DSA26',
    title: 'BST Conversions & Custom Iterators',
    categorySlug: 'dsa-binary-search-trees',
    priority: 'P1',
    difficulty: 'INTERMEDIATE',
    durationMin: 40,
    frequency: 91,
    weight: 89,
    trend: 'STABLE',
    description:
      'BST modifications and stateful iterators: Sorted Array to Balanced BST, Construct BST from Preorder, Recover BST (swapped nodes identified via inorder anomaly), BST Iterator (O(1) next, O(H) space), and Flatten BST to Sorted List.',
    rubricAtoms: ['Midpoint Subtree Balanced Construction', 'Controlled Stack Next-Pointer Iteration', 'Two Swapped Nodes Inorder Anomaly Detection', 'Preorder Monotonic Stack BST Reconstruction'],
    prerequisites: ['bst-validation-ordering'],
    anchorProblems: ['Sorted Array to Balanced BST', 'Construct from Preorder', 'Recover BST', 'BST Iterator', 'Flatten BST to Sorted list'],
    targetCompanies: ['Meta', 'Microsoft', 'Amazon', 'LinkedIn', 'Adobe', 'Google']
  },
  {
    slug: 'bst-advanced-serialization',
    topicId: 'DSA27',
    title: 'Advanced BST: Largest BST & Serialize',
    categorySlug: 'dsa-binary-search-trees',
    priority: 'P1',
    difficulty: 'ADVANCED',
    durationMin: 45,
    frequency: 89,
    weight: 88,
    trend: 'STABLE',
    description:
      'Complex BST problems: Largest BST Subtree in Binary Tree (bottom-up validation), Serialize & Deserialize BST, and Merge Two BSTs into a single balanced BST.',
    rubricAtoms: ['Subtree Validation Tuple (isBST, size, min, max)', 'Preorder String Serialization & Deserialization', 'Two-Tree Inorder Doubly Linked List Merge', 'Sorted DLL to Balanced BST O(N)'],
    prerequisites: ['bst-validation-ordering'],
    anchorProblems: ['Largest BST in BT', 'Serialize & Deserialize BST', 'Merge 2 BSTS'],
    targetCompanies: ['Microsoft', 'Amazon', 'Google', 'Meta', 'Oracle', 'Flipkart']
  },

  // Category 8: Heaps & Greedy (4 Topics)
  {
    slug: 'heaps-top-k-elements',
    topicId: 'DSA28',
    title: 'Heaps, Priority Queues & Top-K',
    categorySlug: 'dsa-heaps-greedy',
    priority: 'P0',
    difficulty: 'INTERMEDIATE',
    durationMin: 35,
    frequency: 98,
    weight: 97,
    trend: 'HOT',
    description:
      'Priority queues and order statistics: Kth Largest Element in an Array (Min-Heap of size K vs Quickselect), Top K Frequent Elements, Heap Sort implementation, and Merge K Sorted Arrays.',
    rubricAtoms: ['Min-Heap Size K Bounded Space', 'Quickselect Average O(N) Algorithm', 'Heapify O(N) Array Construction', 'Frequency Map Custom Comparator PriorityQueue'],
    prerequisites: ['arrays-two-pointers'],
    anchorProblems: ['K most Frequent Elements', 'Kth Smallest Element', 'Heap Sort', 'Merge K Sorted Arrays'],
    targetCompanies: ['Meta', 'Amazon', 'Google', 'Microsoft', 'Goldman Sachs', 'Uber']
  },
  {
    slug: 'heaps-two-heaps-streaming',
    topicId: 'DSA29',
    title: 'Two Heaps & Streaming Medians',
    categorySlug: 'dsa-heaps-greedy',
    priority: 'P0',
    difficulty: 'ADVANCED',
    durationMin: 45,
    frequency: 97,
    weight: 96,
    trend: 'HOT',
    description:
      'Continuous streaming median calculation and K-way merging: Find Median from Data Stream (Max-Heap for lower half + Min-Heap for upper half), Smallest Range Covering Elements from K Lists, and Merge K Sorted Lists.',
    rubricAtoms: ['Two-Heap Balance Invariant (diff <= 1)', 'O(log N) Stream Insertion & O(1) Median Query', 'Smallest Range K-Heap Minimum/Maximum Tracking', 'K-Way Merge Pointer Invariant'],
    prerequisites: ['heaps-top-k-elements'],
    anchorProblems: ['Median from Stream', 'Smallest Range in K Sorted List', 'Merge K Sorted Arrays'],
    targetCompanies: ['Google', 'Amazon', 'Meta', 'Apple', 'Microsoft', 'Pinterest', 'PhonePe']
  },
  {
    slug: 'greedy-intervals-scheduling',
    topicId: 'DSA30',
    title: 'Greedy Interval Scheduling',
    categorySlug: 'dsa-heaps-greedy',
    priority: 'P0',
    difficulty: 'INTERMEDIATE',
    durationMin: 40,
    frequency: 98,
    weight: 97,
    trend: 'HOT',
    description:
      'Greedy sorting and interval overlap manipulation: Merge Overlapping Intervals, Insert Interval, Non-overlapping Intervals, Activity Selection, Minimum Meeting Rooms (Chronological sweep-line vs Min-Heap), and Maximum Length of Pair Chain.',
    rubricAtoms: ['Interval Start vs End Time Sorting', 'Chronological Event Sweep-Line Algorithm', 'Greedy Non-Overlapping End-Time Selection', 'In-Place Interval Merging'],
    prerequisites: ['arrays-two-pointers'],
    anchorProblems: ['Merge overlapping intervals', 'Activity Selection', 'maximum length of pair chain', 'Non-overlapping intervals'],
    targetCompanies: ['Google', 'Meta', 'Amazon', 'Microsoft', 'Bloomberg', 'PhonePe']
  },
  {
    slug: 'greedy-optimization-sequencing',
    topicId: 'DSA31',
    title: 'Greedy Optimization & Sequencing',
    categorySlug: 'dsa-heaps-greedy',
    priority: 'P1',
    difficulty: 'INTERMEDIATE',
    durationMin: 35,
    frequency: 91,
    weight: 89,
    trend: 'STABLE',
    description:
      'Greedy choice property and optimal substructure: Job Sequencing with Deadlines (Disjoint Set Union / Max Profit Heap), Assign Cookies, Fractional Knapsack, Jump Game I & II, and Indian Coins change.',
    rubricAtoms: ['Greedy Choice Property Proof', 'Deadline Slot Allocation Invariant', 'Fractional Value-to-Weight Ratio Sorting', 'Jump Game Furthest Reach Boundary'],
    prerequisites: ['heaps-top-k-elements'],
    anchorProblems: ['Job Scheduling', 'Assign Cookies', 'Fractional Knapsack', 'Indian Coins'],
    targetCompanies: ['Amazon', 'Microsoft', 'Airbnb', 'Adobe', 'PhonePe', 'Accenture']
  },

  // Category 9: Trie & Prefix Trees (2 Topics)
  {
    slug: 'trie-prefix-tree-foundations',
    topicId: 'DSA32',
    title: 'Trie (Prefix Tree) Foundations',
    categorySlug: 'dsa-tries',
    priority: 'P0',
    difficulty: 'INTERMEDIATE',
    durationMin: 35,
    frequency: 96,
    weight: 94,
    trend: 'RISING',
    description:
      'Prefix tree data structure: Implement a Trie (insert, search, startsWith), Longest Common Prefix with Trie, Implement a Phone Directory (autocomplete), and Longest String with All Prefixes.',
    rubricAtoms: ['TrieNode Array vs HashMap Children', 'isEndOfWord Boolean Marker', 'Prefix Query Matching O(L)', 'Autocomplete Subtree Depth-First Search'],
    prerequisites: ['strings-palindromes-parsing'],
    anchorProblems: ['Implement a Trie', 'Longest Common Prefix', 'Implement a Phone Directory', 'Longest String with All Prefix'],
    targetCompanies: ['Google', 'Amazon', 'Apple', 'Meta', 'Uber', 'Nvidia', 'Samsung']
  },
  {
    slug: 'trie-advanced-word-search',
    topicId: 'DSA33',
    title: 'Advanced Trie & 2D Backtracking',
    categorySlug: 'dsa-tries',
    priority: 'P1',
    difficulty: 'ADVANCED',
    durationMin: 45,
    frequency: 92,
    weight: 91,
    trend: 'HOT',
    description:
      'Advanced prefix trees: Word Break Problem using Trie + Dynamic Programming, Word Search II (Trie + 2D Grid Backtracking with visited pruning), and Maximum XOR of Two Numbers in an Array (Bitwise Trie).',
    rubricAtoms: ['Trie Node Pruning in 2D Backtracking', 'Bitwise Binary Trie (0/1 Branches)', 'Maximum XOR Greedy Opposite Bit Walking', 'Word Break Trie Transition Optimization'],
    prerequisites: ['trie-prefix-tree-foundations'],
    anchorProblems: ['Word Break Problem', 'Word search'],
    targetCompanies: ['Amazon', 'Google', 'Netflix', 'Intuit', 'Walmart Labs', 'Salesforce']
  },

  // Category 10: Graphs (4 Topics)
  {
    slug: 'graph-traversals-islands',
    topicId: 'DSA34',
    title: 'Graph Traversals & Island Grids',
    categorySlug: 'dsa-graphs',
    priority: 'P0',
    difficulty: 'INTERMEDIATE',
    durationMin: 40,
    frequency: 99,
    weight: 98,
    trend: 'HOT',
    description:
      'Graph representation and grid exploration: Breadth-First Search (BFS), Depth-First Search (DFS), Number of Islands, Flood Fill Algorithm, 01 Matrix (nearest distance BFS), Number of Provinces, and Clone a Graph.',
    rubricAtoms: ['Adjacency List vs Grid Implicit Graph', 'Visited Set In-Place Marking', 'Multi-Source Shortest Distance BFS', 'Deep Copy Clone Graph Node Mapping'],
    prerequisites: ['binary-tree-dfs-traversals'],
    anchorProblems: ['Number of Islands', 'Flood Fill Algorithm', 'BFS', 'DFS', '01 Matrix', 'Number of Provinces', 'Clone a Graph'],
    targetCompanies: ['Amazon', 'Meta', 'Google', 'Microsoft', 'Apple', 'Adobe', 'Flipkart']
  },
  {
    slug: 'graph-cycles-bipartite',
    topicId: 'DSA35',
    title: 'Cycle Detection & Bipartite Graphs',
    categorySlug: 'dsa-graphs',
    priority: 'P0',
    difficulty: 'INTERMEDIATE',
    durationMin: 40,
    frequency: 96,
    weight: 95,
    trend: 'HOT',
    description:
      'Cycle detection and graph 2-colorability: Detect cycle in Undirected graph (BFS parent tracking vs DFS), Detect cycle in Directed graph (DFS recursion stack vs Kahn indegree BFS), and Check Bipartite Graph (2-color alternating BFS/DFS).',
    rubricAtoms: ['Undirected Parent Edge Disambiguation', 'Directed Recursion Stack Array Invariant', '2-Color Alternating Flag Bipartite Check', 'Disconnected Component Loop Iteration'],
    prerequisites: ['graph-traversals-islands'],
    anchorProblems: ['Detect cycle in undirected using BFS', 'Detect cycle in undirected using DFS', 'Detect cycle in directed using BFS', 'Detect cycle in directed using DFS', 'Check Bi-partite Graph'],
    targetCompanies: ['Google', 'Meta', 'Amazon', 'Microsoft', 'Adobe', 'Directi']
  },
  {
    slug: 'graph-topological-sort',
    topicId: 'DSA36',
    title: 'Topological Sorting & Dependency DAGs',
    categorySlug: 'dsa-graphs',
    priority: 'P0',
    difficulty: 'ADVANCED',
    durationMin: 45,
    frequency: 99,
    weight: 99,
    trend: 'HOT',
    description:
      'Directed Acyclic Graph (DAG) sequencing: Topological Sort using DFS post-order stack, Kahn’s Algorithm (BFS indegree queue), Course Schedule I & II, and Alien Dictionary (lexicographical character order graph).',
    rubricAtoms: ['Kahn Algorithm Indegree Array & Queue', 'DFS Post-Order Reversal Topological Invariant', 'Course Schedule Cycle Detection via Processed Count', 'Alien Dictionary Adjacent Word Character Graph'],
    prerequisites: ['graph-traversals-islands'],
    anchorProblems: ['Topological Sorting (DFS)', 'Topoplogical Sorting (BFS)', 'Course Schedule I & II', 'Alien Dictionary'],
    targetCompanies: ['Amazon', 'Google', 'Meta', 'LinkedIn', 'DoorDash', 'Flipkart', 'Salesforce']
  },
  {
    slug: 'graph-shortest-paths-dsu',
    topicId: 'DSA37',
    title: 'Shortest Paths & Disjoint Set Union',
    categorySlug: 'dsa-graphs',
    priority: 'P0',
    difficulty: 'ADVANCED',
    durationMin: 50,
    frequency: 98,
    weight: 98,
    trend: 'HOT',
    description:
      'Weighted graphs, minimum spanning trees, and disjoint sets: Dijkstra Algorithm with Min-Heap, Bellman-Ford (negative cycle detection), Floyd-Warshall (all-pairs), Disjoint Set Union (DSU with Path Compression & Union by Rank), Kruskal Algorithm (MST), Prim Algorithm, Cheapest Flights within K Stops, and Number of Ways to Arrive at Destination.',
    rubricAtoms: ['Dijkstra Greedy Distance Array & Min-Heap', 'DSU Find with Path Compression O(alpha(N))', 'DSU Union by Rank Invariant', 'Kruskal Edge Weight Sorting MST', 'Bellman-Ford N-1 Edge Relaxation'],
    prerequisites: ['graph-traversals-islands', 'heaps-top-k-elements'],
    anchorProblems: ['Dijkstra\'s Algorithm', 'Bellman Ford Algorithm', 'Floyd Warshall Algo', 'Kruskal\'s Algorithm (MST)', 'Prim\'s Algorithm (MST)', 'Cheapest Flights within K Stops', 'Number of Ways to Arrive at Destination', 'Most Stones Removed'],
    targetCompanies: ['Google', 'Amazon', 'Meta', 'Uber', 'Salesforce', 'Airbnb', 'Citadel', 'Stripe']
  },

  // Category 11: Dynamic Programming (5 Topics)
  {
    slug: 'dp-1d-arrays-subsequences',
    topicId: 'DSA38',
    title: '1D Dynamic Programming & LIS',
    categorySlug: 'dsa-dynamic-programming',
    priority: 'P0',
    difficulty: 'INTERMEDIATE',
    durationMin: 45,
    frequency: 99,
    weight: 99,
    trend: 'HOT',
    description:
      'Linear subproblem recurrence and sub-sequence optimization: Climbing Stairs, House Robber, Coin Change, Decode Ways, Longest Increasing Subsequence (LIS in O(N^2) DP and O(N log N) Patience Sorting Binary Search), Longest Bitonic Subsequence, and Stock Buy & Sell with Cooldown.',
    rubricAtoms: ['1D DP State Definition & Base Cases', 'LIS Binary Search Patience Sorting Invariant', 'Coin Change Fewest Coins Unbounded State', 'Space Optimization from O(N) to O(1) Variables'],
    prerequisites: ['arrays-two-pointers'],
    anchorProblems: ['Coin Change', 'Longest Increasing Subsequence', 'Longest Bitonic Subsequence', 'Buy & Sell Stocks I', 'Buy & Sell Stocks II'],
    targetCompanies: ['Amazon', 'Google', 'Meta', 'Microsoft', 'LinkedIn', 'Cisco', 'Adobe']
  },
  {
    slug: 'dp-knapsack-grid-strings-mcm',
    topicId: 'DSA39',
    title: 'Knapsack, 2D Grid, String DP & MCM',
    categorySlug: 'dsa-dynamic-programming',
    priority: 'P0',
    difficulty: 'ADVANCED',
    durationMin: 55,
    frequency: 99,
    weight: 99,
    trend: 'HOT',
    description:
      'Multi-dimensional dynamic programming mastery: 0-1 Knapsack, Unbounded Knapsack, Target Sum Subset, Unique Paths, Minimum Path Sum, Longest Common Subsequence (LCS), Longest Common Substring, Edit Distance, Longest Palindromic Subsequence, Wildcard Pattern Matching, Matrix Chain Multiplication (MCM), Palindromic Partitioning, and Egg Dropping.',
    rubricAtoms: ['0/1 Knapsack 2D-to-1D Space Optimization', 'Edit Distance 3-Operation Transition Matrix', 'LCS Diagonal Match & Max Propagation', 'Matrix Chain Multiplication (MCM) Partition Loop', 'Egg Dropping Dual Binary Search DP'],
    prerequisites: ['dp-1d-arrays-subsequences'],
    anchorProblems: ['0-1 Knapsack', 'Unbounded Knapsack', 'Target Sum Subset', 'Edit Distance', 'Longest Common Subsequence', 'Longest Common Substring', 'Palindromic Partitioning (MCM)', 'MCM', 'Egg Dropping', 'Wildcard Pattern Matching'],
    targetCompanies: ['Amazon', 'Microsoft', 'Google', 'Meta', 'Goldman Sachs', 'Atlassian', 'Uber']
  },

  // Category 12: Recursion, Backtracking & Bit Manipulation (2 Topics)
  {
    slug: 'backtracking-bits-combinatorics',
    topicId: 'DSA40',
    title: 'Backtracking, Permutations & Bitmasks',
    categorySlug: 'dsa-backtracking-bits',
    priority: 'P0',
    difficulty: 'ADVANCED',
    durationMin: 50,
    frequency: 97,
    weight: 96,
    trend: 'HOT',
    description:
      'Combinatorial state trees and bitwise representations: Subsets I & II (skipping duplicate branches), Combination Sum I & II, Palindrome Partitioning, N-Queens (bitwise diagonal attack masks), Sudoku Solver, Rat in a Maze, M-Coloring, Single Number I & II, and Bitmask DP representations.',
    rubricAtoms: ['Backtracking Choose-Explore-Unchoose Pattern', 'Duplicate Pruning in Sorted Combinations', 'N-Queens Diagonal Bitmask Constraint Checking', 'XOR Properties & Bitmask State Transitions'],
    prerequisites: ['binary-tree-dfs-traversals'],
    anchorProblems: ['Combination Sum I', 'Combination Sum II', 'Subsets II', 'N Queens', 'Sudoku Solver', 'Palindrome Partitioning', 'Rat in a Maze', 'Single Number', 'M Coloring', 'Knights Tour'],
    targetCompanies: ['Amazon', 'Google', 'Meta', 'Microsoft', 'Apple', 'Adobe', 'TCS', 'Infosys']
  }
];

export const DSA_TOPICS: TopicSeed[] = RAW_DSA_TOPICS.map((t) => ({
  ...t,
  questions: generateQuestionsForTopic(t as TopicSeed)
}));

