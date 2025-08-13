import { z } from 'zod';
import type { Prisma } from '../../../../lib/generated/prisma';


export const AppSettingCreateInputObjectSchema: z.ZodType<Prisma.AppSettingCreateInput, Prisma.AppSettingCreateInput> = z.object({
  key: z.string(),
  value: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
}).strict();
export const AppSettingCreateInputObjectZodSchema = z.object({
  key: z.string(),
  value: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
}).strict();
