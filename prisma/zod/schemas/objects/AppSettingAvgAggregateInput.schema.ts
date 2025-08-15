import { z } from 'zod';
import type { Prisma } from '../../../../lib/generated/prisma';


export const AppSettingAvgAggregateInputObjectSchema: z.ZodType<Prisma.AppSettingAvgAggregateInputType, Prisma.AppSettingAvgAggregateInputType> = z.object({
  id: z.literal(true).optional()
}).strict();
export const AppSettingAvgAggregateInputObjectZodSchema = z.object({
  id: z.literal(true).optional()
}).strict();
