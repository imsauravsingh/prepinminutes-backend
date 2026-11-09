import { TopicSeed } from './types';
import { generateQuestionsForTopic } from './question-generator';

const RAW_PILLAR_3_CASE_STUDIES: Omit<TopicSeed, 'questions'>[] = [
  // Category 4: Hardware, State Machines & Games (8 Topics)
  {
    slug: 'parking-lot-system',
    topicId: 'LLDS01',
    title: 'Parking Lot Management System',
    categorySlug: 'lld-hardware-games',
    pillar: 'case-studies',
    priority: 'P0',
    difficulty: 'INTERMEDIATE',
    durationMin: 45,
    frequency: 99,
    weight: 98,
    trend: 'STABLE',
    description:
      'Low-level design of a multi-floor parking lot: vehicle sizing hierarchies (Motorcycle, Car, Truck), dynamic spot allocation strategies, entry/exit gate ticket lifecycles, and thread-safe spot locking.',
    rubricAtoms: [
      'Multi-Floor Spot Allocation Strategy',
      'Vehicle Hierarchy Polymorphism',
      'Thread-Safe Concurrent Spot Reservation',
      'Ticket Pricing Strategy Interfaces'
    ],
    prerequisites: ['solid-srp-ocp', 'behavioral-patterns-events', 'concurrency-thread-safety'],
    usedComponents: ['behavioral-patterns-events', 'creational-patterns'],
    foundedOn: ['solid-srp-ocp', 'concurrency-thread-safety']
  },
  {
    slug: 'elevator-system-dispatcher',
    topicId: 'LLDS02',
    title: 'Multi-Car Elevator Dispatcher',
    categorySlug: 'lld-hardware-games',
    pillar: 'case-studies',
    priority: 'P0',
    difficulty: 'ADVANCED',
    durationMin: 50,
    frequency: 98,
    weight: 97,
    trend: 'STABLE',
    description:
      'Multi-elevator dispatcher system: LOOK/SCAN scheduling algorithm, internal vs external floor request queues, State Pattern (MovingUp, MovingDown, Idle), emergency stops, and door interlocks.',
    rubricAtoms: [
      'Elevator Dispatching & LOOK Algorithm',
      'State Pattern for Elevator Motion',
      'Internal & External Request Queueing',
      'Thread-Safe Motor & Door Interlocks'
    ],
    prerequisites: ['behavioral-patterns-state', 'concurrency-thread-safety'],
    usedComponents: ['behavioral-patterns-state'],
    foundedOn: ['concurrency-thread-safety', 'solid-srp-ocp']
  },
  {
    slug: 'vending-machine-system',
    topicId: 'LLDS03',
    title: 'Automated Vending Machine',
    categorySlug: 'lld-hardware-games',
    pillar: 'case-studies',
    priority: 'P0',
    difficulty: 'INTERMEDIATE',
    durationMin: 40,
    frequency: 95,
    weight: 92,
    trend: 'STABLE',
    description:
      'Vending machine controller: State Pattern (Idle, HasMoney, Dispensing, SoldOut), coin/cash validation, inventory stock locks, change return calculation, and transaction cancel refunds.',
    rubricAtoms: [
      'State Pattern Finite State Machine',
      'Change Calculation & Coin Inventory',
      'Thread-Safe Inventory Deductions',
      'Transaction Cancellation & Refunds'
    ],
    prerequisites: ['behavioral-patterns-state', 'creational-patterns'],
    usedComponents: ['behavioral-patterns-state'],
    foundedOn: ['solid-srp-ocp']
  },
  {
    slug: 'atm-machine-system',
    topicId: 'LLDS04',
    title: 'Automated Teller Machine (ATM)',
    categorySlug: 'lld-hardware-games',
    pillar: 'case-studies',
    priority: 'P0',
    difficulty: 'ADVANCED',
    durationMin: 45,
    frequency: 94,
    weight: 90,
    trend: 'STABLE',
    description:
      'ATM hardware controller: Card reader validation, PIN security, Chain of Responsibility cash dispenser ($100, $50, $20 denominations), bank host transaction idempotency, and hardware state recovery.',
    rubricAtoms: [
      'Chain of Responsibility Cash Dispenser',
      'State Machine for Card & PIN Validation',
      'Transactional Balance Rollback Locks',
      'Hardware Sensor Error Handling'
    ],
    prerequisites: ['behavioral-patterns-state', 'concurrency-thread-safety'],
    usedComponents: ['behavioral-patterns-state', 'structural-patterns'],
    foundedOn: ['concurrency-thread-safety']
  },
  {
    slug: 'smart-locker-network',
    topicId: 'LLDS05',
    title: 'Smart Locker Delivery Network',
    categorySlug: 'lld-hardware-games',
    pillar: 'case-studies',
    priority: 'P1',
    difficulty: 'INTERMEDIATE',
    durationMin: 40,
    frequency: 88,
    weight: 85,
    trend: 'RISING',
    description:
      'Smart locker delivery system (Amazon Hub style): Compartment dimension matching (Small, Medium, Large), cryptographically secure OTP generation, package delivery/pickup lifecycle, and timeout return sweepers.',
    rubricAtoms: [
      'Compartment Allocation Strategy',
      'Secure OTP & Barcode Verification',
      'Locker Compartment State Transitions',
      'Timeout Sweeper & Package Returns'
    ],
    prerequisites: ['solid-srp-ocp', 'concurrency-thread-safety'],
    usedComponents: ['behavioral-patterns-events'],
    foundedOn: ['solid-srp-ocp']
  },
  {
    slug: 'chess-game-engine',
    topicId: 'LLDS06',
    title: 'Chess Game Engine',
    categorySlug: 'lld-hardware-games',
    pillar: 'case-studies',
    priority: 'P0',
    difficulty: 'ADVANCED',
    durationMin: 50,
    frequency: 96,
    weight: 94,
    trend: 'STABLE',
    description:
      'Object-oriented chess engine: 8x8 board matrix, piece movement strategy hierarchy (King, Queen, Rook, Bishop, Knight, Pawn), check/checkmate detection, castling, en passant, and move undo/redo Command history.',
    rubricAtoms: [
      'Piece Movement Strategy Hierarchy',
      'Board State & Check/Checkmate Validation',
      'Command Pattern for Move History & Undo',
      'Special Moves (Castling, En Passant, Promotion)'
    ],
    prerequisites: ['oop-pillars-production', 'behavioral-patterns-events'],
    usedComponents: ['behavioral-patterns-events'],
    foundedOn: ['oop-pillars-production', 'solid-srp-ocp']
  },
  {
    slug: 'card-game-blackjack',
    topicId: 'LLDS07',
    title: 'Online Blackjack & Card Engine',
    categorySlug: 'lld-hardware-games',
    pillar: 'case-studies',
    priority: 'P2',
    difficulty: 'INTERMEDIATE',
    durationMin: 35,
    frequency: 82,
    weight: 78,
    trend: 'STABLE',
    description:
      'Card game simulator: Standard 52-card deck, Fisher-Yates shuffle algorithm, hand score evaluation with dynamic Ace (1 or 11), dealer hit/stand rules, split/double-down actions, and payout strategies.',
    rubricAtoms: [
      'Card Deck & Fisher-Yates Shuffling',
      'Hand Evaluation & Dynamic Ace Scoring',
      'Dealer Strategy Rules (Hit on Soft 17)',
      'Betting & Payout Strategy Interfaces'
    ],
    prerequisites: ['oop-pillars-production', 'behavioral-patterns-state'],
    usedComponents: ['creational-patterns'],
    foundedOn: ['oop-pillars-production']
  },
  {
    slug: 'snake-and-ladder-game',
    topicId: 'LLDS08',
    title: 'Snake & Ladder Board Game',
    categorySlug: 'lld-hardware-games',
    pillar: 'case-studies',
    priority: 'P2',
    difficulty: 'BEGINNER',
    durationMin: 30,
    frequency: 80,
    weight: 75,
    trend: 'STABLE',
    description:
      'Multiplayer Snake & Ladder board game: Grid cell jump entities (Snakes and Ladders), configurable dice rolling strategies (biased/unbiased), player turn queue orchestrator, and victory condition termination.',
    rubricAtoms: [
      'Board Cell Jumper Polymorphism',
      'Dice Rolling Strategy Interface',
      'Player Turn Queue Orchestration',
      'Game Termination & Winner Evaluation'
    ],
    prerequisites: ['oop-pillars-production'],
    usedComponents: ['creational-patterns'],
    foundedOn: ['oop-pillars-production']
  },

  // Category 5: Booking, Scheduling & Financial Systems (6 Topics)
  {
    slug: 'movie-ticket-booking-system',
    topicId: 'LLDS09',
    title: 'Movie Ticket Booking (BookMyShow)',
    categorySlug: 'lld-booking-financial',
    pillar: 'case-studies',
    priority: 'P0',
    difficulty: 'ADVANCED',
    durationMin: 50,
    frequency: 99,
    weight: 99,
    trend: 'STABLE',
    description:
      'Cinema ticket reservation system: Cinema hall layouts, tiered seat pricing, temporary seat reservation locking with expiration sweepers, and concurrent booking race condition prevention.',
    rubricAtoms: [
      'Concurrent Seat Reservation Locking',
      'Temporary Hold & Timeout Sweeper Mechanism',
      'Tiered Seat Layout & Pricing Strategies',
      'Payment Gateway Facade & Rollback'
    ],
    prerequisites: ['concurrency-thread-safety', 'thread-safe-lru-lfu-cache'],
    usedComponents: ['thread-safe-lru-lfu-cache', 'behavioral-patterns-events'],
    foundedOn: ['concurrency-thread-safety', 'solid-srp-ocp']
  },
  {
    slug: 'splitwise-expense-sharing',
    topicId: 'LLDS10',
    title: 'Splitwise Expense Sharing Engine',
    categorySlug: 'lld-booking-financial',
    pillar: 'case-studies',
    priority: 'P0',
    difficulty: 'ADVANCED',
    durationMin: 50,
    frequency: 99,
    weight: 98,
    trend: 'SURGING',
    description:
      'Expense sharing engine: Split strategies (Equal, Exact, Percentage), group vs 1-on-1 balances, transaction ledgers, currency conversions, and greedy minimum cash-flow debt simplification algorithm.',
    rubricAtoms: [
      'Split Strategy Pattern (Equal/Exact/Percentage)',
      'Balance Sheet Ledger Tracking',
      'Greedy Debt Simplification Algorithm',
      'User & Group Relationship Hierarchy'
    ],
    prerequisites: ['solid-srp-ocp', 'creational-patterns'],
    usedComponents: ['creational-patterns', 'behavioral-patterns-events'],
    foundedOn: ['solid-srp-ocp', 'solid-dip-ioc']
  },
  {
    slug: 'meeting-room-scheduler',
    topicId: 'LLDS11',
    title: 'Multi-Tenant Meeting Room Scheduler',
    categorySlug: 'lld-booking-financial',
    pillar: 'case-studies',
    priority: 'P1',
    difficulty: 'INTERMEDIATE',
    durationMin: 40,
    frequency: 92,
    weight: 89,
    trend: 'STABLE',
    description:
      'Meeting room scheduling system: Time interval overlap detection (Interval Tree / Calendar intervals), recurring meeting rules (RRULE), room capacity/amenity filtering, and invitee calendar notifications.',
    rubricAtoms: [
      'Interval Scheduling & Conflict Detection',
      'Recurring Meeting Expansion Rules',
      'Room Capacity & Amenity Filter Strategies',
      'Observer Pattern for Invitee Notifications'
    ],
    prerequisites: ['solid-srp-ocp', 'concurrency-thread-safety'],
    usedComponents: ['behavioral-patterns-events'],
    foundedOn: ['solid-srp-ocp']
  },
  {
    slug: 'car-rental-system',
    topicId: 'LLDS12',
    title: 'Car Rental & Fleet Management',
    categorySlug: 'lld-booking-financial',
    pillar: 'case-studies',
    priority: 'P1',
    difficulty: 'INTERMEDIATE',
    durationMin: 40,
    frequency: 89,
    weight: 86,
    trend: 'STABLE',
    description:
      'Car rental management platform: Fleet vehicle classification (Sedan, SUV, Luxury), dynamic daily rate pricing strategy, reservation pickup/drop-off state transitions, and damage inspection add-ons.',
    rubricAtoms: [
      'Fleet Inventory & Vehicle Subtyping',
      'Dynamic Pricing Strategy Decorator',
      'Reservation Pickup/Return State Machine',
      'Addon Equipment & Insurance Composition'
    ],
    prerequisites: ['solid-srp-ocp', 'behavioral-patterns-events'],
    usedComponents: ['structural-patterns', 'behavioral-patterns-events'],
    foundedOn: ['solid-srp-ocp']
  },
  {
    slug: 'hotel-room-reservation',
    topicId: 'LLDS13',
    title: 'Hotel Room Reservation System',
    categorySlug: 'lld-booking-financial',
    pillar: 'case-studies',
    priority: 'P1',
    difficulty: 'INTERMEDIATE',
    durationMin: 40,
    frequency: 91,
    weight: 88,
    trend: 'STABLE',
    description:
      'Hotel reservation platform: Room types (Deluxe, Suite, Standard), seasonal pricing strategies, booking calendar holding locks, check-in/check-out lifecycle, and overbooking prevention guards.',
    rubricAtoms: [
      'Room Inventory Calendar Holding Locks',
      'Seasonal & Surge Pricing Strategies',
      'Check-in / Check-out State Machine',
      'Preventing Double-Booking Race Conditions'
    ],
    prerequisites: ['solid-srp-ocp', 'concurrency-thread-safety'],
    usedComponents: ['behavioral-patterns-events'],
    foundedOn: ['concurrency-thread-safety', 'solid-srp-ocp']
  },
  {
    slug: 'online-stock-brokerage',
    topicId: 'LLDS14',
    title: 'Online Stock Brokerage System',
    categorySlug: 'lld-booking-financial',
    pillar: 'case-studies',
    priority: 'P1',
    difficulty: 'ADVANCED',
    durationMin: 50,
    frequency: 93,
    weight: 91,
    trend: 'RISING',
    description:
      'Trading platform engine: In-memory order matching engine (FIFO price-time priority limit book), Market vs Limit orders, portfolio balance hold/deduct locks, and trade execution event emission.',
    rubricAtoms: [
      'Order Book Price-Time Priority Matching',
      'Market vs Limit Order Polymorphism',
      'Thread-Safe Account Balance Holds',
      'Trade Execution Event Emission'
    ],
    prerequisites: ['concurrency-thread-safety', 'in-memory-pubsub-broker'],
    usedComponents: ['in-memory-pubsub-broker', 'thread-safe-lru-lfu-cache'],
    foundedOn: ['concurrency-thread-safety']
  },

  // Category 6: Enterprise Platforms & Consumer Applications (6 Topics)
  {
    slug: 'ecommerce-shopping-cart',
    topicId: 'LLDS15',
    title: 'E-Commerce Shopping Cart & Checkout',
    categorySlug: 'lld-enterprise-platforms',
    pillar: 'case-studies',
    priority: 'P0',
    difficulty: 'INTERMEDIATE',
    durationMin: 45,
    frequency: 97,
    weight: 96,
    trend: 'STABLE',
    description:
      'E-commerce cart and checkout subsystem: Cart item quantity management, inventory holding locks during checkout, promo code discount strategy composition, and payment gateway facade integration.',
    rubricAtoms: [
      'Cart Item Quantity & Stock Verification',
      'Discount Strategy Pattern Composition',
      'Inventory Reservation with Expiration Sweeper',
      'Payment Gateway Facade & Idempotency'
    ],
    prerequisites: ['structural-patterns', 'behavioral-patterns-events'],
    usedComponents: ['structural-patterns', 'behavioral-patterns-events'],
    foundedOn: ['solid-srp-ocp']
  },
  {
    slug: 'food-delivery-fulfillment',
    topicId: 'LLDS16',
    title: 'Food Delivery Fulfillment (Swiggy/DoorDash)',
    categorySlug: 'lld-enterprise-platforms',
    pillar: 'case-studies',
    priority: 'P1',
    difficulty: 'ADVANCED',
    durationMin: 45,
    frequency: 94,
    weight: 92,
    trend: 'SURGING',
    description:
      'Food delivery orchestrator: Restaurant menu item customizations, delivery partner dispatch strategy, order status state machine (Placed, Accepted, Cooking, PickedUp, Delivered), and live location tracking.',
    rubricAtoms: [
      'Delivery Partner Dispatch Strategy',
      'Order Lifecycle State Machine',
      'Menu Item Addon & Customization Composition',
      'Event-Driven Order Status Updates'
    ],
    prerequisites: ['behavioral-patterns-events', 'behavioral-patterns-state'],
    usedComponents: ['behavioral-patterns-events', 'behavioral-patterns-state'],
    foundedOn: ['solid-srp-ocp']
  },
  {
    slug: 'community-qa-platform',
    topicId: 'LLDS17',
    title: 'Community Q&A Platform (StackOverflow)',
    categorySlug: 'lld-enterprise-platforms',
    pillar: 'case-studies',
    priority: 'P1',
    difficulty: 'INTERMEDIATE',
    durationMin: 40,
    frequency: 87,
    weight: 84,
    trend: 'STABLE',
    description:
      'Developer Q&A platform: Question, Answer, and Comment entity hierarchies, upvote/downvote scoring rules, tag indexing, bounty rewards, and reputation score calculation strategies.',
    rubricAtoms: [
      'Question & Answer Entity Hierarchy',
      'Reputation Scoring Strategy Pattern',
      'Tag Indexing & Multi-Filter Querying',
      'Thread-Safe Vote Aggregation'
    ],
    prerequisites: ['solid-srp-ocp', 'behavioral-patterns-events'],
    usedComponents: ['behavioral-patterns-events'],
    foundedOn: ['solid-srp-ocp']
  },
  {
    slug: 'social-networking-feed',
    topicId: 'LLDS18',
    title: 'Social & Professional Network Feed',
    categorySlug: 'lld-enterprise-platforms',
    pillar: 'case-studies',
    priority: 'P1',
    difficulty: 'ADVANCED',
    durationMin: 45,
    frequency: 93,
    weight: 90,
    trend: 'STABLE',
    description:
      'Social network feed subsystem: Bi-directional connections vs unidirectional follow graphs, activity post fan-out observer, privacy access rule decorators, and in-memory feed aggregation.',
    rubricAtoms: [
      'Connection Graph & Follower Relationships',
      'Fan-Out Activity Feed Observer Dispatch',
      'Privacy Filter Strategy Decorators',
      'Feed Ranking & Pagination Buffering'
    ],
    prerequisites: ['behavioral-patterns-events', 'in-memory-pubsub-broker'],
    usedComponents: ['behavioral-patterns-events', 'in-memory-pubsub-broker'],
    foundedOn: ['solid-srp-ocp']
  },
  {
    slug: 'sports-live-commentary',
    topicId: 'LLDS19',
    title: 'Live Sports Scoreboard & Commentary',
    categorySlug: 'lld-enterprise-platforms',
    pillar: 'case-studies',
    priority: 'P2',
    difficulty: 'INTERMEDIATE',
    durationMin: 40,
    frequency: 81,
    weight: 77,
    trend: 'STABLE',
    description:
      'Live sports scoreboard engine (Cricinfo style): Ball-by-ball event modeling, run/wicket state updates, batsman/bowler scorecard statistics calculation, and Observer subscriptions for live commentary feeds.',
    rubricAtoms: [
      'Match Event Domain Modeling',
      'Live Scorecard State Transitions',
      'Observer Subscriptions for Live Commentary',
      'Inning State & Over Completion Rules'
    ],
    prerequisites: ['behavioral-patterns-events'],
    usedComponents: ['behavioral-patterns-events'],
    foundedOn: ['solid-srp-ocp']
  },
  {
    slug: 'restaurant-kitchen-order',
    topicId: 'LLDS20',
    title: 'Restaurant Table & KOT Management',
    categorySlug: 'lld-enterprise-platforms',
    pillar: 'case-studies',
    priority: 'P2',
    difficulty: 'INTERMEDIATE',
    durationMin: 35,
    frequency: 83,
    weight: 79,
    trend: 'STABLE',
    description:
      'Restaurant table management and Kitchen Order Ticket (KOT) system: Table occupancy status, order item station routing (Appetizers, Mains, Drinks), bill generation, and split payment mechanics.',
    rubricAtoms: [
      'Table Reservation & Seating Status',
      'KOT Kitchen Station Order Routing',
      'Bill Generation & Split Payment Strategy',
      'Order Item State Machine (Ordered, Cooking, Served)'
    ],
    prerequisites: ['behavioral-patterns-state'],
    usedComponents: ['behavioral-patterns-state', 'behavioral-patterns-events'],
    foundedOn: ['solid-srp-ocp']
  }
];

export const LLD_PILLAR_3_CASE_STUDIES: TopicSeed[] = RAW_PILLAR_3_CASE_STUDIES.map((t) => ({
  ...t,
  questions: generateQuestionsForTopic(t as TopicSeed)
}));

