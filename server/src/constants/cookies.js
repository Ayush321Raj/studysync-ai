/**
 * Cookie options for refresh tokens
 * Security: httpOnly + secure + sameSite
 */
export const cookieOptions = {
  httpOnly: true, // Prevents XSS attacks
  secure: process.env.NODE_ENV === "production", // HTTPS only in production
  sameSite: "strict", // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  path: "/", // Available across entire domain
};