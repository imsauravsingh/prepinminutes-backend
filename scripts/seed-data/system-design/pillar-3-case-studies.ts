import { TopicSeed } from './types';

export const PILLAR_3_TOPICS: TopicSeed[] = [
  // ==========================================
  // Category 3.1: Basic Application Design
  // ==========================================
  {
    topicId: 'SYS001',
    slug: 'url-shortener',
    title: 'Design a URL Shortener (TinyURL)',
    categorySlug: 'basic-application-design',
    pillar: 'case-studies',
    priority: 'P1',
    difficulty: 'BEGINNER',
    durationMin: 45,
    frequency: 0.95,
    weight: 0.90,
    trend: 'STABLE',
    description: 'Design a high-throughput URL shortening service handling 100M new URLs/month and 10B redirects/month with sub-10ms redirect latency.',
    rubricAtoms: ['base62 encoding', 'id generation collisions', 'high-read cache hierarchy', 'http 301 vs 302 analytics', 'db sharding by hash'],
    prerequisites: ['intro-system-design', 'distributed-caching-redis', 'database-indexing-optimization'],
    usedComponents: ['load-balancers-traffic', 'distributed-caching-redis', 'rate-limiting-admission-control', 'db-replication-sharding'],
    foundedOn: ['latency-throughput-slos', 'cap-pacelc-theorems', 'acid-transactions-consistency'],
    questions: [
      {
        id: 'q_sys001_01',
        title: 'Encoding Strategy & Collision Avoidance',
        difficulty: 'BEGINNER',
        learningLevel: 'L1',
        archetype: 'mechanism',
        prompt: 'In TinyURL, how should you generate the 7-character short token? Compare MD5/SHA-256 truncation vs Base62 encoding over a distributed 64-bit ID generator (Snowflake/counter), specifically addressing collision probability and database round trips.',
        rubricGuide: 'Candidate must explain that hashing a long URL creates collisions requiring DB lookups and salt-appending. A 64-bit integer generator (e.g. Snowflake or distributed counter service) converted via Base62 ensures mathematical uniqueness with zero collision checks.',
        rubricAtoms: ['base62 math', 'snowflake unique id', 'collision roundtrip elimination', 'length capacity 62^7'],
        hints: ['What happens when two different users shorten the exact same destination URL at the same time?'],
        followUpProbes: ['How many unique combinations does a 7-character alphanumeric string provide, and how many years of 100M URLs/month does that support?'],
        expectedKeywords: ['Base62', 'Snowflake', 'MD5 hash', 'collision', 'pre-allocation', '62^7', '3.5 trillion']
      },
      {
        id: 'q_sys001_02',
        title: 'HTTP 301 vs 302 Redirect Semantics and Analytics Ingestion',
        difficulty: 'INTERMEDIATE',
        learningLevel: 'L2',
        archetype: 'trade-off',
        prompt: 'Should a URL shortener return an HTTP 301 Moved Permanently or an HTTP 302/307 Found status code? Explain the architectural impact on edge browser caching, server load, and click analytics tracking.',
        rubricGuide: 'Must explain that HTTP 301 causes browsers and intermediaries to cache the redirect permanently, reducing server load to zero on repeat visits but destroying real-time click tracking. HTTP 302/307 forces every request to hit the server or edge worker, enabling exact analytics.',
        rubricAtoms: ['http 301 browser cache', 'http 302 click analytics', 'edge worker intercept', 'kafka analytics event stream'],
        hints: ['If a user clicks the link 10 times in Chrome, how many requests reach your origin server under 301 vs 302?'],
        followUpProbes: ['How would you use Apache Kafka to buffer analytics events without degrading user redirect latency?'],
        expectedKeywords: ['HTTP 301', 'HTTP 302', 'browser cache', 'click tracking', 'analytics', 'Kafka async']
      }
    ]
  },
  {
    topicId: 'SYS002',
    slug: 'pastebin-service',
    title: 'Design a Pastebin / Text Sharing Platform',
    categorySlug: 'basic-application-design',
    pillar: 'case-studies',
    priority: 'P2',
    difficulty: 'INTERMEDIATE',
    durationMin: 45,
    frequency: 0.80,
    weight: 0.82,
    trend: 'STABLE',
    description: 'Design a text-sharing platform supporting code syntax highlighting, custom expiration TTLs, access password control, and anonymous multi-megabyte paste storage.',
    rubricAtoms: ['blob storage vs sql text', 'ttl expiration cleanup', 'read-heavy caching', 'anonymous abuse mitigation'],
    prerequisites: ['url-shortener', 'sql-vs-nosql-modeling'],
    usedComponents: ['cdn-edge-caching', 'distributed-caching-redis', 'rate-limiting-admission-control'],
    foundedOn: ['latency-throughput-slos', 'horizontal-vs-vertical-scaling'],
    questions: [
      {
        id: 'q_sys002_01',
        title: 'Paste Storage: Relational DB vs S3 Object Store',
        difficulty: 'INTERMEDIATE',
        learningLevel: 'L2',
        archetype: 'architecture',
        prompt: 'Pastes range from 100 bytes to 10 MB. Would you store the raw paste text in PostgreSQL TEXT columns, a NoSQL database (MongoDB/Cassandra), or AWS S3 Object Storage? Justify based on cost, memory pressure, and buffer pool fragmentation.',
        rubricGuide: 'Candidate should separate metadata (title, author, hash, created_at, expiration_at, size) in a relational or NoSQL database from the actual raw text stored as immutable blobs in S3/Blob store, especially for pastes > 64KB to avoid DB page fragmentation.',
        rubricAtoms: ['metadata vs payload separation', 's3 object storage cost', 'db buffer pool fragmentation', 'presigned url read'],
        hints: ['What happens to database cache hit rates when 10MB text strings are stored in the same tables as indexed query columns?'],
        followUpProbes: ['How do you handle pastes under 1KB efficiently without creating millions of tiny files in S3?'],
        expectedKeywords: ['S3', 'blob storage', 'metadata separation', 'buffer pool', 'fragmentation', 'CDN']
      }
    ]
  },
  {
    topicId: 'SYS003',
    slug: 'file-upload-storage',
    title: 'Design a File Upload & Storage Service (S3-like)',
    categorySlug: 'basic-application-design',
    pillar: 'case-studies',
    priority: 'P1',
    difficulty: 'INTERMEDIATE',
    durationMin: 45,
    frequency: 0.88,
    weight: 0.90,
    trend: 'STABLE',
    description: 'Design a resilient blob storage service supporting multi-gigabyte uploads, chunked resumable transfers, presigned authorization URLs, and high-concurrency downloads.',
    rubricAtoms: ['multipart chunked uploads', 'presigned s3 urls', 'etag checksum verification', 'async assembly pipeline', 'metadata consistency'],
    prerequisites: ['networking-protocols', 'api-gateway-reverse-proxy'],
    usedComponents: ['cdn-edge-caching', 'distributed-caching-redis', 'api-gateway-reverse-proxy'],
    foundedOn: ['latency-throughput-slos', 'acid-transactions-consistency'],
    questions: [
      {
        id: 'q_sys003_01',
        title: 'Resumable Multipart Upload Architecture',
        difficulty: 'INTERMEDIATE',
        learningLevel: 'L2',
        archetype: 'architecture',
        prompt: 'How does an object storage service handle a 50 GB file upload over an unreliable mobile or broadband connection? Detail the client-side chunking, initiate-part-complete lifecycle, and server-side assembly.',
        rubricGuide: 'Must articulate: 1) Initiate Multipart Upload API returns uploadId; 2) Client splits file into 5-10MB chunks; 3) Concurrently uploads parts with MD5/SHA256 checksums; 4) Retry only failed parts without restarting; 5) CompleteMultipartUpload verifies checksums and merges parts in metadata.',
        rubricAtoms: ['multipart lifecycle', 'upload id token', 'checksum verification etag', 'zero byte copy metadata merge'],
        hints: ['Does the server physically concatenate 50GB of disk blocks, or does it stitch chunk block pointers in the storage inode?'],
        followUpProbes: ['How do presigned S3 URLs offload data-plane traffic from application web servers?'],
        expectedKeywords: ['multipart upload', 'presigned URL', 'checksum', 'ETag', 'chunking', 'resumable']
      }
    ]
  },

  // ==========================================
  // Category 3.2: Communication & Media Systems
  // ==========================================
  {
    topicId: 'SYS004',
    slug: 'realtime-chat-messaging',
    title: 'Design Real-Time Chat (WhatsApp / Slack)',
    categorySlug: 'communication-systems',
    pillar: 'case-studies',
    priority: 'P1',
    difficulty: 'ADVANCED',
    durationMin: 45,
    frequency: 0.96,
    weight: 0.95,
    trend: 'STABLE',
    description: 'Design a distributed messaging service with 1:1 and group chats, bidirectional WebSocket sessions, online presence, delivery receipts (sent, delivered, read), and offline store-and-forward.',
    rubricAtoms: ['websocket gateway session routing', 'redis pub/sub or rabbitmq routing keys', 'message delivery receipts', 'offline message mailbox storage', 'group fan-out'],
    prerequisites: ['networking-protocols', 'kafka-event-streaming', 'distributed-caching-redis'],
    usedComponents: ['api-gateway-reverse-proxy', 'distributed-caching-redis', 'kafka-event-streaming', 'storage-engines-lsm-trees'],
    foundedOn: ['cap-pacelc-theorems', 'acid-transactions-consistency', 'distributed-clocks-ordering'],
    questions: [
      {
        id: 'q_sys004_01',
        title: 'Connection Termination & Gateway Session Routing',
        difficulty: 'ADVANCED',
        learningLevel: 'L3',
        archetype: 'architecture',
        prompt: 'When User A (connected to WebSocket Gateway 3) sends a message to User B (connected to WebSocket Gateway 12), describe how the system determines User B’s gateway and routes the message with sub-50ms latency.',
        rubricGuide: 'Must describe: 1) User connection state stored in Redis/DynamoDB (UserSession: userId -> gateway_instance_id); 2) Gateway 3 checks session store; 3) If online, publishes to message broker (Kafka topic or Redis PubSub channel partitioned by gatewayId); 4) Gateway 12 consumes and pushes over User B socket; 5) If offline, saves to offline message inbox.',
        rubricAtoms: ['session registry mapping', 'broker routing between gateways', 'offline store-and-forward fallback', 'heartbeat connection cleanup'],
        hints: ['What happens when Gateway 12 crashes suddenly without closing TCP sockets gracefully?'],
        followUpProbes: ['How do you handle group chats with 500 members without overwhelming the WebSocket gateway with fan-out?'],
        expectedKeywords: ['WebSocket', 'session store', 'Redis', 'gateway ID', 'Pub/Sub', 'heartbeat', 'offline queue']
      },
      {
        id: 'q_sys004_02',
        title: 'Message Delivery Guarantees & Status Receipts',
        difficulty: 'EXPERT',
        learningLevel: 'L4',
        archetype: 'mechanism',
        prompt: 'Explain how WhatsApp implements the three checkmarks: Single Gray (Sent), Double Gray (Delivered to recipient device), and Double Blue (Read by user). How does the system handle out-of-order delivery over erratic networks?',
        rubricGuide: 'Candidate must trace acknowledgment flow: Client A sends message with client_msg_id; Server persists and sends ACK_SENT to Client A (1 check). When Client B receives payload over socket, B automatically sends ACK_DELIVERED to server, server routes ACK to A (2 gray). When B opens conversation, sends ACK_READ (2 blue). Monotonic sequence IDs per conversation ensure gap detection.',
        rubricAtoms: ['idempotent client message id', 'three-way ack protocol', 'monotonic sequence ordering', 'offline sync reconciliation'],
        hints: ['Why should message IDs be generated on the sender client rather than the server?'],
        followUpProbes: ['How do you prevent a retry storm if the recipient disconnects right after receiving the payload before ACKing?'],
        expectedKeywords: ['client_msg_id', 'ACK', 'idempotency', 'monotonic sequence', 'delivery receipt', 'read receipt']
      }
    ]
  },
  {
    topicId: 'SYS005',
    slug: 'notification-platform',
    title: 'Design a Multi-Channel Notification Platform',
    categorySlug: 'communication-systems',
    pillar: 'case-studies',
    priority: 'P1',
    difficulty: 'INTERMEDIATE',
    durationMin: 45,
    frequency: 0.90,
    weight: 0.88,
    trend: 'STABLE',
    description: 'Design a unified notification engine routing transactional, promotional, and urgent alerts across APNS/FCM Push, SMS (Twilio), Email (SES), and In-App channels with user preference filters.',
    rubricAtoms: ['priority queues tiering', 'third party provider rate limiting', 'user opt-out preferences', 'idempotent notification deduplication', 'circuit breaker fallback'],
    prerequisites: ['kafka-event-streaming', 'rate-limiting-admission-control'],
    usedComponents: ['kafka-event-streaming', 'circuit-breaker-bulkhead', 'rate-limiting-admission-control', 'distributed-caching-redis'],
    foundedOn: ['acid-transactions-consistency', 'latency-throughput-slos'],
    questions: [
      {
        id: 'q_sys005_01',
        title: 'Priority Tiering and Third-Party Vendor Throttling',
        difficulty: 'INTERMEDIATE',
        learningLevel: 'L2',
        archetype: 'architecture',
        prompt: 'During a marketing campaign, millions of promotional emails flood the notification system at the exact moment a critical 2FA OTP SMS must be sent. How do you design the queueing architecture to guarantee sub-3-second OTP delivery?',
        rubricGuide: 'Candidate must separate queues by SLA priority (High/Urgent for OTP vs Normal/Low for marketing blasts). Dedicated worker pools pull from urgent queues. Rate limiters per downstream provider (Twilio, SendGrid) ensure bulk jobs don’t exhaust vendor API rate quotas.',
        rubricAtoms: ['priority queue isolation', 'dedicated worker pool', 'downstream quota rate limiter', 'sla guarantee'],
        hints: ['Can a single Kafka topic with one consumer group ensure OTPs jump ahead of 10M marketing messages?'],
        followUpProbes: ['What happens if Twilio returns HTTP 503 during a carrier outage? How does the retry mechanism avoid spamming?'],
        expectedKeywords: ['priority queue', 'dedicated workers', 'rate limiter', 'OTP', 'Twilio', 'bulk segregation']
      }
    ]
  },
  {
    topicId: 'SYS006',
    slug: 'email-campaign-system',
    title: 'Design an Email Delivery & Campaign Engine',
    categorySlug: 'communication-systems',
    pillar: 'case-studies',
    priority: 'P2',
    difficulty: 'ADVANCED',
    durationMin: 45,
    frequency: 0.78,
    weight: 0.80,
    trend: 'STABLE',
    description: 'Design a bulk email dispatch engine processing 50M marketing emails/day with IP warm-up reputation, bounce/complaint webhooks, suppression lists, and open/click tracking.',
    rubricAtoms: ['ip pool warming', 'bounce webhook processing', 'suppression list bloom filter', 'pixel tracking redirection'],
    prerequisites: ['notification-platform', 'kafka-event-streaming'],
    usedComponents: ['kafka-event-streaming', 'distributed-caching-redis', 'rate-limiting-admission-control'],
    foundedOn: ['horizontal-vs-vertical-scaling', 'acid-transactions-consistency'],
    questions: [
      {
        id: 'q_sys006_01',
        title: 'IP Reputation Warming & ISP Admission Control',
        difficulty: 'ADVANCED',
        learningLevel: 'L3',
        archetype: 'scenario-based',
        prompt: 'Why do ISPs (Gmail, Yahoo, Outlook) mark emails from a brand-new mail server IP address as spam or throttle them? How does an email delivery platform implement an automated IP warm-up schedule?',
        rubricGuide: 'Candidate must explain ISP trust metrics (DKIM, SPF, DMARC, sender IP reputation). New IPs start with zero reputation. Warm-up engines enforce strict daily volumetric ramps per ISP (e.g. Day 1: 50 emails/hour to Gmail, Day 2: 100/hr, doubling gradually while monitoring bounce/complaint rates).',
        rubricAtoms: ['dkim spf dmarc authentication', 'isp volumetric ramp', 'bounce rate monitoring', 'ip pool segregation'],
        hints: ['What happens if an automated campaign sends 500,000 emails to @gmail.com addresses from an IP that sent zero yesterday?'],
        followUpProbes: ['How do you instantly suppress hard-bounced email addresses using Bloom filters or Redis before future dispatches?'],
        expectedKeywords: ['IP warming', 'reputation', 'SPF', 'DKIM', 'bounce rate', 'throttling', 'suppression list']
      }
    ]
  },
  {
    topicId: 'SYS007',
    slug: 'video-conferencing-streaming',
    title: 'Design Video Conferencing & Live Streaming (Zoom/Twitch)',
    categorySlug: 'communication-systems',
    pillar: 'case-studies',
    priority: 'P2',
    difficulty: 'EXPERT',
    durationMin: 45,
    frequency: 0.84,
    weight: 0.88,
    trend: 'RISING',
    description: 'Design a low-latency real-time video conferencing platform using WebRTC, Selective Forwarding Units (SFUs), jitter buffers, and adaptive bitrate encoding.',
    rubricAtoms: ['webrtc peer-to-peer vs sfu vs mcu', 'udp vs tcp for media', 'jitter buffer packet loss concealment', 'simulcast adaptive bitrate', 'signaling websocket'],
    prerequisites: ['networking-protocols', 'realtime-chat-messaging'],
    usedComponents: ['load-balancers-traffic', 'service-discovery-health', 'api-gateway-reverse-proxy'],
    foundedOn: ['latency-throughput-slos'],
    questions: [
      {
        id: 'q_sys007_01',
        title: 'Media Architecture: SFU vs MCU vs Mesh WebRTC',
        difficulty: 'EXPERT',
        learningLevel: 'L4',
        archetype: 'trade-off',
        prompt: 'Compare Mesh (Full P2P), Multipoint Control Unit (MCU), and Selective Forwarding Unit (SFU) architectures for a 20-person video conference call. Which architecture should Zoom/Google Meet choose and why?',
        rubricGuide: 'Must analyze: 1) Mesh: Client uploads N-1 streams and downloads N-1 streams; collapses beyond 4 users due to client uplink bandwidth; 2) MCU: Server decodes, composites 20 video streams into 1 grid video, re-encodes; extremely heavy server CPU and introduces 200ms+ latency; 3) SFU: Clients upload 1-3 simulcast layers; SFU routes packets without transcoding; optimal scalability and minimal server latency.',
        rubricAtoms: ['mesh bandwidth bottleneck', 'mcu transcoding cpu cost', 'sfu packet forwarding efficiency', 'simulcast quality switching'],
        hints: ['In an MCU, what happens to server CPU when 100 meetings are transcoding simultaneously?'],
        followUpProbes: ['Why is UDP (via RTP/SRTP) universally preferred over TCP for real-time video audio streams?'],
        expectedKeywords: ['SFU', 'MCU', 'Mesh', 'WebRTC', 'simulcast', 'RTP', 'UDP', 'transcoding']
      }
    ]
  },
  {
    topicId: 'SYS024',
    slug: 'massive-live-event-chat',
    title: 'Design Massive-Scale Live Event & Fan-Out Chat (1M+ in 1 Room)',
    categorySlug: 'communication-systems',
    pillar: 'case-studies',
    priority: 'P1',
    difficulty: 'EXPERT',
    durationMin: 45,
    frequency: 0.92,
    weight: 0.94,
    trend: 'RISING',
    description: 'Design an extreme-concurrency live chat engine (like Twitch, YouTube Live, or Hotstar) where 1,000,000+ simultaneous viewers participate in a single hot room receiving 50,000 messages/second.',
    rubricAtoms: ['hierarchical fan out broker tree', 'message sampling and rate limiting', 'edge load shedding', 'client rendering throttle', 'hot room partitioning'],
    prerequisites: ['realtime-chat-messaging', 'kafka-event-streaming', 'load-balancers-traffic'],
    usedComponents: ['load-balancers-traffic', 'distributed-caching-redis', 'kafka-event-streaming', 'circuit-breaker-bulkhead'],
    foundedOn: ['latency-throughput-slos', 'horizontal-vs-vertical-scaling'],
    questions: [
      {
        id: 'q_sys024_01',
        title: 'Hierarchical Pub/Sub Fan-Out Trees & Message Conflation',
        difficulty: 'EXPERT',
        learningLevel: 'L5',
        archetype: 'architecture',
        prompt: 'In a single live chat room with 1,000,000 active viewers, 50,000 messages arrive per second. A naive broadcast would generate 50 billion outbound messages/second, instantly crushing network cards. Design the hierarchical distribution tree, message sampling, and conflation architecture to broadcast smoothly without lag.',
        rubricGuide: 'Candidate must explain: 1) Ingestion brokers shard incoming messages and publish to Kafka; 2) Edge distribution tree: Level 1 regional aggregators conflate/sample messages (e.g. drop duplicates, limit to top 100 msgs/sec); 3) Level 2 WebSocket gateways receive batch streams and fan out to connected client sockets; 4) Client-side throttle: UI renders max 20 messages/second with batch DOM updates to prevent browser freezing.',
        rubricAtoms: ['hierarchical fan out tree', 'message conflation sampling', 'regional distribution nodes', 'client rendering throttle'],
        hints: ['Can a human eye read 50,000 messages scrolling per second on a mobile screen?'],
        followUpProbes: ['How do you ensure VIP/moderator messages bypass the sampling filter and reach 100% of viewers?'],
        expectedKeywords: ['fan-out tree', 'hierarchical', 'message sampling', 'conflation', 'Twitch', 'hot room', 'throttle']
      }
    ]
  },

  // ==========================================
  // Category 3.3: Commerce & Financial Systems
  // ==========================================
  {
    topicId: 'SYS008',
    slug: 'ecommerce-platform',
    title: 'Design an E-Commerce Platform (Amazon)',
    categorySlug: 'commerce-transaction-systems',
    pillar: 'case-studies',
    priority: 'P1',
    difficulty: 'ADVANCED',
    durationMin: 45,
    frequency: 0.96,
    weight: 0.94,
    trend: 'STABLE',
    description: 'Design an e-commerce platform supporting a 50M item product catalog, high-concurrency cart checkout, inventory reservation, and distributed order processing state machines.',
    rubricAtoms: ['inventory decrement race condition', 'cart storage session vs db', 'saga distributed order orchestration', 'cqrs product search vs order write'],
    prerequisites: ['database-indexing-optimization', 'transactional-outbox-cdc', 'saga-pattern-cqrs'],
    usedComponents: ['distributed-caching-redis', 'kafka-event-streaming', 'saga-pattern-cqrs', 'api-gateway-reverse-proxy'],
    foundedOn: ['acid-transactions-consistency', 'cap-pacelc-theorems'],
    questions: [
      {
        id: 'q_sys008_01',
        title: 'High-Concurrency Inventory Reservation & Overselling Prevention',
        difficulty: 'ADVANCED',
        learningLevel: 'L3',
        archetype: 'scenario-based',
        prompt: 'During a Black Friday flash sale, 10,000 customers click "Buy Now" simultaneously for an item with only 50 units in stock. How do you prevent inventory overselling while maintaining sub-100ms checkout response times?',
        rubricGuide: 'Candidate must reject naive read-modify-write in SQL. Solutions include: 1) Atomic SQL decrement: UPDATE inventory SET available = available - 1 WHERE item_id = ? AND available > 0; 2) Redis atomic reservation via Lua script: check available stock, decrement, and record temporary 15-minute lease with TTL; 3) Asynchronous Saga checkout workflow.',
        rubricAtoms: ['atomic condition update', 'redis lua script reservation', 'lease ttl hold', 'oversell race condition elimination'],
        hints: ['What happens if a database row lock holds for 50ms while 10,000 transactions queue behind it?'],
        followUpProbes: ['How do you release the reserved stock if the customer abandons the payment gateway step?'],
        expectedKeywords: ['atomic update', 'Redis Lua', 'inventory hold', 'reservation lease', 'Saga', 'row lock contention']
      }
    ]
  },
  {
    topicId: 'SYS009',
    slug: 'payment-gateway-ledger',
    title: 'Design a Payment Gateway & Accounting Ledger',
    categorySlug: 'commerce-transaction-systems',
    pillar: 'case-studies',
    priority: 'P1',
    difficulty: 'EXPERT',
    durationMin: 45,
    frequency: 0.94,
    weight: 0.96,
    trend: 'STABLE',
    description: 'Design a mission-critical payment processing system with double-entry bookkeeping, two-phase charge authorization/capture, strict idempotency, and PCI-DSS data boundaries.',
    rubricAtoms: ['double entry ledger balance invariance', 'idempotency key transaction store', 'two-phase auth and capture', 'pci dss tokenization vault', 'reconciliation worker'],
    prerequisites: ['acid-transactions-consistency', 'transactional-outbox-cdc'],
    usedComponents: ['transactional-outbox-cdc', 'distributed-locks-fencing', 'db-replication-sharding'],
    foundedOn: ['acid-transactions-consistency', 'cap-pacelc-theorems'],
    questions: [
      {
        id: 'q_sys009_01',
        title: 'Double-Entry Bookkeeping Ledger Invariance',
        difficulty: 'EXPERT',
        learningLevel: 'L4',
        archetype: 'architecture',
        prompt: 'Why is a simple "balance" column on an Account table insufficient for a financial banking system? Explain the architecture of an immutable, append-only double-entry ledger where debits equal credits.',
        rubricGuide: 'Candidate must explain that mutable balances hide audit trails, permit unauthorized overwrites, and make reconciliation impossible. A double-entry ledger uses an append-only transaction entry log: every transaction consists of at least two postings (Debit and Credit) where SUM(debits) - SUM(credits) == 0. Account balance is a materialized view derived from the immutable journal.',
        rubricAtoms: ['append only journal', 'debit credit sum zero', 'audit trail immutability', 'materialized balance snapshot'],
        hints: ['If a bug sets balance = balance - 100 twice, how do auditors prove where the missing funds went?'],
        followUpProbes: ['How do you quickly query the current balance without scanning 5 years of historical ledger rows?'],
        expectedKeywords: ['double-entry', 'debit', 'credit', 'append-only', 'audit trail', 'materialized view', 'ledger']
      },
      {
        id: 'q_sys009_02',
        title: 'End-to-End Idempotency in Payment Processing',
        difficulty: 'ADVANCED',
        learningLevel: 'L3',
        archetype: 'mechanism',
        prompt: 'A mobile user presses "Pay $100". The payment takes 6 seconds, and the user’s Wi-Fi drops. The app reconnects and retries the request. How does the payment gateway guarantee the user is charged exactly once?',
        rubricGuide: 'Must explain client-generated Idempotency-Key passed in HTTP headers. The gateway opens a database transaction, checks for existing IdempotencyKey record: 1) If found with completed response, returns cached response immediately; 2) If in progress, rejects duplicate request or waits; 3) If new, inserts key with status PENDING, calls banking partner, updates status to SUCCESS with response payload.',
        rubricAtoms: ['client idempotency key', 'atomic state check-and-insert', 'deduplication table', 'cached response replay'],
        hints: ['What if two duplicate requests arrive within 1 millisecond of each other before the first completes?'],
        followUpProbes: ['How do you pass the idempotency key to downstream credit card networks (Stripe/Visa) so they also don’t double charge?'],
        expectedKeywords: ['Idempotency-Key', 'unique constraint', 'atomic insert', 'deduplication', 'Stripe', 'transactional']
      }
    ]
  },
  {
    topicId: 'SYS010',
    slug: 'ticket-booking-platform',
    title: 'Design Ticket Booking (Ticketmaster)',
    categorySlug: 'commerce-transaction-systems',
    pillar: 'case-studies',
    priority: 'P1',
    difficulty: 'ADVANCED',
    durationMin: 45,
    frequency: 0.92,
    weight: 0.92,
    trend: 'STABLE',
    description: 'Design a concert ticket reservation platform handling millions of fans competing for 50,000 stadium seats, virtual waiting rooms, seat map locking, and anti-scalping defenses.',
    rubricAtoms: ['virtual waiting room queue', 'seat selection distributed lease lock', 'fair token generation', 'anti-bot admission rate limit'],
    prerequisites: ['distributed-locks-fencing', 'rate-limiting-admission-control', 'distributed-caching-redis'],
    usedComponents: ['distributed-locks-fencing', 'rate-limiting-admission-control', 'distributed-caching-redis', 'load-balancers-traffic'],
    foundedOn: ['acid-transactions-consistency', 'horizontal-vs-vertical-scaling'],
    questions: [
      {
        id: 'q_sys010_01',
        title: 'Virtual Waiting Room & Traffic Gatekeeping',
        difficulty: 'ADVANCED',
        learningLevel: 'L3',
        archetype: 'architecture',
        prompt: 'When Taylor Swift tickets go on sale, 5 million users hit the site within 10 seconds. How does a virtual waiting room (queue) protect backend databases from collapsing while guaranteeing fairness?',
        rubricGuide: 'Candidate must describe edge gatekeeping: 1) Static assets served by CDN; 2) Incoming users receive a cryptographically signed queue token (JWT with assigned queue number or hash); 3) Real-time polling or WebSocket stream updates user queue position; 4) Backend admissions controller releases batches (e.g. 1,000 users/minute) into the seat selection flow.',
        rubricAtoms: ['signed queue token', 'edge admission control', 'controlled drain rate', 'bot mitigation challenge'],
        hints: ['Why should users who arrive before 10:00 AM be placed in a randomized pre-queue rather than first-come-first-served?'],
        followUpProbes: ['How does the seat selection screen hold a seat for 10 minutes without locking the entire stadium database table?'],
        expectedKeywords: ['virtual waiting room', 'token', 'admission control', 'rate limiting', 'queue number', 'CDN']
      }
    ]
  },
  {
    topicId: 'SYS011',
    slug: 'fraud-risk-detection',
    title: 'Design Real-Time Fraud & Risk Detection Engine (Stripe Radar)',
    categorySlug: 'commerce-transaction-systems',
    pillar: 'case-studies',
    priority: 'P2',
    difficulty: 'EXPERT',
    durationMin: 45,
    frequency: 0.82,
    weight: 0.88,
    trend: 'RISING',
    description: 'Design a sub-50ms fraud scoring engine processing millions of credit card transactions using rule evaluation, sliding-window velocity counters, and ML risk models.',
    rubricAtoms: ['sub-50ms latency budget', 'apache flink stateful streaming', 'sliding window velocity counters', 'cardholder graph ring detection'],
    prerequisites: ['kafka-event-streaming', 'metrics-observability-platform'],
    usedComponents: ['kafka-event-streaming', 'distributed-caching-redis', 'storage-engines-lsm-trees'],
    foundedOn: ['latency-throughput-slos', 'cap-pacelc-theorems'],
    questions: [
      {
        id: 'q_sys011_01',
        title: 'Sub-50ms Stateful Sliding-Window Aggregations',
        difficulty: 'EXPERT',
        learningLevel: 'L4',
        archetype: 'mechanism',
        prompt: 'To detect card testing, the fraud engine must answer: "How many failed transactions occurred on this card fingerprint in the last 10 minutes across all global merchants?" within 15 milliseconds. Design the storage and aggregation architecture.',
        rubricGuide: 'Candidate must reject heavy SQL COUNT(*) queries across tables. Propose: 1) Stream processor (Apache Flink) maintaining stateful keyed sliding windows; or 2) Redis sliding window logs using ZSET (scores as epoch timestamps, ZREMRANGEBYSCORE to drop > 10m entries, ZCARD for count); 3) In-memory feature store (Feast/Redis) for instant feature retrieval.',
        rubricAtoms: ['redis zset sliding window', 'apache flink stateful stream', 'low latency feature store', 'asynchronous shadow scoring'],
        hints: ['What is the algorithmic complexity of Redis ZCARD and ZREMRANGEBYSCORE?'],
        followUpProbes: ['If the ML model scoring takes 100ms, how do you keep the primary checkout authorization under the 50ms payment SLA?'],
        expectedKeywords: ['sliding window', 'Redis ZSET', 'Flink', 'feature store', 'sub-50ms', 'velocity checks']
      }
    ]
  },

  // ==========================================
  // Category 3.4: Social & Content Platforms
  // ==========================================
  {
    topicId: 'SYS012',
    slug: 'social-news-feed',
    title: 'Design a Social Media News Feed (Twitter/X)',
    categorySlug: 'social-content-platforms',
    pillar: 'case-studies',
    priority: 'P1',
    difficulty: 'ADVANCED',
    durationMin: 45,
    frequency: 0.98,
    weight: 0.96,
    trend: 'STABLE',
    description: 'Design a social news feed platform supporting post publishing, timeline generation, fan-out write vs read trade-offs, and celebrity user handling.',
    rubricAtoms: ['fan-out-on-write vs fan-out-on-read', 'celebrity user hybrid model', 'timeline redis list cache', 'feed ranking algorithm'],
    prerequisites: ['distributed-caching-redis', 'kafka-event-streaming', 'database-indexing-optimization'],
    usedComponents: ['distributed-caching-redis', 'kafka-event-streaming', 'cdn-edge-caching', 'api-gateway-reverse-proxy'],
    foundedOn: ['latency-throughput-slos', 'horizontal-vs-vertical-scaling', 'acid-transactions-consistency'],
    questions: [
      {
        id: 'q_sys012_01',
        title: 'Fan-Out-on-Write vs Fan-Out-on-Read: The Celebrity Problem',
        difficulty: 'ADVANCED',
        learningLevel: 'L3',
        archetype: 'trade-off',
        prompt: 'Contrast Push (fan-out on write) and Pull (fan-out on read) models for social timeline generation. Why does a pure push model collapse when a user like Elon Musk with 150M followers posts a tweet?',
        rubricGuide: 'Must explain: Push writes post ID to each follower’s Redis timeline cache instantly, delivering O(1) read latency. However, 150M followers requires 150M Redis writes per tweet, causing massive write amplification and lag. Hybrid solution: Push for standard users (<20k followers); Pull for celebrities (followers merge celebrity posts at read time).',
        rubricAtoms: ['write amplification push', 'o1 read latency', 'celebrity pull merge at read', 'hybrid threshold'],
        hints: ['How long does it take to execute 150 million LPUSH commands into Redis?'],
        followUpProbes: ['How do you paginate timelines efficiently without offset pagination issues caused by new incoming tweets?'],
        expectedKeywords: ['fan-out-on-write', 'fan-out-on-read', 'celebrity problem', 'hybrid', 'write amplification', 'Redis LPUSH']
      }
    ]
  },
  {
    topicId: 'SYS013',
    slug: 'search-engine-crawler',
    title: 'Design a Search Engine & Web Crawler',
    categorySlug: 'social-content-platforms',
    pillar: 'case-studies',
    priority: 'P2',
    difficulty: 'ADVANCED',
    durationMin: 45,
    frequency: 0.85,
    weight: 0.88,
    trend: 'STABLE',
    description: 'Design a distributed web crawler indexing 10 billion web pages with politeness policies, URL frontier prioritization, duplicate content deduplication, and inverted index building.',
    rubricAtoms: ['url frontier priority and politeness', 'robots.txt cache parser', 'content simhash fingerprinting', 'inverted index postings list'],
    prerequisites: ['cap-pacelc-theorems', 'storage-engines-lsm-trees'],
    usedComponents: ['kafka-event-streaming', 'storage-engines-lsm-trees', 'service-discovery-health'],
    foundedOn: ['horizontal-vs-vertical-scaling', 'latency-throughput-slos'],
    questions: [
      {
        id: 'q_sys013_01',
        title: 'URL Frontier: Politeness, Priority, and Cycle Traps',
        difficulty: 'ADVANCED',
        learningLevel: 'L3',
        archetype: 'mechanism',
        prompt: 'How does a production web crawler organize its URL Frontier to crawl high-priority pages first without violating target domain politeness policies (e.g. max 1 request/second per host)?',
        rubricGuide: 'Candidate should describe two-stage frontier queues: 1) Priority queues (classify URLs by PageRank, freshness, domain trust); 2) Politeness queues (one queue per target hostname, accessed by a delay scheduler respecting robots.txt Crawl-Delay); 3) Visited URL Bloom filter to eliminate loops and spider traps.',
        rubricAtoms: ['two-stage priority politeness queues', 'hostname delay scheduler', 'robots.txt parsing cache', 'bloom filter deduplication'],
        hints: ['What happens if 100 crawler threads all try to download pages from the same small blog server simultaneously?'],
        followUpProbes: ['How do you detect duplicate or near-duplicate web pages without storing the entire HTML text in memory?'],
        expectedKeywords: ['URL frontier', 'politeness', 'robots.txt', 'priority queue', 'Bloom filter', 'SimHash']
      }
    ]
  },
  {
    topicId: 'SYS014',
    slug: 'search-autocomplete-typeahead',
    title: 'Design Search Autocomplete / Typeahead (Google)',
    categorySlug: 'social-content-platforms',
    pillar: 'case-studies',
    priority: 'P1',
    difficulty: 'INTERMEDIATE',
    durationMin: 45,
    frequency: 0.94,
    weight: 0.92,
    trend: 'STABLE',
    description: 'Design a real-time autocomplete suggestion service responding in under 30ms for prefix queries using distributed Tries, frequency ranking, and browser-edge caching.',
    rubricAtoms: ['trie prefix tree structure', 'top-k precomputation at trie nodes', 'browser debouncing and cache', 'offline batch aggregation for frequency'],
    prerequisites: ['distributed-caching-redis', 'cdn-edge-caching'],
    usedComponents: ['cdn-edge-caching', 'distributed-caching-redis', 'load-balancers-traffic'],
    foundedOn: ['latency-throughput-slos', 'horizontal-vs-vertical-scaling'],
    questions: [
      {
        id: 'q_sys014_01',
        title: 'Trie Optimization: Top-K Precomputation and Sharding',
        difficulty: 'INTERMEDIATE',
        learningLevel: 'L2',
        archetype: 'architecture',
        prompt: 'A naive Trie traverses from the prefix node down to all child leaves to collect and sort suggestions on every keystroke. How do you optimize the Trie data structure and shard it across memory to serve queries in under 10ms?',
        rubricGuide: 'Candidate must explain: 1) Precomputing top-K (e.g. top 5) query strings at each Trie node so lookup is O(length of prefix) with zero child traversal; 2) Sharding the Trie across servers based on prefix characters (e.g. server 1: a-m, server 2: n-z) or hash of prefix; 3) Updating frequencies asynchronously via MapReduce/Spark batch pipelines.',
        rubricAtoms: ['top-k precomputed at each node', 'o(p) lookup time complexity', 'prefix-based or consistent hash sharding', 'async offline frequency updates'],
        hints: ['If a user types "app", why should the server not do a DFS to find "apple", "application", "applet" in real time?'],
        followUpProbes: ['How do HTTP caching headers (Cache-Control: private, max-age=3600) and client-side debouncing reduce keystroke traffic by 80%?'],
        expectedKeywords: ['Trie', 'Top-K', 'prefix', 'precomputation', 'sharding', 'debouncing', 'cache']
      }
    ]
  },

  // ==========================================
  // Category 3.5: Streaming, Media & Location Systems
  // ==========================================
  {
    topicId: 'SYS015',
    slug: 'video-streaming-platform',
    title: 'Design Video Streaming & VOD Distribution (YouTube / Netflix)',
    categorySlug: 'media-location-systems',
    pillar: 'case-studies',
    priority: 'P1',
    difficulty: 'ADVANCED',
    durationMin: 45,
    frequency: 0.95,
    weight: 0.95,
    trend: 'STABLE',
    description: 'Design a video on demand (VOD) platform handling video upload, asynchronous multi-resolution transcoding pipelines, adaptive bitrate streaming (HLS/DASH), and global CDN delivery.',
    rubricAtoms: ['hls dash adaptive bitrate manifests', 'asynchronous chunked transcoding workers', 'cdn edge caching byte-range requests', 'blob storage origin shield'],
    prerequisites: ['file-upload-storage', 'cdn-edge-caching', 'kafka-event-streaming'],
    usedComponents: ['cdn-edge-caching', 'kafka-event-streaming', 'storage-engines-lsm-trees', 'load-balancers-traffic'],
    foundedOn: ['latency-throughput-slos', 'horizontal-vs-vertical-scaling'],
    questions: [
      {
        id: 'q_sys015_01',
        title: 'Adaptive Bitrate Streaming (ABR) and Manifest Architecture',
        difficulty: 'ADVANCED',
        learningLevel: 'L3',
        archetype: 'mechanism',
        prompt: 'How does Adaptive Bitrate Streaming (HLS / MPEG-DASH) allow a mobile video player on a moving train to switch seamlessly between 1080p, 720p, and 360p without buffering or screen freezing?',
        rubricGuide: 'Must explain: 1) Video is encoded into multiple bitrate/resolution renditions; 2) Each rendition is split into small 2-6 second chunks (.ts or .m4s); 3) Master playlist (.m3u8) lists available streams and sub-playlists list segment URLs; 4) Client video player monitors network throughput and buffer occupancy, requesting higher/lower chunks dynamically.',
        rubricAtoms: ['hls manifest m3u8 file', 'chunk segmentation 2 to 6 sec', 'client-driven bandwidth detection', 'seamless chunk boundary transition'],
        hints: ['Does the server decide when to downgrade video quality, or does the client player choose?'],
        followUpProbes: ['How do CDN byte-range requests and origin shielding prevent thundering herd spikes when a viral video is uploaded?'],
        expectedKeywords: ['HLS', 'DASH', 'm3u8', 'adaptive bitrate', 'transcoding', 'CDN', 'chunks']
      }
    ]
  },
  {
    topicId: 'SYS016',
    slug: 'ride-sharing-dispatch',
    title: 'Design Ride-Sharing & Dispatch (Uber / Lyft)',
    categorySlug: 'media-location-systems',
    pillar: 'case-studies',
    priority: 'P1',
    difficulty: 'EXPERT',
    durationMin: 45,
    frequency: 0.96,
    weight: 0.95,
    trend: 'STABLE',
    description: 'Design a real-time geospatial ride matching platform tracking millions of active drivers, calculating dynamic surge pricing, and executing sub-second dispatch matching.',
    rubricAtoms: ['geospatial indexing uber h3 vs google s2', 'driver location update ingestion pipeline', 'dispatch matching algorithms', 'trip state machine consistency'],
    prerequisites: ['realtime-chat-messaging', 'distributed-caching-redis', 'kafka-event-streaming'],
    usedComponents: ['distributed-caching-redis', 'kafka-event-streaming', 'api-gateway-reverse-proxy', 'distributed-locks-fencing'],
    foundedOn: ['latency-throughput-slos', 'acid-transactions-consistency', 'horizontal-vs-vertical-scaling'],
    questions: [
      {
        id: 'q_sys016_01',
        title: 'Geospatial Indexing: Uber H3 Hexagonal Hierarchies vs Geohash',
        difficulty: 'ADVANCED',
        learningLevel: 'L3',
        archetype: 'comparison',
        prompt: 'Why did Uber create and adopt H3 (hexagonal hierarchical spatial index) over rectangular Geohash or QuadTrees for driver dispatch and surge pricing calculations?',
        rubricGuide: 'Candidate must explain that in square/rectangular geohashes, neighboring cells have two different distances (orthogonal vs diagonal neighbors, distortion factor 1.414). Hexagons have a single invariant neighbor distance: all 6 adjacent neighbors are equidistant. This simplifies radius searches, smoothing algorithms, and continuous geographic surge boundary calculations.',
        rubricAtoms: ['equidistant neighbor property', 'geohash diagonal distortion', 'hierarchical resolution nesting', 'radius search efficiency'],
        hints: ['Draw a square grid vs a honeycomb hexagonal grid. What is the distance from the center cell to its corner neighbor in a square?'],
        followUpProbes: ['If 1 million drivers send GPS updates every 4 seconds (250k QPS), how do you ingest and store locations without melting the database?'],
        expectedKeywords: ['H3', 'hexagons', 'Geohash', 'equidistant', 'spatial index', 'surge pricing', 'QuadTree']
      },
      {
        id: 'q_sys016_02',
        title: 'Ride Dispatching State Machine & Race Condition Locking',
        difficulty: 'EXPERT',
        learningLevel: 'L4',
        archetype: 'failure-analysis',
        prompt: 'When multiple riders request rides in the same street block simultaneously, how do you prevent two riders from being matched to the same driver? Detail the distributed locking and trip offer lifecycle.',
        rubricGuide: 'Candidate must trace trip matching: 1) Dispatch engine ranks top candidate drivers; 2) Acquires a temporary distributed lock or lease on DriverId (e.g. Redis SETNX driver_lock:123 with 15-second TTL); 3) Sends ride offer push notification to driver; 4) If accepted, transitions trip state to MATCHED; 5) If rejected or timed out, releases lock and cascades offer to next driver.',
        rubricAtoms: ['distributed lock driver lease', 'trip state machine transition', 'timeout cascade to next candidate', 'idempotent acceptance'],
        hints: ['What happens if the driver’s phone loses connectivity while deciding to accept or decline?'],
        followUpProbes: ['How do you ensure trip state transitions (REQUESTED -> OFFERED -> ACCEPTED -> ARRIVED -> IN_PROGRESS -> COMPLETED) obey strict ACID semantics?'],
        expectedKeywords: ['distributed lock', 'state machine', 'Redis SETNX', 'lease TTL', 'dispatch', 'race condition']
      }
    ]
  },
  {
    topicId: 'SYS017',
    slug: 'gaming-leaderboard',
    title: 'Design a Real-Time Gaming Leaderboard',
    categorySlug: 'media-location-systems',
    pillar: 'case-studies',
    priority: 'P2',
    difficulty: 'INTERMEDIATE',
    durationMin: 45,
    frequency: 0.86,
    weight: 0.84,
    trend: 'STABLE',
    description: 'Design a real-time leaderboard for 25 million active gamers supporting sub-50ms score updates, top-100 global rankings, user relative rank retrieval, and monthly resets.',
    rubricAtoms: ['redis sorted sets zset skip list', 'leaderboard sharding by score partitions', 'user relative rank calculation', 'historical snapshot archival'],
    prerequisites: ['distributed-caching-redis', 'database-indexing-optimization'],
    usedComponents: ['distributed-caching-redis', 'load-balancers-traffic', 'storage-engines-lsm-trees'],
    foundedOn: ['latency-throughput-slos', 'horizontal-vs-vertical-scaling'],
    questions: [
      {
        id: 'q_sys017_01',
        title: 'Redis Sorted Sets (ZSET) Internals & Sharding',
        difficulty: 'INTERMEDIATE',
        learningLevel: 'L2',
        archetype: 'mechanism',
        prompt: 'Why is Redis Sorted Set (ZSET) using a Skip List and Hash Table the industry standard for leaderboards? When player count exceeds 50 million, how do you shard the leaderboard across multiple Redis instances?',
        rubricGuide: 'Must explain: ZSET combines Hash Table (O(1) member score lookup) and Skip List (O(log N) insert, remove, and rank retrieval via ZREVRANK/ZREVRANGE). When too large for a single machine: 1) Shard by fixed score ranges (e.g. 0-1000, 1001-2000); or 2) Top-K cached in memory while lower tiers are batched into partitioned databases; or 3) Composite rank trees.',
        rubricAtoms: ['skip list o(log n) operations', 'hash table o(1) score lookup', 'score-range sharding', 'zrevrank zrevrange commands'],
        hints: ['What is the time complexity of finding a user’s rank in an unindexed SQL table with 50M rows?'],
        followUpProbes: ['How do you break ties when two players achieve the exact same score?'],
        expectedKeywords: ['Redis ZSET', 'Skip List', 'ZREVRANK', 'ZREVRANGE', 'sharding', 'score-range']
      }
    ]
  },

  // ==========================================
  // Category 3.6: Distributed Infrastructure & Storage Systems
  // ==========================================
  {
    topicId: 'SYS018',
    slug: 'distributed-key-value-store',
    title: 'Design a Distributed Key-Value Store (Dynamo/Cassandra)',
    categorySlug: 'distributed-infrastructure-systems',
    pillar: 'case-studies',
    priority: 'P1',
    difficulty: 'EXPERT',
    durationMin: 45,
    frequency: 0.98,
    weight: 0.98,
    trend: 'STABLE',
    description: 'Design a masterless, highly available distributed key-value store based on the Amazon Dynamo paper, featuring consistent hashing, tunable quorums, vector clocks, and hinted handoff.',
    rubricAtoms: ['consistent hashing virtual nodes', 'tunable quorum r + w > n', 'sloppy quorum and hinted handoff', 'merkle tree anti-entropy', 'lsm storage engine'],
    prerequisites: ['cap-pacelc-theorems', 'storage-engines-lsm-trees', 'distributed-clocks-ordering'],
    usedComponents: ['storage-engines-lsm-trees', 'service-discovery-health', 'gossip-protocols-membership'],
    foundedOn: ['cap-pacelc-theorems', 'acid-transactions-consistency', 'distributed-clocks-ordering'],
    questions: [
      {
        id: 'q_sys018_01',
        title: 'Consistent Hashing, Virtual Nodes, and Replication Ring',
        difficulty: 'ADVANCED',
        learningLevel: 'L3',
        archetype: 'mechanism',
        prompt: 'In a distributed Dynamo ring, how does Consistent Hashing with Virtual Nodes (vnodes) prevent hotspotting when keys are unevenly distributed, and what happens to keys when a storage node fails or joins?',
        rubricGuide: 'Must explain: 1) Hash space mapped to a continuous 0 to 2^32-1 ring; 2) Each physical node is assigned V virtual tokens scattered around the ring to achieve uniform statistical distribution; 3) Key is hashed and assigned to the first node encountered clockwise; 4) Replicated to next N-1 distinct physical nodes; 5) Node addition/removal only relocates K/N keys rather than re-hashing all keys.',
        rubricAtoms: ['hash ring 2^32', 'virtual nodes uniform distribution', 'clockwise replication factor n', 'minimal key movement on membership change'],
        hints: ['If you only use 3 physical nodes without virtual nodes, will each node get exactly 33.3% of the hash space?'],
        followUpProbes: ['How does a client locate the correct coordinator node without contacting a centralized master?'],
        expectedKeywords: ['Consistent Hashing', 'Virtual Nodes', 'Hash Ring', 'Replication Factor', 'Dynamo', 'Cassandra']
      },
      {
        id: 'q_sys018_02',
        title: 'Tunable Quorum (R + W > N) and Sloppy Quorum / Hinted Handoff',
        difficulty: 'EXPERT',
        learningLevel: 'L4',
        archetype: 'trade-off',
        prompt: 'Explain how tunable quorum parameters (N, R, W) allow Dynamo to offer strong consistency when R + W > N. What is a "Sloppy Quorum", and how does "Hinted Handoff" preserve write availability during network partitions?',
        rubricGuide: 'Must explain: N = replicas, R = read quorum, W = write quorum. When R + W > N, read and write sets must overlap by Pigeonhole Principle, guaranteeing the reader sees the latest write (strong consistency). In Sloppy Quorum during network partition, if designated replica nodes are unreachable, writes are accepted by healthy neighbor nodes and stored with a "hint". Once original node recovers, neighbor delivers the hinted handoff.',
        rubricAtoms: ['r + w > n overlap proof', 'sloppy quorum availability trade-off', 'hinted handoff temporary storage', 'merkle tree background repair'],
        hints: ['If N=3, R=2, W=2, is strong consistency guaranteed? What if W=1 and R=1?'],
        followUpProbes: ['How do Merkle trees enable anti-entropy background synchronization without transferring entire datasets across the network?'],
        expectedKeywords: ['Quorum', 'R+W>N', 'Sloppy Quorum', 'Hinted Handoff', 'Merkle Tree', 'Eventual Consistency']
      }
    ]
  },
  {
    topicId: 'SYS019',
    slug: 'metrics-observability-platform',
    title: 'Design Metrics, Telemetry & Observability (Prometheus/Datadog)',
    categorySlug: 'distributed-infrastructure-systems',
    pillar: 'case-studies',
    priority: 'P2',
    difficulty: 'ADVANCED',
    durationMin: 45,
    frequency: 0.88,
    weight: 0.90,
    trend: 'RISING',
    description: 'Design a distributed time-series metrics ingestion engine processing 10 million data points/second with high-cardinality indexing, Gorilla compression, and multi-tier downsampling.',
    rubricAtoms: ['pull vs push metrics collection', 'gorilla floating point delta-of-delta compression', 'high cardinality label explosion', 'rollup downsampling tiered storage'],
    prerequisites: ['storage-engines-lsm-trees', 'kafka-event-streaming'],
    usedComponents: ['storage-engines-lsm-trees', 'kafka-event-streaming', 'service-discovery-health'],
    foundedOn: ['latency-throughput-slos', 'horizontal-vs-vertical-scaling'],
    questions: [
      {
        id: 'q_sys019_01',
        title: 'Time-Series Compression: Gorilla Delta-of-Delta',
        difficulty: 'ADVANCED',
        learningLevel: 'L3',
        archetype: 'mechanism',
        prompt: 'Why are standard relational databases unsuited for ingesting 10 million timestamped metric values per second? Explain Facebook’s Gorilla time-series compression algorithm for timestamps and double-precision floats.',
        rubricGuide: 'Candidate must explain: Relational DBs suffer from B-tree write amplification. Gorilla algorithm compresses: 1) Timestamps using delta-of-delta encoding (most intervals are constant, requiring only 1 bit ‘0’); 2) Metric float values using XOR encoding against previous value (consecutive floating point values share high-order bits, requiring few bits). Achieves ~10x-12x memory compression.',
        rubricAtoms: ['timestamp delta-of-delta', 'floating point xor compression', 'in-memory tsdb head block', 'write amplification elimination'],
        hints: ['If a server reports CPU usage every 10 seconds (10s, 20s, 30s), what is the second derivative (delta of delta)?'],
        followUpProbes: ['How do you prevent a single developer who tags metrics with user_id or uuid from causing a high-cardinality memory explosion?'],
        expectedKeywords: ['Gorilla', 'delta-of-delta', 'XOR', 'time-series', 'TSDB', 'cardinality', 'Prometheus']
      }
    ]
  },
  {
    topicId: 'SYS020',
    slug: 'cloud-file-sync',
    title: 'Design Cloud File Storage & Sync (Google Drive / Dropbox)',
    categorySlug: 'distributed-infrastructure-systems',
    pillar: 'case-studies',
    priority: 'P2',
    difficulty: 'ADVANCED',
    durationMin: 45,
    frequency: 0.90,
    weight: 0.90,
    trend: 'STABLE',
    description: 'Design a multi-device cloud file synchronization engine with content-addressed block chunking, delta sync, deduplication, conflict resolution, and offline sync reconciliation.',
    rubricAtoms: ['content-addressed chunking sha256', 'delta sync rsync algorithm', 'metadata database vs block storage', 'conflict file branching'],
    prerequisites: ['file-upload-storage', 'acid-transactions-consistency'],
    usedComponents: ['cdn-edge-caching', 'distributed-caching-redis', 'kafka-event-streaming'],
    foundedOn: ['acid-transactions-consistency', 'latency-throughput-slos'],
    questions: [
      {
        id: 'q_sys020_01',
        title: 'Block-Level Chunking, Content Addressing, and Delta Sync',
        difficulty: 'ADVANCED',
        learningLevel: 'L3',
        archetype: 'architecture',
        prompt: 'When a user edits 2 sentences in a 500 MB video editing project file, Dropbox uploads only a few kilobytes instead of re-uploading the entire 500 MB. Describe the chunking, hashing, and delta sync architecture that makes this possible.',
        rubricGuide: 'Candidate must explain: 1) Client breaks file into 4MB chunks (fixed or variable Rabinkarp/cdc chunking); 2) Computes SHA-256 hash for each chunk; 3) Checks chunk hashes against cloud index; 4) Only uploads newly modified chunks that don’t exist in object storage; 5) Commits an updated file manifest linking chunk hashes in sequence. Enables global deduplication across users.',
        rubricAtoms: ['content-addressed chunk sha-256', 'delta sync upload only changed blocks', 'file manifest assembly map', 'cross-account deduplication'],
        hints: ['What is the difference between fixed-size chunking and content-defined chunking (Rabin fingerprints) when bytes are inserted at the beginning?'],
        followUpProbes: ['How does the sync client handle simultaneous offline edits to the exact same file from two different laptops?'],
        expectedKeywords: ['chunking', 'delta sync', 'SHA-256', 'manifest', 'deduplication', 'conflict file', 'Dropbox']
      }
    ]
  },
  {
    topicId: 'SYS021',
    slug: 'collaborative-document-editor',
    title: 'Design Real-Time Collaborative Editor (Google Docs / Figma)',
    categorySlug: 'distributed-infrastructure-systems',
    pillar: 'case-studies',
    priority: 'P2',
    difficulty: 'EXPERT',
    durationMin: 45,
    frequency: 0.92,
    weight: 0.94,
    trend: 'RISING',
    description: 'Design a concurrent real-time document editing engine supporting multiple simultaneous typists, cursor presence, conflict resolution via OT or CRDTs, and offline reconciliation.',
    rubricAtoms: ['operational transformation ot vs crdt', 'character coordinate system', 'centralized ot sequencing server', 'crdt state-based vs operation-based', 'presence cursor broadcast'],
    prerequisites: ['realtime-chat-messaging', 'distributed-clocks-ordering'],
    usedComponents: ['api-gateway-reverse-proxy', 'distributed-caching-redis'],
    foundedOn: ['distributed-clocks-ordering', 'acid-transactions-consistency'],
    questions: [
      {
        id: 'q_sys021_01',
        title: 'Concurrency Control: Operational Transformation (OT) vs CRDTs',
        difficulty: 'EXPERT',
        learningLevel: 'L4',
        archetype: 'comparison',
        prompt: 'Compare Operational Transformation (OT, used by Google Docs) and Conflict-Free Replicated Data Types (CRDTs, used by Figma and Yjs) for real-time collaborative text editing. What are the trade-offs regarding central server dependence and memory overhead?',
        rubricGuide: 'Candidate must explain: 1) OT requires a central server to establish canonical sequence ordering and transforms concurrent operations against incoming operations; complex transformation functions with high bug potential; 2) CRDTs assign globally unique immutable IDs to each character; operations are commutative, associative, and idempotent, allowing true P2P / serverless sync without a central sequencer; 3) CRDTs have higher memory overhead due to character ID metadata.',
        rubricAtoms: ['ot central sequencer dependence', 'crdt mathematical commutativity', 'character id metadata overhead', 'p2p offline suitability'],
        hints: ['If two users insert a character at index 5 at the exact same millisecond, what does OT do to the second user’s operation index?'],
        followUpProbes: ['How do you broadcast cursor positions and live presence without polluting the document edit history?'],
        expectedKeywords: ['Operational Transformation', 'CRDT', 'Google Docs', 'Figma', 'commutativity', 'tombstones', 'OT vs CRDT']
      }
    ]
  },
  {
    topicId: 'SYS022',
    slug: 'ota-firmware-update-platform',
    title: 'Design an OTA Firmware Update Platform for Connected Devices',
    categorySlug: 'distributed-infrastructure-systems',
    pillar: 'case-studies',
    priority: 'P3',
    difficulty: 'EXPERT',
    durationMin: 45,
    frequency: 0.70,
    weight: 0.75,
    trend: 'RISING',
    description: 'Design an Over-the-Air (OTA) firmware delivery system for 50 million IoT / automotive devices, featuring progressive rollout rings, binary delta patching, and automated brick detection & rollback.',
    rubricAtoms: ['progressive canary rollout rings', 'binary bsdiff delta compression', 'dual boot a/b partition recovery', 'cryptographic firmware signing', 'mqtt/coap download resume'],
    prerequisites: ['file-upload-storage', 'cdn-edge-caching', 'metrics-observability-platform'],
    usedComponents: ['cdn-edge-caching', 'kafka-event-streaming', 'distributed-caching-redis'],
    foundedOn: ['latency-throughput-slos', 'acid-transactions-consistency'],
    questions: [
      {
        id: 'q_sys022_01',
        title: 'Fleet Rollout Rings & Automated Canary Brick Detection',
        difficulty: 'EXPERT',
        learningLevel: 'L4',
        archetype: 'failure-analysis',
        prompt: 'If a bad firmware update is pushed to 10 million smart vehicles, it could permanently disable cars (bricking). How do you design progressive rollout rings (1% -> 5% -> 25% -> 100%) and automatic halt/rollback based on health telemetry?',
        rubricGuide: 'Candidate must explain: 1) Device fleet tagged into risk cohorts (Internal/Dogfood -> 1% Canary -> 5% Beta -> General Availability); 2) Automated telemetry health monitors track heartbeats, crash loops, and reboot frequency; 3) Anomaly detector triggers an immediate circuit breaker halting the rollout; 4) On-device A/B dual-partitioning ensures device reboots to the previous working partition if new firmware fails watchdog timer validation.',
        rubricAtoms: ['progressive ring percentage rollout', 'telemetry anomaly circuit breaker', 'a/b dual partition rollback', 'hardware watchdog timer'],
        hints: ['What happens on the physical microcontroller if the device loses power mid-flash?'],
        followUpProbes: ['How does binary delta patching (bsdiff/courgette) reduce a 500MB firmware download to 12MB over cellular IoT connections?'],
        expectedKeywords: ['OTA', 'rollout rings', 'canary', 'brick detection', 'A/B partition', 'watchdog', 'delta patch']
      }
    ]
  },
  {
    topicId: 'SYS023',
    slug: 'distributed-workflow-scheduler',
    title: 'Design a Distributed Job Scheduler & Durable Workflow Engine (Temporal)',
    categorySlug: 'distributed-infrastructure-systems',
    pillar: 'case-studies',
    priority: 'P1',
    difficulty: 'EXPERT',
    durationMin: 45,
    frequency: 0.94,
    weight: 0.95,
    trend: 'RISING',
    description: 'Design a resilient distributed workflow engine (like Temporal or Cadence) supporting durable execution, event history replay, task queues, activity retry policies, timers, and deterministic state machines.',
    rubricAtoms: ['temporal durable execution', 'event history append only replay', 'activity worker task queues', 'deterministic workflow constraints', 'timer wheel scheduling'],
    prerequisites: ['distributed-locks-fencing', 'kafka-event-streaming', 'storage-engines-lsm-trees'],
    usedComponents: ['kafka-event-streaming', 'distributed-locks-fencing', 'db-replication-sharding', 'storage-engines-lsm-trees'],
    foundedOn: ['acid-transactions-consistency', 'distributed-clocks-ordering'],
    questions: [
      {
        id: 'q_sys023_01',
        title: 'Event History Replay vs Snapshotting in Durable Execution',
        difficulty: 'EXPERT',
        learningLevel: 'L5',
        archetype: 'architecture',
        prompt: 'In a durable execution engine like Temporal, a workflow code function can sleep for 30 days, survive 10 server restarts and worker crashes, and resume execution exactly where it left off without snapshotting thread memory or call stacks. How does event history replay achieve deterministic recovery?',
        rubricGuide: 'Candidate must explain: 1) Workflow code is executed deterministically against an append-only event history; 2) When an activity (e.g. ChargeCreditCard) completes, an ActivityTaskCompleted event is committed to history; 3) When a worker crashes, a new worker pulls the event history and re-executes the workflow code from line 1; 4) For previously recorded events, the framework returns cached results instantly without re-executing external network calls; 5) Once the code catches up to the uncompleted step, it continues normal execution. Requires zero non-deterministic code (no random numbers, direct system clock, or mutating globals without deterministic wrappers).',
        rubricAtoms: ['durable execution event history', 'deterministic replay mechanism', 'activity caching bypass', 'worker crash recovery'],
        hints: ['Why must workflow code not call Math.random() or System.currentTimeMillis() directly?'],
        followUpProbes: ['How does a distributed timer wheel or delayed queue wake up sleeping workflows after weeks or months?'],
        expectedKeywords: ['Temporal', 'durable execution', 'event history', 'replay', 'deterministic', 'workflow engine', 'activity worker']
      }
    ]
  }
];
