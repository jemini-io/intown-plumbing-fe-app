import { z } from 'zod';
import type { Prisma } from '../../../../lib/generated/prisma';
import { StringWithAggregatesFilterObjectSchema } from './StringWithAggregatesFilter.schema'

export const AppSettingScalarWhereWithAggregatesInputObjectSchema: z.ZodType<Prisma.AppSettingScalarWhereWithAggregatesInput, Prisma.AppSettingScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([z.lazy(() => AppSettingScalarWhereWithAggregatesInputObjectSchema), z.lazy(() => AppSettingScalarWhereWithAggregatesInputObjectSchema).array()]).optional(),
  OR: z.lazy(() => AppSettingScalarWhereWithAggregatesInputObjectSchema).array().optional(),
  NOT: z.union([z.lazy(() => AppSettingScalarWhereWithAggregatesInputObjectSchema), z.lazy(() => AppSettingScalarWhereWithAggregatesInputObjectSchema).array()]).optional(),
  key: z.union([z.lazy(() => StringWithAggregatesFilterObjectSchema), z.string()]).optional(),
  value: z.union([z.lazy(() => StringWithAggregatesFilterObjectSchema), z.string()]).optional()
}).strict();
export const AppSettingScalarWhereWithAggregatesInputObjectZodSchema = z.object({
  AND: z.union([z.lazy(() => AppSettingScalarWhereWithAggregatesInputObjectSchema), z.lazy(() => AppSettingScalarWhereWithAggregatesInputObjectSchema).array()]).optional(),
  OR: z.lazy(() => AppSettingScalarWhereWithAggregatesInputObjectSchema).array().optional(),
  NOT: z.union([z.lazy(() => AppSettingScalarWhereWithAggregatesInputObjectSchema), z.lazy(() => AppSettingScalarWhereWithAggregatesInputObjectSchema).array()]).optional(),
  key: z.union([z.lazy(() => StringWithAggregatesFilterObjectSchema), z.string()]).optional(),
  value: z.union([z.lazy(() => StringWithAggregatesFilterObjectSchema), z.string()]).optional()
}).strict();
