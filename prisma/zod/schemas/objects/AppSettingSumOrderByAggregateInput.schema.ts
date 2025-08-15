import { z } from 'zod';
import type { Prisma } from '../../../../lib/generated/prisma';
import { SortOrderSchema } from '../enums/SortOrder.schema'

export const AppSettingSumOrderByAggregateInputObjectSchema: z.ZodType<Prisma.AppSettingSumOrderByAggregateInput, Prisma.AppSettingSumOrderByAggregateInput> = z.object({
  id: SortOrderSchema.optional()
}).strict();
export const AppSettingSumOrderByAggregateInputObjectZodSchema = z.object({
  id: SortOrderSchema.optional()
}).strict();
