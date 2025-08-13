import { z } from 'zod';
import type { Prisma } from '../../../../lib/generated/prisma';


export const AppSettingSelectObjectSchema: z.ZodType<Prisma.AppSettingSelect, Prisma.AppSettingSelect> = z.object({
  id: z.boolean().optional(),
  key: z.boolean().optional(),
  value: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional()
}).strict();
export const AppSettingSelectObjectZodSchema = z.object({
  id: z.boolean().optional(),
  key: z.boolean().optional(),
  value: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional()
}).strict();
