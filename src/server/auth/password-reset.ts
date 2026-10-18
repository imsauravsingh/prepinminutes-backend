import { redis, RedisKeys } from "../redis/client";
import { getSecrets } from "../config/secrets";

export const RESET_OTP_TTL_SECONDS = 600; // 10 minutes
export const RESET_OTP_COOLDOWN_SECONDS = 60; // 60 seconds
export const MAX_RESET_OTP_ATTEMPTS = 5;

interface StoredResetOtpData {
  code: string;
  attempts: number;
  createdAt: number;
}

/**
 * Generates a cryptographically secure 6-digit numeric OTP code.
 */
export function generatePasswordResetOtp(): string {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  const code = 100000 + (buffer[0] % 900000);
  return code.toString();
}

/**
 * Stores the password reset OTP in Upstash Redis with a 10-minute TTL.
 */
export async function storePasswordResetOtp(
  email: string,
  code: string,
  ttlSeconds = RESET_OTP_TTL_SECONDS
): Promise<void> {
  const key = RedisKeys.passwordResetOtp(email);
  const data: StoredResetOtpData = {
    code,
    attempts: 0,
    createdAt: Date.now(),
  };

  await redis.set(key, JSON.stringify(data), { ex: ttlSeconds });
}

/**
 * Checks if the user is in a resend cooldown window for password reset.
 */
export async function checkPasswordResetCooldown(
  email: string
): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  const key = RedisKeys.passwordResetCooldown(email);
  const ttl = await redis.ttl(key);

  if (ttl > 0) {
    return { allowed: false, retryAfterSeconds: ttl };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

/**
 * Sets a cooldown on requesting another password reset code for this email.
 */
export async function setPasswordResetCooldown(
  email: string,
  cooldownSeconds = RESET_OTP_COOLDOWN_SECONDS
): Promise<void> {
  const key = RedisKeys.passwordResetCooldown(email);
  await redis.set(key, "1", { ex: cooldownSeconds });
}

/**
 * Verifies the password reset OTP code against Redis.
 * Deletes key upon successful match. Enforces maximum attempt limits to prevent brute-forcing.
 */
export async function verifyPasswordResetOtp(
  email: string,
  enteredCode: string,
  preserveKeyOnSuccess = false
): Promise<{ valid: boolean; error?: string }> {
  const cleanCode = enteredCode.trim();
  if (!cleanCode || cleanCode.length !== 6 || !/^\d{6}$/.test(cleanCode)) {
    return { valid: false, error: "Please enter a valid 6-digit reset code." };
  }

  const key = RedisKeys.passwordResetOtp(email);
  const rawData = await redis.get<string | StoredResetOtpData>(key);

  if (!rawData) {
    return {
      valid: false,
      error: "Reset code has expired or was not requested. Please request a new code.",
    };
  }

  const data: StoredResetOtpData =
    typeof rawData === "string" ? JSON.parse(rawData) : rawData;

  // Rate-limiting brute-force attempts
  if (data.attempts >= MAX_RESET_OTP_ATTEMPTS) {
    await redis.del(key);
    return {
      valid: false,
      error: "Too many failed attempts. Please request a new reset code.",
    };
  }

  if (data.code !== cleanCode) {
    data.attempts += 1;
    const remainingTtl = await redis.ttl(key);
    if (remainingTtl > 0) {
      await redis.set(key, JSON.stringify(data), { ex: remainingTtl });
    }
    const remainingAttempts = MAX_RESET_OTP_ATTEMPTS - data.attempts;
    return {
      valid: false,
      error: `Invalid code. ${remainingAttempts} attempt${remainingAttempts === 1 ? "" : "s"} remaining.`,
    };
  }

  if (!preserveKeyOnSuccess) {
    // Successfully verified: Delete OTP and cooldown
    await redis.del(key);
    await redis.del(RedisKeys.passwordResetCooldown(email));
  }

  return { valid: true };
}

/**
 * Sends the password reset email via Resend API (if configured) or logs to console.
 */
export async function sendPasswordResetEmail(
  email: string,
  code: string,
  username?: string
): Promise<{ sent: boolean; devCode?: string }> {
  const isProd = process.env.NODE_ENV === "production";
  const secrets = getSecrets();
  const resendApiKey = process.env.RESEND_API_KEY || secrets.RESEND_API_KEY;
  const senderEmail =
    process.env.EMAIL_FROM ||
    secrets.EMAIL_FROM ||
    "PrepInMinutes <onboarding@resend.dev>";

  // Beautiful console banner for developer/staging visibility
  console.log("\n" + "=".repeat(64));
  console.log("   🔑   PREPINMINUTES PASSWORD RESET");
  console.log("=".repeat(64));
  console.log(`  Recipient: ${email}`);
  if (username) console.log(`  Candidate: ${username}`);
  console.log(`  Reset OTP: >>> ${code} <<<`);
  console.log(`  Validity:  10 minutes (${RESET_OTP_TTL_SECONDS}s)`);
  if (resendApiKey) {
    console.log(`  Delivery:  Real Email (Resend API -> ${senderEmail})`);
  } else {
    console.log(`  Delivery:  Local Simulated Mode (No RESEND_API_KEY in .env)`);
  }
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
          subject: `${code} is your PrepInMinutes password reset code`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #1e293b;">
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="display: inline-block; padding: 8px 16px; background-color: #fff1ed; border-radius: 9999px; font-weight: 700; color: #ff6c47; font-size: 14px;">PrepInMinutes</span>
              </div>
              <h1 style="font-size: 24px; font-weight: 800; text-align: center; margin-bottom: 8px; color: #0f172a;">Reset your password</h1>
              <p style="text-align: center; color: #64748b; font-size: 15px; margin-bottom: 32px;">
                Hi${username ? ` ${username}` : ""}, we received a request to reset your password. Enter the code below to choose a new password.
              </p>
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 28px;">
                <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #ff6c47; font-family: monospace;">${code}</div>
                <p style="font-size: 13px; color: #94a3b8; margin-top: 8px; margin-bottom: 0;">Code expires in 10 minutes</p>
              </div>
              <p style="font-size: 13px; color: #94a3b8; text-align: center;">
                If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
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
      console.error("Failed to dispatch password reset email via Resend:", err);
    }
  }

  return {
    sent: true,
    devCode: isProd ? undefined : code,
  };
}

