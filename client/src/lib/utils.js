import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind classes intelligently (resolves conflicts).
 * Used by Shadcn UI.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
