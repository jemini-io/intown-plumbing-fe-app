import { z } from 'zod';
import type { Prisma } from '../../../../lib/generated/prisma';


export const AppSettingCreateManyInputObjectSchema: z.ZodType<Prisma.AppSettingCreateManyInput, Prisma.AppSettingCreateManyInput> = z.object({
  id: z.number().int().optional(),
  key: z.string(),
  value: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
}).strict();
export const AppSettingCreateManyInputObjectZodSchema = z.object({
  id: z.number().int().optional(),
  key: z.string(),
  value: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
}).strict();
