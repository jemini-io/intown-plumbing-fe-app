import { z } from 'zod';
import type { Prisma } from '../../../../lib/generated/prisma';


export const AppSettingMinAggregateInputObjectSchema: z.ZodType<Prisma.AppSettingMinAggregateInputType, Prisma.AppSettingMinAggregateInputType> = z.object({
  id: z.literal(true).optional(),
  key: z.literal(true).optional(),
  value: z.literal(true).optional(),
  createdAt: z.literal(true).optional(),
  updatedAt: z.literal(true).optional()
}).strict();
export const AppSettingMinAggregateInputObjectZodSchema = z.object({
  id: z.literal(true).optional(),
  key: z.literal(true).optional(),
  value: z.literal(true).optional(),
  createdAt: z.literal(true).optional(),
  updatedAt: z.literal(true).optional()
}).strict();
