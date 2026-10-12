import { ApiRequest, ApiResponse } from "../lib/http";
import { db, withCandidateContext } from "../server/db/client";
import { generate1536Embedding } from "../server/ai/gemini";
import { uploadAsset } from "../server/storage/r2";
import { checkRateLimit } from "../server/edge/rate-limiter";
import { resolveCandidateClerkId } from "../server/edge/cors";
import { PDFParse } from "pdf-parse";

function chunkText(text: string, chunkSize = 1200, overlap = 200): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    if (end === text.length) break;
    start += chunkSize - overlap;
  }
  return chunks.length > 0 ? chunks : [text];
}

export async function handlePostResume(req: ApiRequest): Promise<Response> {
  try {
    const clerkId = resolveCandidateClerkId(req);
    if (!clerkId) {
      return ApiResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const rl = await checkRateLimit(clerkId, "ai_eval");
    if (!rl.allowed) {
      return ApiResponse.json(
        { error: "RATE_LIMIT_EXCEEDED", retryAfter: rl.resetSeconds },
        { status: 429 }
      );
    }

    const context = await withCandidateContext(clerkId);
    if (!context.profile) {
      return ApiResponse.json(
        {
          error: "PROFILE_REQUIRED",
          message: "Complete candidate profile before uploading resume.",
        },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return ApiResponse.json(
        { error: "FILE_MISSING", message: "No PDF resume uploaded." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileKey = `resumes/${context.profile.id}-${Date.now()}.pdf`;
    let r2AssetUrl: string | null = null;
    try {
      r2AssetUrl = await uploadAsset(fileKey, buffer, "application/pdf");
    } catch (r2Error) {
      console.warn("R2 upload warning (proceeding with text extraction):", r2Error);
    }

    const parser = new PDFParse({ data: buffer });
    const parsedPdf = await parser.getText();
    const cleanText = (parsedPdf.text || "").replace(/\s+/g, " ").trim();

    if (!cleanText || cleanText.length < 20) {
      return ApiResponse.json(
        {
          error: "UNREADABLE_PDF",
          message: "Could not extract meaningful text from the uploaded PDF.",
        },
        { status: 400 }
      );
    }

    const chunks = chunkText(cleanText, 1200, 200);

    const candidateId = context.profile.id;
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = await generate1536Embedding(chunk);

      await db.$executeRaw`
        INSERT INTO "DocumentEmbedding" (
          "id",
          "candidateId",
          "docType",
          "content",
          "embedding",
          "createdAt"
        )
        VALUES (
          gen_random_uuid()::text,
          ${candidateId},
          'resume',
          ${chunk},
          ${JSON.stringify(embedding)}::vector,
          NOW()
        );
      `;
    }

    return ApiResponse.json({
      success: true,
      chunksProcessed: chunks.length,
      r2AssetUrl,
      extractedPreview: cleanText.slice(0, 300),
    });
  } catch (error) {
    console.error("Resume ingestion failed:", error);
    return ApiResponse.json(
      {
        error: "RESUME_INGESTION_FAILED",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
