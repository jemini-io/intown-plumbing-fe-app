import { z } from 'zod';
import type { Prisma } from '../../../../lib/generated/prisma';


export const AppSettingUncheckedCreateInputObjectSchema: z.ZodType<Prisma.AppSettingUncheckedCreateInput, Prisma.AppSettingUncheckedCreateInput> = z.object({
  id: z.number().int().optional(),
  key: z.string(),
  value: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
}).strict();
export const AppSettingUncheckedCreateInputObjectZodSchema = z.object({
  id: z.number().int().optional(),
  key: z.string(),
  value: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
}).strict();
