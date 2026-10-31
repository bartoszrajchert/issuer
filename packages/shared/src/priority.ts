import { z } from 'zod/v4';

export const PRIORITY = {
  NONE: 0,
  URGENT: 1,
  HIGH: 2,
  MEDIUM: 3,
  LOW: 4,
} as const;
export type Priority = (typeof PRIORITY)[keyof typeof PRIORITY];
export const prioritySchema = z
  .number()
  .int()
  .min(PRIORITY.NONE)
  .max(PRIORITY.LOW);
