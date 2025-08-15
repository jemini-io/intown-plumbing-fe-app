import { z } from 'zod';
import type { Prisma } from '../../../../lib/generated/prisma';
import { SortOrderSchema } from '../enums/SortOrder.schema';
import { AppSettingCountOrderByAggregateInputObjectSchema } from './AppSettingCountOrderByAggregateInput.schema';
import { AppSettingAvgOrderByAggregateInputObjectSchema } from './AppSettingAvgOrderByAggregateInput.schema';
import { AppSettingMaxOrderByAggregateInputObjectSchema } from './AppSettingMaxOrderByAggregateInput.schema';
import { AppSettingMinOrderByAggregateInputObjectSchema } from './AppSettingMinOrderByAggregateInput.schema';
import { AppSettingSumOrderByAggregateInputObjectSchema } from './AppSettingSumOrderByAggregateInput.schema'

export const AppSettingOrderByWithAggregationInputObjectSchema: z.ZodType<Prisma.AppSettingOrderByWithAggregationInput, Prisma.AppSettingOrderByWithAggregationInput> = z.object({
  id: SortOrderSchema.optional(),
  key: SortOrderSchema.optional(),
  value: SortOrderSchema.optional(),
  createdAt: SortOrderSchema.optional(),
  updatedAt: SortOrderSchema.optional(),
  _count: z.lazy(() => AppSettingCountOrderByAggregateInputObjectSchema).optional(),
  _avg: z.lazy(() => AppSettingAvgOrderByAggregateInputObjectSchema).optional(),
  _max: z.lazy(() => AppSettingMaxOrderByAggregateInputObjectSchema).optional(),
  _min: z.lazy(() => AppSettingMinOrderByAggregateInputObjectSchema).optional(),
  _sum: z.lazy(() => AppSettingSumOrderByAggregateInputObjectSchema).optional()
}).strict();
export const AppSettingOrderByWithAggregationInputObjectZodSchema = z.object({
  id: SortOrderSchema.optional(),
  key: SortOrderSchema.optional(),
  value: SortOrderSchema.optional(),
  createdAt: SortOrderSchema.optional(),
  updatedAt: SortOrderSchema.optional(),
  _count: z.lazy(() => AppSettingCountOrderByAggregateInputObjectSchema).optional(),
  _avg: z.lazy(() => AppSettingAvgOrderByAggregateInputObjectSchema).optional(),
  _max: z.lazy(() => AppSettingMaxOrderByAggregateInputObjectSchema).optional(),
  _min: z.lazy(() => AppSettingMinOrderByAggregateInputObjectSchema).optional(),
  _sum: z.lazy(() => AppSettingSumOrderByAggregateInputObjectSchema).optional()
}).strict();
