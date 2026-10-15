import { ApiRequest, ApiResponse } from "../lib/http";
import { db } from "../server/db/client";
import { resolveCandidateClerkId } from "../server/edge/cors";
import {
  hashPassword,
  validatePassword,
  validateUsername,
  verifyPassword,
} from "../server/auth/credentials";

/**
 * PATCH /api/user/profile
 * Updates the candidate's personal account info: fullName, username, avatarUrl.
 */
export async function handlePatchUserProfile(req: ApiRequest): Promise<Response> {
  try {
    const candidateId = resolveCandidateClerkId(req);
    if (!candidateId) {
      return ApiResponse.json(
        { error: "UNAUTHORIZED", message: "You must be signed in to update your profile." },
        { status: 401 }
      );
    }

    const body = (await req.json().catch(() => null)) as {
      fullName?: string;
      username?: string;
      avatarUrl?: string | null;
    } | null;

    if (!body) {
      return ApiResponse.json(
        { error: "INVALID_REQUEST", message: "Request body must be a valid JSON object." },
        { status: 400 }
      );
    }

    const user = await db.user.findFirst({
      where: {
        OR: [{ id: candidateId }, { googleId: candidateId }, { clerkId: candidateId }],
      },
    });

    if (!user) {
      return ApiResponse.json(
        { error: "USER_NOT_FOUND", message: "Candidate account not found." },
        { status: 404 }
      );
    }

    const dataToUpdate: {
      fullName?: string;
      username?: string;
      avatarUrl?: string | null;
    } = {};

    // 1. Full name validation & update
    if (body.fullName !== undefined) {
      const cleanName = body.fullName.trim();
      if (cleanName.length > 100) {
        return ApiResponse.json(
          { error: "INVALID_NAME", message: "Full name must not exceed 100 characters." },
          { status: 400 }
        );
      }
      dataToUpdate.fullName = cleanName;
    }

    // 2. Username validation, formatting & collision check
    if (body.username !== undefined) {
      const cleanUsername = body.username.trim();
      const usernameValidation = validateUsername(cleanUsername);
      if (!usernameValidation.valid) {
        return ApiResponse.json(
          { error: "INVALID_USERNAME", message: usernameValidation.error },
          { status: 400 }
        );
      }

      // If username has changed, check for uniqueness
      if (!user.username || user.username.toLowerCase() !== cleanUsername.toLowerCase()) {
        const existing = await db.user.findFirst({
          where: {
            username: cleanUsername,
            NOT: { id: user.id },
          },
        });
        if (existing) {
          return ApiResponse.json(
            {
              error: "USERNAME_TAKEN",
              message: "This username is already taken. Please choose another username.",
            },
            { status: 409 }
          );
        }
      }

      dataToUpdate.username = cleanUsername;
    }

    // 3. Avatar URL update (allows presets, URLs, or null to revert to initials)
    if (body.avatarUrl !== undefined) {
      dataToUpdate.avatarUrl = body.avatarUrl ? body.avatarUrl.trim() : null;
    }

    // Atomic update to avoid workerd transaction locks
    const updated = await db.user.update({
      where: { id: user.id },
      data: dataToUpdate,
    });

    return ApiResponse.json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        id: updated.id,
        username: updated.username,
        googleId: updated.googleId,
        clerkId: updated.clerkId,
        email: updated.email,
        emailVerified: updated.emailVerified,
        fullName: updated.fullName,
        avatarUrl: updated.avatarUrl,
        authProvider: updated.authProvider,
        createdAt: updated.createdAt,
        hasPassword: Boolean(updated.passwordHash),
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return ApiResponse.json(
      {
        error: "PROFILE_UPDATE_FAILED",
        message: error instanceof Error ? error.message : "Failed to update profile.",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/change-password
 * Allows candidates (both credentials and SSO) to set or change their password.
 * - If candidate already has a password: requires and verifies currentPassword.
 * - If candidate signed up via Google SSO (no password yet): sets initial password directly.
 */
export async function handlePostChangePassword(req: ApiRequest): Promise<Response> {
  try {
    const candidateId = resolveCandidateClerkId(req);
    if (!candidateId) {
      return ApiResponse.json(
        { error: "UNAUTHORIZED", message: "You must be signed in to manage your password." },
        { status: 401 }
      );
    }

    const body = (await req.json().catch(() => null)) as {
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    } | null;

    if (!body || !body.newPassword) {
      return ApiResponse.json(
        {
          error: "MISSING_FIELDS",
          message: "New password is required.",
        },
        { status: 400 }
      );
    }

    const user = await db.user.findFirst({
      where: {
        OR: [{ id: candidateId }, { googleId: candidateId }, { clerkId: candidateId }],
      },
    });

    if (!user) {
      return ApiResponse.json(
        { error: "USER_NOT_FOUND", message: "Candidate account not found." },
        { status: 404 }
      );
    }

    const hasExistingPassword = Boolean(user.passwordHash);

    const { currentPassword, newPassword, confirmPassword } = body;

    // If candidate already has a password, verify current password
    if (hasExistingPassword) {
      if (!currentPassword) {
        return ApiResponse.json(
          {
            error: "MISSING_CURRENT_PASSWORD",
            message: "Current password is required to change your password.",
          },
          { status: 400 }
        );
      }
      if (!verifyPassword(currentPassword, user.passwordHash)) {
        return ApiResponse.json(
          {
            error: "INVALID_CURRENT_PASSWORD",
            message: "The current password you entered is incorrect.",
          },
          { status: 400 }
        );
      }
    }

    // Validate new password strength
    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      return ApiResponse.json(
        { error: "INVALID_NEW_PASSWORD", message: validation.error },
        { status: 400 }
      );
    }

    // Validate confirmation
    if (confirmPassword && newPassword !== confirmPassword) {
      return ApiResponse.json(
        {
          error: "PASSWORD_MISMATCH",
          message: "New password and Confirm password do not match.",
        },
        { status: 400 }
      );
    }

    // Hash and update atomically
    const passwordHash = hashPassword(newPassword);
    await db.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return ApiResponse.json({
      success: true,
      message: hasExistingPassword
        ? "Password changed successfully."
        : "Password set successfully! You can now log in using your password or Google SSO.",
      hasPassword: true,
    });
  } catch (error) {
    console.error("Password change error:", error);
    return ApiResponse.json(
      {
        error: "PASSWORD_CHANGE_FAILED",
        message: error instanceof Error ? error.message : "Failed to change password.",
      },
      { status: 500 }
    );
  }
}

