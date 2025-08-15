import { z } from 'zod';
import type { Prisma } from '../../../../lib/generated/prisma';


export const AppSettingCountAggregateInputObjectSchema: z.ZodType<Prisma.AppSettingCountAggregateInputType, Prisma.AppSettingCountAggregateInputType> = z.object({
  id: z.literal(true).optional(),
  key: z.literal(true).optional(),
  value: z.literal(true).optional(),
  createdAt: z.literal(true).optional(),
  updatedAt: z.literal(true).optional(),
  _all: z.literal(true).optional()
}).strict();
export const AppSettingCountAggregateInputObjectZodSchema = z.object({
  id: z.literal(true).optional(),
  key: z.literal(true).optional(),
  value: z.literal(true).optional(),
  createdAt: z.literal(true).optional(),
  updatedAt: z.literal(true).optional(),
  _all: z.literal(true).optional()
}).strict();
