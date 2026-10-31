import { z } from 'zod/v4';

export const STATUS_TYPE = {
  BACKLOG: 0,
  UNSTARTED: 1,
  STARTED: 2,
  COMPLETED: 3,
  CANCELED: 4,
} as const;
export type StatusType = (typeof STATUS_TYPE)[keyof typeof STATUS_TYPE];
export const statusTypeSchema = z
  .number()
  .int()
  .min(STATUS_TYPE.BACKLOG)
  .max(STATUS_TYPE.CANCELED);
