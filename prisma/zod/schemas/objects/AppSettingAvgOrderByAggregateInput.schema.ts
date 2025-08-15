import { z } from 'zod';
import type { Prisma } from '../../../../lib/generated/prisma';
import { SortOrderSchema } from '../enums/SortOrder.schema'

export const AppSettingAvgOrderByAggregateInputObjectSchema: z.ZodType<Prisma.AppSettingAvgOrderByAggregateInput, Prisma.AppSettingAvgOrderByAggregateInput> = z.object({
  id: SortOrderSchema.optional()
}).strict();
export const AppSettingAvgOrderByAggregateInputObjectZodSchema = z.object({
  id: SortOrderSchema.optional()
}).strict();
