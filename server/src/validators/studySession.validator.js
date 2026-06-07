import { z } from "zod";

export const startSessionSchema = z.object({
  subject: z.string().min(1, "Subject is required").max(100),
  notes: z.string().max(500).optional(),
  tags: z.array(z.string()).optional(),
});

export const endSessionSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  focusLevel: z.number().min(1).max(5).optional(),
  notes: z.string().max(500).optional(),
});