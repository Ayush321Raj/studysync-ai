import { z } from "zod";

/**
 * Profile update validation
 */
export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(50, "Full name cannot exceed 50 characters")
    .optional(),
  bio: z
    .string()
    .max(200, "Bio cannot exceed 200 characters")
    .optional(),
  socialLinks: z
    .object({
      github: z.string().url("Invalid GitHub URL").or(z.literal("")).optional(),
      linkedin: z.string().url("Invalid LinkedIn URL").or(z.literal("")).optional(),
      twitter: z.string().url("Invalid Twitter URL").or(z.literal("")).optional(),
      website: z.string().url("Invalid website URL").or(z.literal("")).optional(),
    })
    .optional(),
  preferences: z
    .object({
      theme: z.enum(["light", "dark", "system"]).optional(),
      emailNotifications: z.boolean().optional(),
      studyReminders: z.boolean().optional(),
    })
    .optional(),
});

/**
 * Change password validation
 */
export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

/**
 * Update email validation
 */
export const updateEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

/**
 * Delete account validation
 */
export const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required to delete account"),
});