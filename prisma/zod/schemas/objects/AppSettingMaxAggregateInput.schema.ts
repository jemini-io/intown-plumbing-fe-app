import { z } from 'zod';
import type { Prisma } from '../../../../lib/generated/prisma';


export const AppSettingMaxAggregateInputObjectSchema: z.ZodType<Prisma.AppSettingMaxAggregateInputType, Prisma.AppSettingMaxAggregateInputType> = z.object({
  id: z.literal(true).optional(),
  key: z.literal(true).optional(),
  value: z.literal(true).optional(),
  createdAt: z.literal(true).optional(),
  updatedAt: z.literal(true).optional()
}).strict();
export const AppSettingMaxAggregateInputObjectZodSchema = z.object({
  id: z.literal(true).optional(),
  key: z.literal(true).optional(),
  value: z.literal(true).optional(),
  createdAt: z.literal(true).optional(),
  updatedAt: z.literal(true).optional()
}).strict();
