import { z } from "zod";

export const createSessionSchema = z.object({
  total_cards: z.number().int().min(1).max(50).optional().default(25),
});

export const recordSwipeSchema = z.object({
  session_id: z.string().uuid(),
  gadget_id: z.string().uuid(),
  direction: z.enum(["right", "left", "super"]),
  swipe_duration_ms: z.number().int().positive().optional(),
});

export const trackEventSchema = z.object({
  name: z.string().min(1).max(100),
  session_id: z.string().uuid().optional(),
  gadget_id: z.string().uuid().optional(),
  props: z.record(z.string(), z.unknown()).optional(),
});
