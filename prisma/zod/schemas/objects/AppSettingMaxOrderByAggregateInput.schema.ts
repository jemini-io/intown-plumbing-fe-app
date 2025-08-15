import { z } from 'zod';
import type { Prisma } from '../../../../lib/generated/prisma';
import { SortOrderSchema } from '../enums/SortOrder.schema'

export const AppSettingMaxOrderByAggregateInputObjectSchema: z.ZodType<Prisma.AppSettingMaxOrderByAggregateInput, Prisma.AppSettingMaxOrderByAggregateInput> = z.object({
  id: SortOrderSchema.optional(),
  key: SortOrderSchema.optional(),
  value: SortOrderSchema.optional(),
  createdAt: SortOrderSchema.optional(),
  updatedAt: SortOrderSchema.optional()
}).strict();
export const AppSettingMaxOrderByAggregateInputObjectZodSchema = z.object({
  id: SortOrderSchema.optional(),
  key: SortOrderSchema.optional(),
  value: SortOrderSchema.optional(),
  createdAt: SortOrderSchema.optional(),
  updatedAt: SortOrderSchema.optional()
}).strict();
