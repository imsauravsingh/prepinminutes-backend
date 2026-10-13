/**
 * PrepInMinutes — Credentials Authentication Service
 * 
 * Provides edge-safe password hashing and verification using PBKDF2-HMAC-SHA256
 * (100,000 iterations, 16-byte random salt, constant-time comparison).
 * 100% compatible with Cloudflare Workers isolates (workerd) and Node.js.
 */

import crypto from "crypto";

const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_KEY_LEN = 32; // 256 bits
const PBKDF2_DIGEST = "sha256";

/**
 * Validates candidate username format.
 * Must be 3-30 characters, containing only letters, numbers, underscores, dashes, or dots.
 */
export function validateUsername(username: unknown): { valid: boolean; error?: string } {
  if (typeof username !== "string" || !username.trim()) {
    return { valid: false, error: "Username is required." };
  }
  const clean = username.trim();
  if (clean.length < 3) {
    return { valid: false, error: "Username must be at least 3 characters." };
  }
  if (clean.length > 30) {
    return { valid: false, error: "Username must not exceed 30 characters." };
  }
  if (!/^[a-zA-Z0-9_.-]+$/.test(clean)) {
    return {
      valid: false,
      error: "Username may only contain letters, numbers, dots, dashes, and underscores.",
    };
  }
  return { valid: true };
}

/**
 * Validates candidate email address format.
 */
export function validateEmail(email: unknown): { valid: boolean; error?: string } {
  if (typeof email !== "string" || !email.trim()) {
    return { valid: false, error: "Email address is required." };
  }
  const clean = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(clean)) {
    return { valid: false, error: "Please enter a valid email address." };
  }
  return { valid: true };
}

/**
 * Validates password strength (minimum 8 characters).
 */
export function validatePassword(password: unknown): { valid: boolean; error?: string } {
  if (typeof password !== "string" || !password) {
    return { valid: false, error: "Password is required." };
  }
  if (password.length < 8) {
    return { valid: false, error: "Password must be at least 8 characters long." };
  }
  return { valid: true };
}

/**
 * Securely hashes a plain-text password using PBKDF2-HMAC-SHA256 with a unique 16-byte salt.
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const derivedKey = crypto.pbkdf2Sync(
    password,
    salt,
    PBKDF2_ITERATIONS,
    PBKDF2_KEY_LEN,
    PBKDF2_DIGEST
  );
  return `${salt.toString("hex")}:${derivedKey.toString("hex")}`;
}

/**
 * Verifies a candidate password against the stored PBKDF2 salt-hash string in constant time.
 */
export function verifyPassword(password: string, storedHash: string | null | undefined): boolean {
  if (!password || !storedHash) return false;
  try {
    const parts = storedHash.split(":");
    if (parts.length !== 2) return false;
    const [saltHex, expectedKeyHex] = parts;
    const salt = Buffer.from(saltHex, "hex");
    const expectedKey = Buffer.from(expectedKeyHex, "hex");

    const derivedKey = crypto.pbkdf2Sync(
      password,
      salt,
      PBKDF2_ITERATIONS,
      PBKDF2_KEY_LEN,
      PBKDF2_DIGEST
    );

    if (derivedKey.length !== expectedKey.length) return false;
    return crypto.timingSafeEqual(derivedKey, expectedKey);
  } catch {
    return false;
  }
}

