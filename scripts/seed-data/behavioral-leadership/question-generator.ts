import { TopicSeed, QuestionSeed } from './types';

interface ArchetypeTemplate {
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  learningLevel: 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
  archetype:
    | 'mechanism'
    | 'trade-off'
    | 'troubleshooting'
    | 'failure-analysis'
    | 'implementation'
    | 'scenario-based'
    | 'code-review'
    | 'debugging'
    | 'design-exercise';
  titleSuffix: string;
  promptTemplate: (topic: TopicSeed) => string;
  rubricGuideTemplate: (topic: TopicSeed) => string;
  expectedKeywordsTemplate: (topic: TopicSeed) => string[];
  antiPatternsTemplate: (topic: TopicSeed) => string[];
  scoreOffset: number;
}

const QUESTION_ARCHETYPES: ArchetypeTemplate[] = [
  // 1-4: Beginner (L1) - Foundations, Story Structuring & Core Behavioral Mechanics
  {
    difficulty: 'BEGINNER',
    learningLevel: 'L1',
    archetype: 'implementation',
    titleSuffix: 'Foundational STAR-L Story Construction',
    promptTemplate: (t) =>
      `Walk through a canonical career story demonstrating ${t.title}. How do you structure your Situation, Task, Action, Result, and Learnings within 3 minutes, clearly isolating your personal contribution ("I") from the broader team ("We")?`,
    rubricGuideTemplate: (t) =>
      `Assesses foundational competency in structuring authentic career narratives for ${t.title} using the STAR-L framework without narrative drift.`,
    expectedKeywordsTemplate: (t) => [t.rubricAtoms[0] || 'STAR-L Framework', 'Personal Ownership ("I")', 'Situation Context', 'Measurable Result', 'Reflective Learning'],
    antiPatternsTemplate: () => ['Speaking exclusively in "We" without delineating individual actions', 'Spending over 2 minutes setting up context before stating actions'],
    scoreOffset: -3,
  },
  {
    difficulty: 'BEGINNER',
    learningLevel: 'L1',
    archetype: 'mechanism',
    titleSuffix: 'Core Principles & Operational Mental Models',
    promptTemplate: (t) =>
      `Explain the core engineering and interpersonal philosophy behind ${t.title}. Why is this competency critical in high-performing engineering organizations, and what behaviors distinguish junior execution from senior mastery?`,
    rubricGuideTemplate: (t) =>
      `Verifies clear understanding of the behavioral and organizational principles governing ${t.title} across engineering levels.`,
    expectedKeywordsTemplate: (t) => [t.rubricAtoms[1] || 'Core Leadership Philosophy', 'Senior vs Junior Behaviors', 'High-Trust Culture', 'Accountability', 'Empathy'],
    antiPatternsTemplate: () => ['Treating behavioral questions as superficial checklist items', 'Assuming technical brilliance excuses poor collaboration'],
    scoreOffset: -4,
  },
  {
    difficulty: 'BEGINNER',
    learningLevel: 'L1',
    archetype: 'trade-off',
    titleSuffix: 'Navigating Competing Priorities & Pragmatic Balance',
    promptTemplate: (t) =>
      `Describe a workplace situation where ${t.title} conflicted with immediate delivery deadlines or competing team interests. How did you balance short-term progress against long-term engineering integrity?`,
    rubricGuideTemplate: (t) =>
      `Evaluates judgment and maturity when navigating practical trade-offs involving ${t.title} in fast-paced environments.`,
    expectedKeywordsTemplate: (t) => ['Short-Term vs Long-Term Trade-offs', 'Pragmatic Compromise', 'Engineering Integrity', 'Stakeholder Communication', t.rubricAtoms[0]],
    antiPatternsTemplate: () => ['Dogmatically refusing to compromise without proposing realistic alternatives', 'Capitulating immediately without evaluating technical risk'],
    scoreOffset: -5,
  },
  {
    difficulty: 'BEGINNER',
    learningLevel: 'L1',
    archetype: 'troubleshooting',
    titleSuffix: 'Identifying Behavioral Pitfalls & Self-Correction',
    promptTemplate: (t) =>
      `What are the most common mistakes engineers make when demonstrating ${t.title} in production teams or interviews? How do you recognize these failure modes in yourself and actively self-correct?`,
    rubricGuideTemplate: (t) =>
      `Tests self-awareness, emotional intelligence, and defensiveness against frequent behavioral anti-patterns in ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['Self-Awareness', 'Emotional Intelligence', 'Defensive Reactions', 'Constructive Feedback', t.rubricAtoms[2] || 'Continuous Improvement'],
    antiPatternsTemplate: () => ['Claiming to have never made a mistake or encountered friction', 'Attributing all team failures solely to external management'],
    scoreOffset: -4,
  },

  // 5-10: Intermediate (L2-L3) - Practical Ownership, Technical Disagreements, Project Delivery
  {
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L2',
    archetype: 'scenario-based',
    titleSuffix: 'High-Stakes Technical Disagreement & Data-Driven Alignment',
    promptTemplate: (t) =>
      `Tell me about a time you strongly disagreed with a senior engineer or architect regarding ${t.title}. What objective data or benchmarks did you gather to defend your position, and how did you proceed if leadership chose a different path?`,
    rubricGuideTemplate: (t) =>
      `Examines ability to handle intellectual conflict professionally, use objective evidence over ego, and embody "Disagree and Commit" for ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['Data-Driven Defense', 'Objective Benchmarks', 'Disagree and Commit', 'Professional Demeanor', t.rubricAtoms[0], t.rubricAtoms[1]],
    antiPatternsTemplate: () => ['Sulking or passively sabotaging the chosen approach after losing a debate', 'Relying on personal seniority or emotion rather than verifiable data'],
    scoreOffset: 0,
  },
  {
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L2',
    archetype: 'failure-analysis',
    titleSuffix: 'Major Project Slip & Personal Accountability',
    promptTemplate: (t) =>
      `Describe a scenario involving ${t.title} where an unexpected blocker caused your team's project to miss a critical launch milestone. When did you realize the slip was inevitable, how did you communicate upward, and what did you personally own?`,
    rubricGuideTemplate: (t) =>
      `Assesses transparent accountability, proactive upward communication, risk identification timing, and post-mortem ownership in ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['Proactive Communication', 'Personal Accountability', 'Milestone Slippage', 'Upward Visibility', 'Corrective Action Plan'],
    antiPatternsTemplate: () => ['Waiting until the release date to announce a delivery slip', 'Blaming cross-functional partner teams for unexpected blockers'],
    scoreOffset: 1,
  },
  {
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L3',
    archetype: 'scenario-based',
    titleSuffix: 'Cross-Functional Pushback from Product & Business',
    promptTemplate: (t) =>
      `A Product Manager insists on cutting testing or architectural guardrails related to ${t.title} to hit a marketing deadline. Walk through the exact conversation you had, the risk framework you presented, and the compromise you negotiated.`,
    rubricGuideTemplate: (t) =>
      `Evaluates cross-functional negotiation skills, translating technical risk into business impact, and finding win-win compromises for ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['Product Negotiation', 'Business Risk Translation', 'MVP Scope Reduction', 'Win-Win Compromise', t.rubricAtoms[1]],
    antiPatternsTemplate: () => ['Using opaque technical jargon to intimidate non-technical stakeholders', 'Silently accepting cut corners without documenting technical debt'],
    scoreOffset: 0,
  },
  {
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L3',
    archetype: 'debugging',
    titleSuffix: 'Interpersonal Friction & Resolving Team Communication Breakdown',
    promptTemplate: (t) =>
      `Two key engineers on your project had a toxic communication breakdown while collaborating on ${t.title}, threatening the project timeline. How did you de-escalate the tension, uncover the root friction, and realign the team around shared goals?`,
    rubricGuideTemplate: (t) =>
      `Measures conflict de-escalation, peer mediation, active listening, and restoring psychological safety under project stress.`,
    expectedKeywordsTemplate: (t) => ['Conflict De-escalation', 'Active Listening', 'Peer Mediation', 'Root Friction Analysis', 'Shared Team Objectives'],
    antiPatternsTemplate: () => ['Ignoring team interpersonal tension hoping it resolves itself', 'Taking sides in a peer conflict without hearing both perspectives'],
    scoreOffset: 1,
  },
  {
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L3',
    archetype: 'implementation',
    titleSuffix: 'Quantifying Business Impact & Answering Counterfactuals',
    promptTemplate: (t) =>
      `In a major project involving ${t.title}, how did you measure success? What were the baseline metrics before your initiative, what were the final business outcomes, and how did you prove the improvement was directly caused by your work?`,
    rubricGuideTemplate: (t) =>
      `Tests metrication rigor, baseline establishment, isolating confounding variables, and answering rigorous interviewer counterfactual probes.`,
    expectedKeywordsTemplate: (t) => ['Baseline Metrics', 'Causal Impact', 'A/B Testing or Telemetry', 'Counterfactual Analysis', 'Quantifiable ROI', t.rubricAtoms[0]],
    antiPatternsTemplate: () => ['Claiming vague, unverified percentage improvements (e.g. "made it 50% faster")', 'Taking credit for improvements caused by broader market or company growth'],
    scoreOffset: 0,
  },
  {
    difficulty: 'INTERMEDIATE',
    learningLevel: 'L2',
    archetype: 'code-review',
    titleSuffix: 'Mentoring Through Code Review & Raising Engineering Standards',
    promptTemplate: (t) =>
      `Describe how you use code reviews and technical design feedback to instill best practices around ${t.title}. How do you balance rigorous quality standards with encouraging and unblocking more junior engineers?`,
    rubricGuideTemplate: (t) =>
      `Verifies constructive mentorship, educational code review commenting, differentiating blockers from nits, and fostering psychological safety.`,
    expectedKeywordsTemplate: (t) => ['Constructive Code Review', 'Mentorship Tone', 'Distinguishing Nits vs Blockers', 'Educational Feedback', 'Raising the Engineering Bar'],
    antiPatternsTemplate: () => ['Leaving condescending or dismissive review comments', 'Blocking pull requests over personal stylistic preferences'],
    scoreOffset: 2,
  },

  // 11-16: Advanced (L3-L4) - Cross-Team Alignment, Ambiguity, Stakeholder Resistance & Crisis
  {
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'scenario-based',
    titleSuffix: 'Leading Through Ambiguity & Defining the Problem Space',
    promptTemplate: (t) =>
      `You were given a vague, poorly scoped initiative concerning ${t.title} with conflicting executive requirements. How did you break down the ambiguity, align stakeholders on a shared problem definition, and formulate an executable technical strategy?`,
    rubricGuideTemplate: (t) =>
      `Evaluates Senior/Staff-level capacity to thrive in high ambiguity, frame nebulous business problems, define clear scope boundaries, and drive alignment for ${t.title}.`,
    expectedKeywordsTemplate: (t) => ['Navigating Ambiguity', 'Problem Space Framing', 'Scope Boundaries', 'Executive Alignment', 'Executable Roadmap', t.rubricAtoms[0]],
    antiPatternsTemplate: () => ['Paralysis while waiting for leadership to provide complete, perfect specifications', 'Charging ahead building solutions before validating the actual core problem'],
    scoreOffset: 2,
  },
  {
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'failure-analysis',
    titleSuffix: 'SEV0 Crisis Leadership & Blameless Cultural Defense',
    promptTemplate: (t) =>
      `During a catastrophic production incident related to ${t.title}, high executive pressure demanded someone be held accountable. How did you lead the war room, protect your team from executive blame, and pivot the organization toward systemic architectural fixes?`,
    rubricGuideTemplate: (t) =>
      `Assesses crisis leadership under pressure, emotional fortitude, defending a blameless engineering culture, and championing root-cause architectural remediation.`,
    expectedKeywordsTemplate: (t) => ['Crisis Leadership', 'War Room Management', 'Blameless Post-Mortem', 'Psychological Safety Shield', 'Systemic Architectural Fixes'],
    antiPatternsTemplate: () => ['Throwing an individual engineer under the bus to appease angry executives', 'Focusing on human error rather than missing systemic safeguards and tests'],
    scoreOffset: 3,
  },
  {
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'trade-off',
    titleSuffix: 'Technical Debt Deprecation vs High-Velocity Feature Delivery',
    promptTemplate: (t) =>
      `How have you championed and secured organizational buy-in to pay down critical technical debt involving ${t.title} when product leadership wanted 100% of bandwidth allocated to new customer features? Formulate your business case.`,
    rubricGuideTemplate: (t) =>
      `Measures ability to translate technical debt into business risk (lost velocity, reliability incidents, attrition) and negotiate dedicated debt repayment budgets.`,
    expectedKeywordsTemplate: (t) => ['Technical Debt Quantifying', 'Developer Velocity Tax', 'Business Risk Translation', 'Capacity Allocation (20% rule)', 'Incremental Deprecation'],
    antiPatternsTemplate: () => ['Demanding a total 6-month product freeze for a complete rewrite', 'Complaining about legacy code without demonstrating its concrete cost to the business'],
    scoreOffset: 2,
  },
  {
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'scenario-based',
    titleSuffix: 'Overcoming Deep Multi-Team Stakeholder Resistance',
    promptTemplate: (t) =>
      `You proposed a critical cross-cutting standard or platform shift around ${t.title}, but two major partner teams vehemently resisted adopting it due to roadmap conflicts. Walk through your strategy to overcome resistance and achieve voluntary adoption.`,
    rubricGuideTemplate: (t) =>
      `Evaluates influence without authority, empathy for partner team roadmaps, creating win-win incentives, and building consensus across autonomous engineering silos.`,
    expectedKeywordsTemplate: (t) => ['Influence Without Authority', 'Stakeholder Empathy', 'Incentive Alignment', 'Frictionless Migration Paths', 'Consensus Building'],
    antiPatternsTemplate: () => ['Running to a shared VP to force an executive mandate on resisting teams', 'Dismissing partner teams as "stubborn" without understanding their competing OKRs'],
    scoreOffset: 3,
  },
  {
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'troubleshooting',
    titleSuffix: 'Rescuing an Underperforming or Disengaged Senior Engineer',
    promptTemplate: (t) =>
      `A previously high-performing senior engineer on your project involving ${t.title} became disengaged, missing commitments and exhibiting friction with peers. How did you approach the conversation, diagnose the underlying cause, and restore performance?`,
    rubricGuideTemplate: (t) =>
      `Tests empathetic 1-on-1 diagnostics, uncovering burnout or unaddressed frustration, constructive feedback delivery, and structured performance recovery.`,
    expectedKeywordsTemplate: (t) => ['Empathetic 1-on-1', 'Root Cause Diagnosis', 'Burnout Identification', 'Clear Performance Expectations', 'Restoring Motivation'],
    antiPatternsTemplate: () => ['Immediately initiating formal HR disciplinary action without an empathetic private conversation', 'Gossiping about the engineer\'s decline with other team members'],
    scoreOffset: 3,
  },
  {
    difficulty: 'ADVANCED',
    learningLevel: 'L4',
    archetype: 'mechanism',
    titleSuffix: 'Ethical Dilemma & Protecting Customer Trust Under Pressure',
    promptTemplate: (t) =>
      `Describe a high-pressure situation where leadership pushed to release a feature related to ${t.title} that had known data privacy, security, or ethical implications. How did you voice your dissent, escalate appropriately, and protect customer trust?`,
    rubricGuideTemplate: (t) =>
      `Assesses unyielding ethical integrity, principled courage under commercial pressure, customer trust obsession, and professional escalation protocols.`,
    expectedKeywordsTemplate: (t) => ['Ethical Integrity', 'Customer Trust Obsession', 'Data Privacy & Security', 'Principled Dissent', 'Formal Escalation'],
    antiPatternsTemplate: () => ['Silently complying with unethical orders to avoid interpersonal discomfort', 'Leaking confidential internal disputes publicly without following internal channels'],
    scoreOffset: 3,
  },

  // 17-20: Expert (L4-L5) - Staff/Principal Strategy, Org Transformation, Executive Leadership
  {
    difficulty: 'EXPERT',
    learningLevel: 'L5',
    archetype: 'design-exercise',
    titleSuffix: 'Multi-Year Technical Vision & Organizational RFC Roadmap',
    promptTemplate: (t) =>
      `As a Staff/Principal leader, how do you architect and drive a multi-year technical roadmap centered around ${t.title}? Describe how you author RFCs/ADRs, solicit dissenting peer review, align executive directors, and govern multi-quarter execution across 100+ engineers.`,
    rubricGuideTemplate: (t) =>
      `Measures Staff+/Principal authority in multi-year vision setting, RFC governance, aligning executive sponsors, and driving strategic execution across large engineering departments.`,
    expectedKeywordsTemplate: (t) => ['Multi-Year Technical Vision', 'RFC / ADR Governance', 'Executive Sponsor Alignment', 'Organizational Scaling', 'Architecture Review Board', t.rubricAtoms[0]],
    antiPatternsTemplate: () => ['Creating isolated "ivory tower" architectures without consulting frontline engineers', 'Writing 50-page theoretical RFCs that cannot be executed incrementally'],
    scoreOffset: 4,
  },
  {
    difficulty: 'EXPERT',
    learningLevel: 'L5',
    archetype: 'failure-analysis',
    titleSuffix: 'Large-Scale Organizational Transformation & Change Resistance',
    promptTemplate: (t) =>
      `You were tasked with leading an enterprise-wide organizational transformation (e.g. cloud migration, DevOps adoption, microservice consolidation) involving ${t.title}. What organizational resistance did you encounter, how did you manage cultural inertia, and what measurable outcomes proved success?`,
    rubricGuideTemplate: (t) =>
      `Assesses executive-level change management, overcoming organizational inertia, aligning incentives across VP orgs, and sustaining cultural momentum.`,
    expectedKeywordsTemplate: (t) => ['Organizational Transformation', 'Change Management', 'Overcoming Cultural Inertia', 'Cross-Org Metrication', 'Executive Coalition'],
    antiPatternsTemplate: () => ['Treating transformation as purely a tooling change while ignoring human culture', 'Declaring victory prematurely before the new paradigm is institutionalized'],
    scoreOffset: 5,
  },
  {
    difficulty: 'EXPERT',
    learningLevel: 'L5',
    archetype: 'trade-off',
    titleSuffix: 'Executive Upward Communication & High-Stakes Crisis Briefing',
    promptTemplate: (t) =>
      `Brief an executive leadership team (CEO, CTO, VP of Product) on a catastrophic strategic breakdown involving ${t.title}. How do you frame technical failure in business impact terms, present clear decision forks, manage executive anxiety, and secure emergency resources?`,
    rubricGuideTemplate: (t) =>
      `Evaluates executive communication gravitas, bottom-line upfront framing, managing high-stakes C-suite scrutiny, and securing strategic alignment under crisis.`,
    expectedKeywordsTemplate: (t) => ['Executive Presence', 'Bottom-Line Upfront (BLUF)', 'Business Impact Framing', 'Decision Forks', 'Securing C-Suite Buy-in'],
    antiPatternsTemplate: () => ['Dumping low-level technical minutiae on executives looking for business impact', 'Downplaying severity or giving overly optimistic false reassurances'],
    scoreOffset: 4,
  },
  {
    difficulty: 'EXPERT',
    learningLevel: 'L5',
    archetype: 'design-exercise',
    titleSuffix: 'Engineering Management: Re-Org, Team Topologies & Talent Density',
    promptTemplate: (t) =>
      `As an Engineering Manager / Director, you must reorganize an underperforming 40-person department around ${t.title}. How do you apply Team Topologies (Stream-aligned, Platform, Enabling), establish hiring calibration bars, manage out chronic low-performers, and foster top-tier talent density?`,
    rubricGuideTemplate: (t) =>
      `Assesses Director/EM-level organizational design, Conway's Law alignment, compassionate performance management (PIPs/exits), hiring calibration, and engineering team health.`,
    expectedKeywordsTemplate: (t) => ['Team Topologies', 'Conway\'s Law', 'Talent Density', 'Compassionate Performance Management', 'Hiring Calibration', 'Engineering Velocity'],
    antiPatternsTemplate: () => ['Executing arbitrary top-down reorganizations without team consultation', 'Tolerating chronic low performance that demotivates top performers'],
    scoreOffset: 4,
  },
];

export function generateQuestionsForTopic(topic: TopicSeed): QuestionSeed[] {
  const companiesPool = topic.targetCompanies && topic.targetCompanies.length > 0
    ? topic.targetCompanies
    : ['Amazon', 'Google', 'Meta', 'Netflix', 'Stripe', 'Apple', 'Microsoft', 'Uber'];

  return QUESTION_ARCHETYPES.map((arch, index) => {
    const qIndex = index + 1;
    const paddedIndex = qIndex.toString().padStart(3, '0');
    const id = `q-${topic.topicId.toLowerCase()}-${paddedIndex}`;

    const rawFreq = topic.frequency + arch.scoreOffset;
    const frequencyScore = Math.max(50, Math.min(99, rawFreq));

    const companySample = [
      companiesPool[index % companiesPool.length],
      companiesPool[(index + 2) % companiesPool.length],
      companiesPool[(index + 4) % companiesPool.length],
    ];

    return {
      id,
      title: `${topic.title}: ${arch.titleSuffix}`,
      difficulty: arch.difficulty,
      learningLevel: arch.learningLevel,
      archetype: arch.archetype,
      prompt: arch.promptTemplate(topic),
      scaleAnchor: `Evaluates leadership and behavioral maturity on ${topic.title} at ${arch.difficulty} level (${arch.learningLevel}).`,
      rubricGuide: arch.rubricGuideTemplate(topic),
      rubricAtoms: [
        ...topic.rubricAtoms.slice(0, 3),
        arch.difficulty,
        arch.learningLevel,
      ],
      hints: [
        `Structure your narrative clearly with Situation, Task, Action, and Measurable Result.`,
        `Explicitly delineate your personal actions ("I") from the broader team ("We").`,
        `Quantify outcomes with concrete baselines, trade-offs, and reflective learnings.`,
      ],
      followUpProbes: [
        `What alternatives did you consider before taking this action, and why were they rejected?`,
        `How did you measure the counterfactual: what would have happened if you did nothing?`,
        `Knowing what you know today, what would you do differently if faced with the exact same situation?`,
      ],
      expectedKeywords: arch.expectedKeywordsTemplate(topic),
      antiPatterns: arch.antiPatternsTemplate(topic),
      frequencyScore,
      companies: companySample,
    };
  });
}

