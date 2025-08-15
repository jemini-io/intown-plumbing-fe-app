import { z } from 'zod';
import type { Prisma } from '../../../../lib/generated/prisma';
import { SortOrderSchema } from '../enums/SortOrder.schema'

export const UserMaxOrderByAggregateInputObjectSchema: z.ZodType<Prisma.UserMaxOrderByAggregateInput, Prisma.UserMaxOrderByAggregateInput> = z.object({
  id: SortOrderSchema.optional(),
  email: SortOrderSchema.optional(),
  name: SortOrderSchema.optional(),
  role: SortOrderSchema.optional(),
  createdAt: SortOrderSchema.optional(),
  updatedAt: SortOrderSchema.optional()
}).strict();
export const UserMaxOrderByAggregateInputObjectZodSchema = z.object({
  id: SortOrderSchema.optional(),
  email: SortOrderSchema.optional(),
  name: SortOrderSchema.optional(),
  role: SortOrderSchema.optional(),
  createdAt: SortOrderSchema.optional(),
  updatedAt: SortOrderSchema.optional()
}).strict();
