import { z } from 'zod';
import type { Prisma } from '../../../../lib/generated/prisma';
import { SortOrderSchema } from '../enums/SortOrder.schema';
import { NullsOrderSchema } from '../enums/NullsOrder.schema'

export const SortOrderInputObjectSchema: z.ZodType<Prisma.SortOrderInput, Prisma.SortOrderInput> = z.object({
  sort: SortOrderSchema,
  nulls: NullsOrderSchema.optional()
}).strict();
export const SortOrderInputObjectZodSchema = z.object({
  sort: SortOrderSchema,
  nulls: NullsOrderSchema.optional()
}).strict();
