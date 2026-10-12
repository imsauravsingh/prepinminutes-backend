import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error(
    "MISSING_CONFIG: GEMINI_API_KEY is not defined in environment."
  );
}

export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * Generates 1,536-dimensional vector embedding for pgvector storage using Matryoshka reduction.
 */
export async function generate1536Embedding(text: string): Promise<number[]> {
  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: text,
    config: {
      outputDimensionality: 1536,
    },
  });

  const values = response.embeddings?.[0]?.values;
  if (!values) {
    throw new Error(
      "GEMINI_ERROR: Failed to retrieve embedding values from Gemini API."
    );
  }

  return values;
}
