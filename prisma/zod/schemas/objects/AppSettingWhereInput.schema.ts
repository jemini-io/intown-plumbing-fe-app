import { z } from 'zod';
import type { Prisma } from '../../../../lib/generated/prisma';
import { StringFilterObjectSchema } from './StringFilter.schema'

export const AppSettingWhereInputObjectSchema: z.ZodType<Prisma.AppSettingWhereInput, Prisma.AppSettingWhereInput> = z.object({
  AND: z.union([z.lazy(() => AppSettingWhereInputObjectSchema), z.lazy(() => AppSettingWhereInputObjectSchema).array()]).optional(),
  OR: z.lazy(() => AppSettingWhereInputObjectSchema).array().optional(),
  NOT: z.union([z.lazy(() => AppSettingWhereInputObjectSchema), z.lazy(() => AppSettingWhereInputObjectSchema).array()]).optional(),
  key: z.union([z.lazy(() => StringFilterObjectSchema), z.string()]).optional(),
  value: z.union([z.lazy(() => StringFilterObjectSchema), z.string()]).optional()
}).strict();
export const AppSettingWhereInputObjectZodSchema = z.object({
  AND: z.union([z.lazy(() => AppSettingWhereInputObjectSchema), z.lazy(() => AppSettingWhereInputObjectSchema).array()]).optional(),
  OR: z.lazy(() => AppSettingWhereInputObjectSchema).array().optional(),
  NOT: z.union([z.lazy(() => AppSettingWhereInputObjectSchema), z.lazy(() => AppSettingWhereInputObjectSchema).array()]).optional(),
  key: z.union([z.lazy(() => StringFilterObjectSchema), z.string()]).optional(),
  value: z.union([z.lazy(() => StringFilterObjectSchema), z.string()]).optional()
}).strict();
