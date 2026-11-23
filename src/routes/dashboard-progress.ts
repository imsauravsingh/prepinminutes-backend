import { ApiRequest, ApiResponse } from "../lib/http";
import { db } from "../server/db/client";
import { resolveCandidateClerkId } from "../server/edge/cors";

/**
 * Dashboard progress (Start Preparing page).
 *
 * - GET  /api/dashboard/progress        practiced topics, this week's task totals, streak, hours
 * - POST /api/dashboard/today           save today's task list (first call wins; later calls return it)
 * - POST /api/dashboard/tasks/:id/toggle tick / untick a task (updates topic mastery and profile totals)
 *
 * Writes only the signed-in candidate's rows:
 *   daily_plan_tasks (their active plan), candidate_topic_masteries, candidate_profiles totals.
 */

type Candidate = { profileId: string; planId: string | null };

async function resolveCandidate(req: ApiRequest): Promise<Candidate | Response> {
  const id = resolveCandidateClerkId(req);
  if (!id) return ApiResponse.json({ error: "UNAUTHORIZED", message: "Sign in required." }, { status: 401 });
  const user = await db.user.findFirst({
    where: { OR: [{ id }, { googleId: id }, { clerkId: id }, { username: id }, { email: id }] },
    include: { profile: { include: { plans: { where: { isActive: true }, take: 1, select: { id: true } } } } },
  });
  if (!user?.profile) {
    return ApiResponse.json({ error: "PROFILE_NOT_CONFIGURED", message: "Complete your setup first." }, { status: 400 });
  }
  return { profileId: user.profile.id, planId: user.profile.plans[0]?.id ?? null };
}

/** "YYYY-MM-DD" (the candidate's local day) → UTC [start, end) range; stored at noon UTC. */
function dayRange(day: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;
  const start = new Date(`${day}T00:00:00.000Z`);
  const end = new Date(start.getTime() + 86_400_000);
  const noon = new Date(start.getTime() + 12 * 3_600_000);
  return { start, end, noon };
}

const isoDay = (d: Date) => d.toISOString().slice(0, 10);

/** Consecutive days (ending today or yesterday) with at least one finished task. */
async function computeStreak(planId: string, today: string) {
  const rows = await db.dailyPlanTask.findMany({
    where: { planId, isCompleted: true },
    select: { scheduledDate: true },
  });
  const days = new Set(rows.map((r) => isoDay(r.scheduledDate)));
  let cursor = new Date(`${today}T12:00:00.000Z`);
  if (!days.has(isoDay(cursor))) cursor = new Date(cursor.getTime() - 86_400_000);
  let streak = 0;
  while (days.has(isoDay(cursor))) {
    streak++;
    cursor = new Date(cursor.getTime() - 86_400_000);
  }
  return streak;
}

function taskView(t: {
  id: string;
  title: string;
  subtitle: string | null;
  durationMin: number;
  practiceHref: string;
  domainSlug: string;
  isCompleted: boolean;
  orderIndex: number;
  topic: { slug: string } | null;
}) {
  return {
    taskId: t.id,
    id: t.topic?.slug ?? t.id,
    title: t.title,
    subtitle: t.subtitle ?? "",
    duration: `${t.durationMin} min`,
    durationMin: t.durationMin,
    href: t.practiceHref,
    domainSlug: t.domainSlug,
    isCompleted: t.isCompleted,
  };
}

const taskSelect = {
  id: true,
  title: true,
  subtitle: true,
  durationMin: true,
  practiceHref: true,
  domainSlug: true,
  isCompleted: true,
  orderIndex: true,
  topic: { select: { slug: true } },
} as const;

export async function handleGetDashboardProgress(req: ApiRequest): Promise<Response> {
  try {
    const c = await resolveCandidate(req);
    if (c instanceof Response) return c;

    const today = req.nextUrl.searchParams.get("today") ?? isoDay(new Date());
    const weekStart = req.nextUrl.searchParams.get("weekStart") ?? today;
    const range = dayRange(today);
    const wk = dayRange(weekStart);
    if (!range || !wk) return ApiResponse.json({ error: "BAD_DATE" }, { status: 400 });

    const [masteries, profile, weekTasks, todayTasks] = await Promise.all([
      db.candidateTopicMastery.findMany({
        where: { candidateId: c.profileId, status: { in: ["PRACTICED", "MASTERED"] } },
        select: { topic: { select: { slug: true } } },
      }),
      db.candidateProfile.findUnique({
        where: { id: c.profileId },
        select: { completedHours: true, streakDays: true, readinessScore: true },
      }),
      c.planId
        ? db.dailyPlanTask.findMany({
            where: { planId: c.planId, scheduledDate: { gte: wk.start, lt: new Date(wk.start.getTime() + 7 * 86_400_000) } },
            select: { scheduledDate: true, isCompleted: true },
          })
        : Promise.resolve([]),
      c.planId
        ? db.dailyPlanTask.findMany({
            where: { planId: c.planId, scheduledDate: { gte: range.start, lt: range.end } },
            orderBy: { orderIndex: "asc" },
            select: taskSelect,
          })
        : Promise.resolve([]),
    ]);

    const week: Record<string, { total: number; done: number }> = {};
    for (const t of weekTasks) {
      const k = isoDay(t.scheduledDate);
      week[k] ??= { total: 0, done: 0 };
      week[k].total++;
      if (t.isCompleted) week[k].done++;
    }

    return ApiResponse.json({
      success: true,
      practicedTopicSlugs: masteries.map((m) => m.topic.slug),
      todayTasks: todayTasks.map(taskView),
      week,
      completedHours: profile?.completedHours ?? 0,
      streakDays: profile?.streakDays ?? 0,
      readinessScore: profile?.readinessScore ?? 0,
    });
  } catch (err) {
    console.error("GET /api/dashboard/progress failed:", err);
    return ApiResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}

type IncomingTask = {
  topicSlug: string;
  domainSlug: string;
  title: string;
  subtitle?: string;
  durationMin: number;
  practiceHref: string;
};

export async function handlePostDashboardToday(req: ApiRequest): Promise<Response> {
  try {
    const c = await resolveCandidate(req);
    if (c instanceof Response) return c;
    if (!c.planId) return ApiResponse.json({ error: "NO_ACTIVE_PLAN" }, { status: 400 });

    const body = (await req.json().catch(() => null)) as {
      date?: string;
      tasks?: IncomingTask[];
      practicedTopicSlugs?: string[];
    } | null;
    const range = dayRange(String(body?.date ?? ""));
    if (!range) return ApiResponse.json({ error: "BAD_DATE" }, { status: 400 });

    // First call of the day wins: if today's rows exist, return them unchanged.
    const existing = await db.dailyPlanTask.findMany({
      where: { planId: c.planId, scheduledDate: { gte: range.start, lt: range.end } },
      orderBy: { orderIndex: "asc" },
      select: taskSelect,
    });
    if (existing.length) return ApiResponse.json({ success: true, created: false, todayTasks: existing.map(taskView) });

    const incoming = (Array.isArray(body?.tasks) ? body!.tasks : []).slice(0, 8).filter((t) => t?.topicSlug && t?.title);
    if (!incoming.length) return ApiResponse.json({ success: true, created: false, todayTasks: [] });

    const topics = await db.curriculumTopic.findMany({
      where: { slug: { in: incoming.map((t) => t.topicSlug) } },
      select: { id: true, slug: true },
    });
    const topicId = new Map(topics.map((t) => [t.slug, t.id]));

    await db.dailyPlanTask.createMany({
      data: incoming.map((t, i) => ({
        planId: c.planId!,
        topicId: topicId.get(t.topicSlug) ?? null,
        domainSlug: String(t.domainSlug).slice(0, 80),
        title: String(t.title).slice(0, 200),
        subtitle: t.subtitle ? String(t.subtitle).slice(0, 200) : null,
        durationMin: Math.max(1, Math.min(240, Math.round(Number(t.durationMin) || 15))),
        practiceHref: String(t.practiceHref || "/practice").slice(0, 300),
        scheduledDate: range.noon,
        orderIndex: i,
      })),
    });

    const created = await db.dailyPlanTask.findMany({
      where: { planId: c.planId, scheduledDate: { gte: range.start, lt: range.end } },
      orderBy: { orderIndex: "asc" },
      select: taskSelect,
    });
    return ApiResponse.json({ success: true, created: true, todayTasks: created.map(taskView) });
  } catch (err) {
    console.error("POST /api/dashboard/today failed:", err);
    return ApiResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}

export async function handlePostDashboardTaskToggle(req: ApiRequest, taskId: string): Promise<Response> {
  try {
    const c = await resolveCandidate(req);
    if (c instanceof Response) return c;
    if (!c.planId) return ApiResponse.json({ error: "NO_ACTIVE_PLAN" }, { status: 400 });

    const body = (await req.json().catch(() => null)) as { done?: boolean; today?: string; readinessScore?: number } | null;
    const done = Boolean(body?.done);

    // Tenant check: the task must belong to this candidate's active plan.
    const task = await db.dailyPlanTask.findFirst({
      where: { id: taskId, planId: c.planId },
      select: { id: true, isCompleted: true, durationMin: true, topicId: true },
    });
    if (!task) return ApiResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    if (task.isCompleted === done) return ApiResponse.json({ success: true, unchanged: true });

    const now = new Date();
    await db.dailyPlanTask.update({
      where: { id: task.id },
      data: { isCompleted: done, completedAt: done ? now : null },
    });

    if (task.topicId) {
      if (done) {
        await db.candidateTopicMastery.upsert({
          where: { candidateId_topicId: { candidateId: c.profileId, topicId: task.topicId } },
          create: { candidateId: c.profileId, topicId: task.topicId, status: "PRACTICED", totalAttempts: 1, lastPracticedAt: now },
          update: { status: "PRACTICED", totalAttempts: { increment: 1 }, lastPracticedAt: now },
        });
      } else {
        await db.candidateTopicMastery.updateMany({
          where: { candidateId: c.profileId, topicId: task.topicId, status: "PRACTICED" },
          data: { status: "NOT_STARTED" },
        });
      }
    }

    const today = typeof body?.today === "string" && dayRange(body.today) ? body.today : isoDay(now);
    const streakDays = await computeStreak(c.planId, today);
    const profile = await db.candidateProfile.findUnique({ where: { id: c.profileId }, select: { completedHours: true } });
    const hours = Math.max(0, (profile?.completedHours ?? 0) + ((done ? 1 : -1) * task.durationMin) / 60);
    const readiness = Number(body?.readinessScore);

    await db.candidateProfile.update({
      where: { id: c.profileId },
      data: {
        completedHours: Math.round(hours * 100) / 100,
        streakDays,
        ...(Number.isFinite(readiness) ? { readinessScore: Math.max(0, Math.min(100, Math.round(readiness))) } : {}),
      },
    });

    return ApiResponse.json({ success: true, isCompleted: done, streakDays, completedHours: Math.round(hours * 100) / 100 });
  } catch (err) {
    console.error("POST /api/dashboard/tasks/:id/toggle failed:", err);
    return ApiResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
