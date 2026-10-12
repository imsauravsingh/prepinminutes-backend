import { ApiRequest, ApiResponse } from "./lib/http";
import { getCorsHeaders, withCors } from "./server/edge/cors";
import { handleGetProfile, handlePostProfile } from "./routes/onboarding-profile";
import { handlePostResume } from "./routes/onboarding-resume";
import { handlePostPlanGenerate } from "./routes/plan-generate";
import { handlePostPracticeSubmit } from "./routes/practice-submit";
import { handlePostMockInterviewEnd } from "./routes/mock-interview-end";
import { handleGetEvaluationReport } from "./routes/evaluation-report";
import { handleGetRevisionItems, handlePostRevisionItems } from "./routes/revision-items";
import { handlePostMockInterviewStart, handlePostVoiceSynthesize } from "./routes/voice-gateway";

export type BackendEnv = Record<string, string | undefined>;

function syncEnvToProcess(env: BackendEnv): void {
  if (typeof process === "undefined" || !process.env) return;
  for (const [key, value] of Object.entries(env)) {
    if (typeof value === "string" && !process.env[key]) {
      process.env[key] = value;
    }
  }
}

const worker = {
  async fetch(request: Request, env: BackendEnv = {}): Promise<Response> {
    syncEnvToProcess(env);

    const origin = request.headers.get("Origin");

    // 1. Handle CORS Preflight Requests
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: getCorsHeaders(origin),
      });
    }

    const req = ApiRequest.from(request);
    const { pathname } = req.nextUrl;
    const method = req.method.toUpperCase();

    let response: Response;

    try {
      // Health Check
      if (pathname === "/" || pathname === "/api/health") {
        response = ApiResponse.json({
          status: "ok",
          service: "prepinminutes-backend",
          runtime: "cloudflare-workers",
          timestamp: new Date().toISOString(),
        });
      }
      // Onboarding Profile
      else if (pathname === "/api/onboarding/profile" && method === "GET") {
        response = await handleGetProfile(req);
      } else if (pathname === "/api/onboarding/profile" && method === "POST") {
        response = await handlePostProfile(req);
      }
      // Onboarding Resume PDF & pgvector Embeddings
      else if (pathname === "/api/onboarding/resume" && method === "POST") {
        response = await handlePostResume(req);
      }
      // Preparation Plan Synthesis
      else if (pathname === "/api/plan/generate" && method === "POST") {
        response = await handlePostPlanGenerate(req);
      }
      // Practice Session Submission & Evaluation
      else if (pathname === "/api/practice/session/submit" && method === "POST") {
        response = await handlePostPracticeSubmit(req);
      }
      // Mock Interview Start & End
      else if (pathname === "/api/mock-interview/session/start" && method === "POST") {
        response = await handlePostMockInterviewStart(req);
      } else if (pathname === "/api/mock-interview/session/end" && method === "POST") {
        response = await handlePostMockInterviewEnd(req);
      }
      // Voice TTS Synthesis
      else if (pathname === "/api/voice/synthesize" && method === "POST") {
        response = await handlePostVoiceSynthesize(req);
      }
      // Revision Queue Items
      else if (pathname === "/api/revision/items" && method === "GET") {
        response = await handleGetRevisionItems(req);
      } else if (pathname === "/api/revision/items" && method === "POST") {
        response = await handlePostRevisionItems(req);
      }
      // Evaluation Report Retrieval (/api/evaluation/:reportId)
      else if (pathname.startsWith("/api/evaluation/") && method === "GET") {
        const reportId = pathname.replace("/api/evaluation/", "").replace(/\/$/, "");
        response = await handleGetEvaluationReport(req, reportId);
      } else {
        response = ApiResponse.json(
          { error: "NOT_FOUND", path: pathname, method },
          { status: 404 }
        );
      }
    } catch (error) {
      console.error("Unhandled edge gateway error:", error);
      response = ApiResponse.json(
        {
          error: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }

    return withCors(response, origin);
  },
};

export default worker;
