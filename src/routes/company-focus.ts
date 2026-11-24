import { ApiRequest, ApiResponse } from "../lib/http";
import {
  CANONICAL_COMPANIES,
  CANONICAL_COMPANY_TOPICS,
  CANONICAL_STAGES,
} from "../../scripts/seed-data/companies";

/**
 * GET /api/companies/focus?names=Google,Amazon
 *
 * Read-only interview intelligence for a candidate's target companies, from the
 * curated company catalog (20 companies, their interview rounds, and topics they
 * ask often). Used to personalise the time-budgeted plan; nothing is stored.
 *
 * Response:
 *  - matched:   companies we have data for (in the order given, max 3)
 *  - unmatched: names we don't recognise yet (shown honestly in the UI)
 *  - rounds:    interview rounds with their weight and the curriculum areas they test
 *  - topics:    topic slug → highest frequency across the matched companies, and who asks it
 */

const MAX_COMPANIES = 3;

/** Common alternative names → catalog slug. */
const ALIASES: Record<string, string> = {
  facebook: "meta",
  fb: "meta",
  instagram: "meta",
  whatsapp: "meta",
  alphabet: "google",
  youtube: "google",
  aws: "amazon",
  amazonwebservices: "amazon",
  square: "block",
  cashapp: "block",
  tiktok: "bytedance",
  msft: "microsoft",
  azure: "microsoft",
};

const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

function resolve(name: string) {
  const key = normalise(name);
  if (!key) return null;
  const slug = ALIASES[key] ?? key;
  return CANONICAL_COMPANIES.find((c) => c.slug === slug || normalise(c.name) === slug) ?? null;
}

export async function handleGetCompanyFocus(req: ApiRequest): Promise<Response> {
  const raw = req.nextUrl.searchParams.get("names") ?? "";
  const names = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 10);

  const matched: { slug: string; name: string; pillars: string[] }[] = [];
  const unmatched: string[] = [];
  for (const n of names) {
    const c = resolve(n);
    if (!c) unmatched.push(n.slice(0, 60));
    else if (!matched.some((m) => m.slug === c.slug) && matched.length < MAX_COMPANIES) {
      matched.push({ slug: c.slug, name: c.name, pillars: c.primaryPillars });
    }
  }

  // Interview rounds of the matched companies, averaged, with the areas each round tests.
  const stageDomains = new Map(CANONICAL_STAGES.map((s) => [s.slug, s.targetDomains]));
  const roundWeight = new Map<string, number>();
  for (const m of matched) {
    const company = CANONICAL_COMPANIES.find((c) => c.slug === m.slug)!;
    for (const st of company.hiringStages) {
      roundWeight.set(st.stageSlug, (roundWeight.get(st.stageSlug) ?? 0) + st.stageWeight / matched.length);
    }
  }
  const rounds = [...roundWeight.entries()].map(([stage, weight]) => ({
    stage,
    weight: Math.round(weight * 10) / 10,
    domains: stageDomains.get(stage) ?? [],
  }));

  // Topics these companies ask often: keep the highest confidence-adjusted frequency per topic.
  const topics: Record<string, { frequency: number; companies: string[] }> = {};
  for (const ft of CANONICAL_COMPANY_TOPICS) {
    const m = matched.find((x) => x.slug === ft.companySlug);
    if (!m) continue;
    const score = Math.round(ft.frequencyScore * ft.confidenceScore);
    const cur = topics[ft.topicSlug];
    if (!cur) topics[ft.topicSlug] = { frequency: score, companies: [m.name] };
    else {
      cur.frequency = Math.max(cur.frequency, score);
      if (!cur.companies.includes(m.name)) cur.companies.push(m.name);
    }
  }

  return ApiResponse.json(
    { success: true, matched, unmatched, rounds, topics },
    { headers: { "Cache-Control": "public, max-age=3600" } },
  );
}
