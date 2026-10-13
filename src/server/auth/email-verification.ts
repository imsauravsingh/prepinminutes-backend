import { redis, RedisKeys } from "../redis/client";

export const OTP_TTL_SECONDS = 600; // 10 minutes
export const OTP_COOLDOWN_SECONDS = 60; // 60 seconds between resends
export const MAX_OTP_ATTEMPTS = 5;

interface StoredOtpData {
  code: string;
  attempts: number;
  createdAt: number;
}

/**
 * Generates a cryptographically secure 6-digit numeric OTP code.
 */
export function generateVerificationOtp(): string {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  const code = 100000 + (buffer[0] % 900000);
  return code.toString();
}

/**
 * Stores the verification OTP in Upstash Redis with a 10-minute TTL.
 */
export async function storeVerificationOtp(
  email: string,
  code: string,
  ttlSeconds = OTP_TTL_SECONDS
): Promise<void> {
  const key = RedisKeys.otpVerify(email);
  const data: StoredOtpData = {
    code,
    attempts: 0,
    createdAt: Date.now(),
  };

  await redis.set(key, JSON.stringify(data), { ex: ttlSeconds });
}

/**
 * Checks if the user is rate-limited from requesting another OTP code.
 */
export async function checkOtpCooldown(
  email: string
): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  const key = RedisKeys.otpCooldown(email);
  const ttl = await redis.ttl(key);

  if (ttl > 0) {
    return { allowed: false, retryAfterSeconds: ttl };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

/**
 * Sets a cooldown on resending OTP codes for this email.
 */
export async function setOtpCooldown(
  email: string,
  cooldownSeconds = OTP_COOLDOWN_SECONDS
): Promise<void> {
  const key = RedisKeys.otpCooldown(email);
  await redis.set(key, "1", { ex: cooldownSeconds });
}

/**
 * Verifies an OTP code against Redis.
 * Deletes key upon successful match. Enforces maximum attempt limits to prevent brute-forcing.
 */
export async function verifyVerificationOtp(
  email: string,
  enteredCode: string
): Promise<{ valid: boolean; error?: string }> {
  const cleanCode = enteredCode.trim();
  if (!cleanCode || cleanCode.length !== 6 || !/^\d{6}$/.test(cleanCode)) {
    return { valid: false, error: "Please enter a valid 6-digit verification code." };
  }

  const key = RedisKeys.otpVerify(email);
  const rawData = await redis.get<string | StoredOtpData>(key);

  if (!rawData) {
    return {
      valid: false,
      error: "Verification code has expired or was not requested. Please request a new code.",
    };
  }

  const data: StoredOtpData =
    typeof rawData === "string" ? JSON.parse(rawData) : rawData;

  // Rate-limiting brute-force attempts
  if (data.attempts >= MAX_OTP_ATTEMPTS) {
    await redis.del(key);
    return {
      valid: false,
      error: "Too many failed attempts. Please request a new verification code.",
    };
  }

  if (data.code !== cleanCode) {
    data.attempts += 1;
    // Update attempts with remaining TTL
    const remainingTtl = await redis.ttl(key);
    if (remainingTtl > 0) {
      await redis.set(key, JSON.stringify(data), { ex: remainingTtl });
    }
    const remainingAttempts = MAX_OTP_ATTEMPTS - data.attempts;
    return {
      valid: false,
      error: `Invalid code. ${remainingAttempts} attempt${remainingAttempts === 1 ? "" : "s"} remaining.`,
    };
  }

  // Successfully verified: Delete OTP and cooldown
  await redis.del(key);
  await redis.del(RedisKeys.otpCooldown(email));

  return { valid: true };
}

/**
 * Returns the current stored OTP for development/testing inspection.
 */
export async function getStoredOtpForDev(email: string): Promise<string | null> {
  const key = RedisKeys.otpVerify(email);
  const rawData = await redis.get<string | StoredOtpData>(key);
  if (!rawData) return null;
  const data: StoredOtpData =
    typeof rawData === "string" ? JSON.parse(rawData) : rawData;
  return data.code;
}

/**
 * Sends the verification email via Resend API (if configured) or logs to console.
 */
export async function sendVerificationEmail(
  email: string,
  code: string,
  username?: string
): Promise<{ sent: boolean; devCode?: string }> {
  const isProd = process.env.NODE_ENV === "production";
  const resendApiKey = process.env.RESEND_API_KEY;
  const senderEmail = process.env.EMAIL_FROM || "PrepInMinutes <onboarding@prepinminutes.com>";

  // Beautiful console banner for developer/staging visibility
  console.log("\n" + "=".repeat(64));
  console.log("   ✉️   PREPINMINUTES EMAIL VERIFICATION CODE");
  console.log("=".repeat(64));
  console.log(`  Recipient: ${email}`);
  if (username) console.log(`  Candidate: ${username}`);
  console.log(`  OTP Code:  >>> ${code} <<<`);
  console.log(`  Validity:  10 minutes (${OTP_TTL_SECONDS}s)`);
  console.log("=".repeat(64) + "\n");

  if (resendApiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: senderEmail,
          to: [email],
          subject: `${code} is your PrepInMinutes verification code`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #1e293b;">
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="display: inline-block; padding: 8px 16px; background-color: #f1f5f9; border-radius: 9999px; font-weight: 700; color: #0284c7; font-size: 14px;">PrepInMinutes</span>
              </div>
              <h1 style="font-size: 24px; font-weight: 800; text-align: center; margin-bottom: 8px; color: #0f172a;">Verify your email address</h1>
              <p style="text-align: center; color: #64748b; font-size: 15px; margin-bottom: 32px;">
                Hi${username ? ` ${username}` : ""}, thank you for signing up. Please enter the verification code below to activate your account.
              </p>
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 28px;">
                <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0284c7; font-family: monospace;">${code}</div>
                <p style="font-size: 13px; color: #94a3b8; margin-top: 8px; margin-bottom: 0;">Code expires in 10 minutes</p>
              </div>
              <p style="font-size: 13px; color: #94a3b8; text-align: center;">
                If you did not request this verification, you can safely ignore this email.
              </p>
            </div>
          `,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`Resend email dispatch returned ${response.status}: ${errorText}`);
      } else {
        return { sent: true, devCode: isProd ? undefined : code };
      }
    } catch (err) {
      console.error("Failed to dispatch email via Resend:", err);
    }
  }

  // Fallback for local development or staging
  return {
    sent: true,
    devCode: isProd ? undefined : code,
  };
}

