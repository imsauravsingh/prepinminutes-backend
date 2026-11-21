import { ApiRequest, ApiResponse } from "../lib/http";
import { db } from "../server/db/client";
import { checkRateLimit } from "../server/edge/rate-limiter";
import { resolveCandidateClerkId } from "../server/edge/cors";
import { z } from "zod";

const SettingUpdateSchema = z.object({
  key: z.string().min(1),
  value: z.union([z.string(), z.boolean(), z.number()]).transform((v) => String(v)),
  isPublic: z.boolean().optional().default(true),
  description: z.string().optional(),
});

/**
 * GET /api/platform/config
 * Retrieves public platform configurations (e.g. enable_next_step_flow)
 */
export async function handleGetPlatformConfig(req: ApiRequest): Promise<Response> {
  try {
    const configs = await db.platformConfig.findMany({
      where: { isPublic: true },
    });

    const configMap: Record<string, any> = {
      // Default: Step 2 (AI assessment / plan choice) is hidden unless an admin turns it on.
      enableNextStepFlow: false,
    };

    for (const c of configs) {
      if (c.key === "enable_next_step_flow") {
        configMap.enableNextStepFlow = c.value === "true";
      } else {
        configMap[c.key] = c.value;
      }
    }

    return ApiResponse.json({
      success: true,
      config: configMap,
      enableNextStepFlow: configMap.enableNextStepFlow,
    });
  } catch (error) {
    console.error("Platform config fetch error:", error);
    return ApiResponse.json({
      success: true,
      config: { enableNextStepFlow: false },
      enableNextStepFlow: false,
    });
  }
}

/**
 * POST /api/admin/settings or POST /api/admin/platform-config
 * Updates platform configuration flag
 */
export async function handlePostPlatformConfig(req: ApiRequest): Promise<Response> {
  try {
    const body = await req.json();

    // Support both single key-value update and bulk object update
    if (body && typeof body === "object" && "enableNextStepFlow" in body) {
      const boolVal = Boolean(body.enableNextStepFlow);
      await db.platformConfig.upsert({
        where: { key: "enable_next_step_flow" },
        update: {
          value: String(boolVal),
          isPublic: true,
        },
        create: {
          key: "enable_next_step_flow",
          value: String(boolVal),
          isPublic: true,
          description: "Enable or disable candidate Next Step assessment before preparation plan creation",
        },
      });

      return ApiResponse.json({
        success: true,
        enableNextStepFlow: boolVal,
        message: "Platform setting updated successfully",
      });
    }

    const validated = SettingUpdateSchema.safeParse(body);
    if (!validated.success) {
      return ApiResponse.json(
        { error: "VALIDATION_FAILED", details: validated.error.issues },
        { status: 400 }
      );
    }

    const { key, value, isPublic, description } = validated.data;
    const updated = await db.platformConfig.upsert({
      where: { key },
      update: {
        value,
        isPublic,
        ...(description ? { description } : {}),
      },
      create: {
        key,
        value,
        isPublic,
        description,
      },
    });

    return ApiResponse.json({
      success: true,
      config: updated,
    });
  } catch (error) {
    console.error("Platform config update error:", error);
    return ApiResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
