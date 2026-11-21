import { ApiRequest, ApiResponse } from "../lib/http";
import { db } from "../server/db/client";

/**
 * GET /api/plans
 * Public, read-only list of active subscription plans (managed in the admin
 * panel), cheapest first. Used by the landing page pricing section.
 */
export async function handleGetSubscriptionPlans(_req: ApiRequest): Promise<Response> {
  try {
    const plans = await db.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" },
      select: {
        tier: true,
        name: true,
        description: true,
        price: true,
        currency: true,
        billingInterval: true,
        voiceMinutesLimit: true,
        mockInterviewsLimit: true,
        features: true,
      },
    });

    return ApiResponse.json(
      { success: true, plans },
      // Plans change rarely; let browsers and the edge cache them briefly.
      { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=600" } },
    );
  } catch (error) {
    console.error("Subscription plans fetch error:", error);
    return ApiResponse.json({ success: false, plans: [], error: "Unable to load plans" }, { status: 500 });
  }
}
