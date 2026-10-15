/**
 * PrepInMinutes — Environment Secrets Configuration
 * 
 * Strategy:
 * 1. Production (Cloudflare Pages / Workers):
 *    Directly reads native environment variables & secrets injected by Cloudflare
 *    at the edge runtime into `process.env` (0ms latency, encrypted at rest).
 * 
 * 2. Local Development:
 *    Reads seamlessly from the local `.env` file on disk.
 */

export interface AppSecrets {
  // Database & Cache
  DATABASE_URL: string;
  DIRECT_URL: string;
  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string;

  // Cloudflare R2 Storage
  R2_ACCOUNT_ID: string;
  R2_ENDPOINT: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  R2_BUCKET_NAME: string;

  // Voice AI (STT & TTS)
  DEEPGRAM_PROJECT_ID: string;
  DEEPGRAM_API_KEY: string;
  CARTESIA_API_KEY: string;

  // Google Gemini AI
  GEMINI_API_KEY: string;
  GOOGLE_AI_PROJECT_ID: string;
  GOOGLE_AI_PROJECT_NUMBER: string;

  // Auth (SSO Provider Control: Google SSO enabled by default, Clerk disabled by default)
  AUTH_PROVIDER: string; // "google" | "clerk" | "both" (default: "google")
  GOOGLE_SSO_FLOW: string; // "redirect" | "id_token" | "both" (default: "both")
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_REDIRECT_URI: string;
  FRONTEND_URL: string;
  JWT_SECRET: string;

  // Legacy / Optional Clerk Auth (disabled when AUTH_PROVIDER="google")
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
  CLERK_SECRET_KEY: string;

  // Transactional Email Service (Resend)
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
}

let cachedSecrets: AppSecrets | null = null;

/**
 * Parses the local .env file on disk when running outside Next.js bundlers.
 * In production Cloudflare edge, this is bypassed as Cloudflare injects into process.env.
 */
function loadLocalEnvFallback(): Record<string, string> {
  const map: Record<string, string> = {};
  try {
    if (typeof process === "undefined" || typeof process.cwd !== "function") {
      return map;
    }
    const cwd = process.cwd();
    if (!cwd) return map;

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path');
    if (!fs || !path || typeof path.resolve !== "function" || typeof fs.existsSync !== "function") {
      return map;
    }

    const envPath = path.resolve(cwd, '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx === -1) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        map[key] = val;
      }
    }
  } catch {
    // In edge runtimes (Cloudflare), fs is unavailable or restricted; ignore silently
  }
  return map;
}

/**
 * Retrieves environment secrets.
 * - In Production (Cloudflare): pulls from Cloudflare runtime variables/secrets.
 * - In Local Development: pulls from .env file on disk.
 */
export function getSecrets(): AppSecrets {
  if (cachedSecrets) {
    return cachedSecrets;
  }

  const isProduction = process.env.NODE_ENV === 'production' || !!process.env.CF_PAGES;
  const localEnv = !isProduction || !process.env.DATABASE_URL ? loadLocalEnvFallback() : {};

  const resolved: AppSecrets = {
    DATABASE_URL: process.env.DATABASE_URL || localEnv.DATABASE_URL || '',
    DIRECT_URL: process.env.DIRECT_URL || localEnv.DIRECT_URL || '',
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL || localEnv.UPSTASH_REDIS_REST_URL || '',
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN || localEnv.UPSTASH_REDIS_REST_TOKEN || '',
    R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID || localEnv.R2_ACCOUNT_ID || '',
    R2_ENDPOINT: process.env.R2_ENDPOINT || localEnv.R2_ENDPOINT || '',
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID || localEnv.R2_ACCESS_KEY_ID || '',
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY || localEnv.R2_SECRET_ACCESS_KEY || '',
    R2_BUCKET_NAME: process.env.R2_BUCKET_NAME || localEnv.R2_BUCKET_NAME || 'prepinminutes-assets',
    DEEPGRAM_PROJECT_ID: process.env.DEEPGRAM_PROJECT_ID || localEnv.DEEPGRAM_PROJECT_ID || '',
    DEEPGRAM_API_KEY: process.env.DEEPGRAM_API_KEY || localEnv.DEEPGRAM_API_KEY || '',
    CARTESIA_API_KEY: process.env.CARTESIA_API_KEY || localEnv.CARTESIA_API_KEY || '',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || localEnv.GEMINI_API_KEY || '',
    GOOGLE_AI_PROJECT_ID: process.env.GOOGLE_AI_PROJECT_ID || localEnv.GOOGLE_AI_PROJECT_ID || '',
    GOOGLE_AI_PROJECT_NUMBER: process.env.GOOGLE_AI_PROJECT_NUMBER || localEnv.GOOGLE_AI_PROJECT_NUMBER || '',
    AUTH_PROVIDER: process.env.AUTH_PROVIDER || localEnv.AUTH_PROVIDER || 'google',
    GOOGLE_SSO_FLOW: process.env.GOOGLE_SSO_FLOW || localEnv.GOOGLE_SSO_FLOW || 'both',
    GOOGLE_CLIENT_ID:
      process.env.GOOGLE_CLIENT_ID ||
      localEnv.GOOGLE_CLIENT_ID ||
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      localEnv.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      '',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || localEnv.GOOGLE_CLIENT_SECRET || '',
    GOOGLE_REDIRECT_URI:
      process.env.GOOGLE_REDIRECT_URI ||
      localEnv.GOOGLE_REDIRECT_URI ||
      (isProduction
        ? 'https://api.prepinminutes.com/api/auth/google/callback'
        : 'http://localhost:8787/api/auth/google/callback'),
    FRONTEND_URL:
      process.env.FRONTEND_URL ||
      localEnv.FRONTEND_URL ||
      (isProduction ? 'https://prepinminutes.com' : 'http://localhost:3000'),
    JWT_SECRET:
      process.env.JWT_SECRET ||
      localEnv.JWT_SECRET ||
      'prepinminutes-dev-jwt-secret-change-in-production',
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || localEnv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '',
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || localEnv.CLERK_SECRET_KEY || '',
    RESEND_API_KEY: process.env.RESEND_API_KEY || localEnv.RESEND_API_KEY || '',
    EMAIL_FROM: process.env.EMAIL_FROM || localEnv.EMAIL_FROM || 'PrepInMinutes <onboarding@resend.dev>',
  };

  if (isProduction && process.env.DATABASE_URL) {
    console.log('⚡ [SecretsResolver] Operating with Cloudflare edge runtime variables (Production).');
  } else {
    console.log('📄 [SecretsResolver] Operating with local .env environment variables (Development).');
  }

  cachedSecrets = resolved;
  return resolved;
}

/**
 * Accessor for environment keys with fallback.
 */
export function getEnv(key: keyof AppSecrets, fallback = ''): string {
  if (cachedSecrets && cachedSecrets[key]) {
    return cachedSecrets[key];
  }
  return process.env[key] || fallback;
}
