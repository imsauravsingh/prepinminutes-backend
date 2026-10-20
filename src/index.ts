import "./server/edge/polyfills";
import { ApiRequest, ApiResponse } from "./lib/http";
import { getCorsHeaders, withCors } from "./server/edge/cors";
import { handleGetProfile, handlePostProfile } from "./routes/onboarding-profile";
import { handlePostResume } from "./routes/onboarding-resume";
import { handlePostPlanGenerate } from "./routes/plan-generate";
import { handlePostPracticeSubmit } from "./routes/practice-submit";
import { handlePostMockInterviewEnd } from "./routes/mock-interview-end";
import { handleGetEvaluationReport } from "./routes/evaluation-report";
import { handleGetRevisionItems, handlePostRevisionItems } from "./routes/revision-items";
import {
  handlePostMockInterviewStart,
  handlePostVoiceSynthesize,
  handlePostVoiceTranscribe,
} from "./routes/voice-gateway";
import { handlePostAiAssessmentStart, handlePostAiAssessmentFinish } from "./routes/ai-assessment";
import {
  handleGetAuthConfig,
  handleGetAuthMe,
  handleGetGoogleOAuthCallback,
  handleGetGoogleOAuthRedirect,
  handlePostAuthLogout,
  handlePostGoogleIdToken,
  handlePostLogin,
  handlePostRegister,
  handlePostResendVerification,
  handlePostVerifyEmail,
  handlePostForgotPassword,
  handlePostVerifyResetCode,
  handlePostResetPassword,
} from "./routes/auth";
import {
  handlePatchUserProfile,
  handlePostChangePassword,
} from "./routes/user-profile";
import {
  handlePostAdminLogin,
  handlePostAdminGoogle,
  handlePostAdminRequestAccess,
  handleGetAdminMe,
  handlePostAdminLogout,
} from "./routes/admin-auth";
import {
  handleGetNeo4jOverview,
  handleGetNeo4jDomains,
  handleGetNeo4jCategories,
  handlePostNeo4jCategory,
  handlePutNeo4jCategory,
  handleDeleteNeo4jCategory,
  handleGetNeo4jTopics,
  handlePostNeo4jTopic,
  handlePutNeo4jTopic,
  handleDeleteNeo4jTopic,
  handleGetNeo4jQuestions,
  handlePostNeo4jQuestion,
  handlePutNeo4jQuestion,
  handleDeleteNeo4jQuestion,
} from "./routes/admin-curriculum";
import {
  handleGetNeo4jPending,
  handlePostNeo4jApprove,
  handlePostNeo4jReject,
} from "./routes/admin-approvals";
import {
  handleGetAdminCandidates,
  handleGetAdminCandidateDetail,
  handlePatchAdminCandidateSubscription,
  handlePostAdminBlockCandidate,
  handlePostAdminUnblockCandidate,
  handlePostAdminResetQuota,
} from "./routes/admin-candidates";
import {
  handleGetAdminTeam,
  handleGetAdminTeamPending,
  handlePatchAdminTeamApprove,
  handlePatchAdminTeamReject,
  handlePatchAdminTeamRole,
  handlePostAdminTeamBlock,
  handlePostAdminTeamUnblock,
  handleGetAdminAuditLogs,
} from "./routes/admin-team";

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
      // Authentication & Google Single Sign-On (OAuth 2.0 Redirect + Google ID Token Verification)
      else if (pathname === "/api/auth/config" && method === "GET") {
        response = await handleGetAuthConfig();
      }
      // Admin Control Plane Authentication
      else if (pathname === "/api/admin/auth/login" && method === "POST") {
        response = await handlePostAdminLogin(req);
      } else if (pathname === "/api/admin/auth/google" && method === "POST") {
        response = await handlePostAdminGoogle(req);
      } else if (pathname === "/api/admin/auth/request-access" && method === "POST") {
        response = await handlePostAdminRequestAccess(req);
      } else if (pathname === "/api/admin/auth/me" && method === "GET") {
        response = await handleGetAdminMe(req);
      } else if (pathname === "/api/admin/auth/logout" && method === "POST") {
        response = await handlePostAdminLogout();
      }
      // Admin Neo4j Knowledge Graph Curriculum & Overview
      else if (pathname === "/api/admin/neo4j/overview" && method === "GET") {
        response = await handleGetNeo4jOverview(req);
      } else if (pathname === "/api/admin/neo4j/domains" && method === "GET") {
        response = await handleGetNeo4jDomains(req);
      } else if (pathname === "/api/admin/neo4j/categories" && method === "GET") {
        response = await handleGetNeo4jCategories(req);
      } else if (pathname === "/api/admin/neo4j/categories" && method === "POST") {
        response = await handlePostNeo4jCategory(req);
      } else if (pathname.startsWith("/api/admin/neo4j/categories/") && method === "PUT") {
        const slug = pathname.replace("/api/admin/neo4j/categories/", "").replace(/\/$/, "");
        response = await handlePutNeo4jCategory(req, slug);
      } else if (pathname.startsWith("/api/admin/neo4j/categories/") && method === "DELETE") {
        const slug = pathname.replace("/api/admin/neo4j/categories/", "").replace(/\/$/, "");
        response = await handleDeleteNeo4jCategory(req, slug);
      } else if (pathname === "/api/admin/neo4j/topics" && method === "GET") {
        response = await handleGetNeo4jTopics(req);
      } else if (pathname === "/api/admin/neo4j/topics" && method === "POST") {
        response = await handlePostNeo4jTopic(req);
      } else if (pathname.startsWith("/api/admin/neo4j/topics/") && method === "PUT") {
        const slug = pathname.replace("/api/admin/neo4j/topics/", "").replace(/\/$/, "");
        response = await handlePutNeo4jTopic(req, slug);
      } else if (pathname.startsWith("/api/admin/neo4j/topics/") && method === "DELETE") {
        const slug = pathname.replace("/api/admin/neo4j/topics/", "").replace(/\/$/, "");
        response = await handleDeleteNeo4jTopic(req, slug);
      } else if (pathname === "/api/admin/neo4j/questions" && method === "GET") {
        response = await handleGetNeo4jQuestions(req);
      } else if (pathname === "/api/admin/neo4j/questions" && method === "POST") {
        response = await handlePostNeo4jQuestion(req);
      } else if (pathname.startsWith("/api/admin/neo4j/questions/") && method === "PUT") {
        const id = pathname.replace("/api/admin/neo4j/questions/", "").replace(/\/$/, "");
        response = await handlePutNeo4jQuestion(req, id);
      } else if (pathname.startsWith("/api/admin/neo4j/questions/") && method === "DELETE") {
        const id = pathname.replace("/api/admin/neo4j/questions/", "").replace(/\/$/, "");
        response = await handleDeleteNeo4jQuestion(req, id);
      }
      // Admin Neo4j Staging & Approval Gate
      else if (pathname === "/api/admin/neo4j/pending" && method === "GET") {
        response = await handleGetNeo4jPending(req);
      } else if (pathname === "/api/admin/neo4j/approve" && method === "POST") {
        response = await handlePostNeo4jApprove(req);
      } else if (pathname === "/api/admin/neo4j/reject" && method === "POST") {
        response = await handlePostNeo4jReject(req);
      }
      // Module A: Admin Candidate Directory & Subscriptions
      else if (pathname === "/api/admin/candidates" && method === "GET") {
        response = await handleGetAdminCandidates(req);
      } else if (pathname.startsWith("/api/admin/candidates/") && pathname.endsWith("/subscription") && method === "PATCH") {
        const id = pathname.replace("/api/admin/candidates/", "").replace("/subscription", "");
        response = await handlePatchAdminCandidateSubscription(req, id);
      } else if (pathname.startsWith("/api/admin/candidates/") && pathname.endsWith("/block") && method === "POST") {
        const id = pathname.replace("/api/admin/candidates/", "").replace("/block", "");
        response = await handlePostAdminBlockCandidate(req, id);
      } else if (pathname.startsWith("/api/admin/candidates/") && pathname.endsWith("/unblock") && method === "POST") {
        const id = pathname.replace("/api/admin/candidates/", "").replace("/unblock", "");
        response = await handlePostAdminUnblockCandidate(req, id);
      } else if (pathname.startsWith("/api/admin/candidates/") && pathname.endsWith("/reset-quota") && method === "POST") {
        const id = pathname.replace("/api/admin/candidates/", "").replace("/reset-quota", "");
        response = await handlePostAdminResetQuota(req, id);
      } else if (pathname.startsWith("/api/admin/candidates/") && method === "GET") {
        const id = pathname.replace("/api/admin/candidates/", "").replace(/\/$/, "");
        response = await handleGetAdminCandidateDetail(req, id);
      }
      // Module B: Admin HOD Team Management & Staff Approvals (Root HOD Only)
      else if (pathname === "/api/admin/team" && method === "GET") {
        response = await handleGetAdminTeam(req);
      } else if (pathname === "/api/admin/team/pending" && method === "GET") {
        response = await handleGetAdminTeamPending(req);
      } else if (pathname === "/api/admin/team/audit-logs" && method === "GET") {
        response = await handleGetAdminAuditLogs(req);
      } else if (pathname.startsWith("/api/admin/team/") && pathname.endsWith("/approve") && method === "PATCH") {
        const id = pathname.replace("/api/admin/team/", "").replace("/approve", "");
        response = await handlePatchAdminTeamApprove(req, id);
      } else if (pathname.startsWith("/api/admin/team/") && pathname.endsWith("/reject") && method === "PATCH") {
        const id = pathname.replace("/api/admin/team/", "").replace("/reject", "");
        response = await handlePatchAdminTeamReject(req, id);
      } else if (pathname.startsWith("/api/admin/team/") && pathname.endsWith("/role") && method === "PATCH") {
        const id = pathname.replace("/api/admin/team/", "").replace("/role", "");
        response = await handlePatchAdminTeamRole(req, id);
      } else if (pathname.startsWith("/api/admin/team/") && pathname.endsWith("/block") && method === "POST") {
        const id = pathname.replace("/api/admin/team/", "").replace("/block", "");
        response = await handlePostAdminTeamBlock(req, id);
      } else if (pathname.startsWith("/api/admin/team/") && pathname.endsWith("/unblock") && method === "POST") {
        const id = pathname.replace("/api/admin/team/", "").replace("/unblock", "");
        response = await handlePostAdminTeamUnblock(req, id);
      } else if (pathname === "/api/auth/google" && method === "GET") {
        response = await handleGetGoogleOAuthRedirect(req);
      } else if (pathname === "/api/auth/google/callback" && method === "GET") {
        response = await handleGetGoogleOAuthCallback(req);
      } else if (
        (pathname === "/api/auth/google/token" || pathname === "/api/auth/google") &&
        method === "POST"
      ) {
        response = await handlePostGoogleIdToken(req);
      } else if (pathname === "/api/auth/me" && method === "GET") {
        response = await handleGetAuthMe(req);
      } else if (pathname === "/api/auth/logout" && method === "POST") {
        response = await handlePostAuthLogout();
      } else if (pathname === "/api/auth/register" && method === "POST") {
        response = await handlePostRegister(req);
      } else if (pathname === "/api/auth/login" && method === "POST") {
        response = await handlePostLogin(req);
      } else if (pathname === "/api/auth/verify-email" && method === "POST") {
        response = await handlePostVerifyEmail(req);
      } else if (pathname === "/api/auth/resend-verification" && method === "POST") {
        response = await handlePostResendVerification(req);
      } else if (pathname === "/api/auth/forgot-password" && method === "POST") {
        response = await handlePostForgotPassword(req);
      } else if (pathname === "/api/auth/verify-reset-code" && method === "POST") {
        response = await handlePostVerifyResetCode(req);
      } else if (pathname === "/api/auth/reset-password" && method === "POST") {
        response = await handlePostResetPassword(req);
      } else if (pathname === "/api/user/profile" && method === "PATCH") {
        response = await handlePatchUserProfile(req);
      } else if (pathname === "/api/auth/change-password" && method === "POST") {
        response = await handlePostChangePassword(req);
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
      // AI Diagnostic Assessment (Option 1)
      else if (pathname === "/api/ai-assessment/start" && method === "POST") {
        response = await handlePostAiAssessmentStart(req);
      } else if (pathname === "/api/ai-assessment/finish" && method === "POST") {
        response = await handlePostAiAssessmentFinish(req);
      }
      // Voice TTS Synthesis & STT Transcription
      else if (pathname === "/api/voice/synthesize" && method === "POST") {
        response = await handlePostVoiceSynthesize(req);
      } else if (pathname === "/api/voice/transcribe" && method === "POST") {
        response = await handlePostVoiceTranscribe(req);
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
