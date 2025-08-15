import { z } from 'zod';
import type { Prisma } from '../../../../lib/generated/prisma';
import { StringFilterObjectSchema } from './StringFilter.schema';
import { StringNullableFilterObjectSchema } from './StringNullableFilter.schema';
import { EnumRoleFilterObjectSchema } from './EnumRoleFilter.schema';
import { RoleSchema } from '../enums/Role.schema'

export const UserWhereInputObjectSchema: z.ZodType<Prisma.UserWhereInput, Prisma.UserWhereInput> = z.object({
  AND: z.union([z.lazy(() => UserWhereInputObjectSchema), z.lazy(() => UserWhereInputObjectSchema).array()]).optional(),
  OR: z.lazy(() => UserWhereInputObjectSchema).array().optional(),
  NOT: z.union([z.lazy(() => UserWhereInputObjectSchema), z.lazy(() => UserWhereInputObjectSchema).array()]).optional(),
  email: z.union([z.lazy(() => StringFilterObjectSchema), z.string()]).optional(),
  name: z.union([z.lazy(() => StringNullableFilterObjectSchema), z.string()]).optional().nullable(),
  role: z.union([z.lazy(() => EnumRoleFilterObjectSchema), RoleSchema]).optional()
}).strict();
export const UserWhereInputObjectZodSchema = z.object({
  AND: z.union([z.lazy(() => UserWhereInputObjectSchema), z.lazy(() => UserWhereInputObjectSchema).array()]).optional(),
  OR: z.lazy(() => UserWhereInputObjectSchema).array().optional(),
  NOT: z.union([z.lazy(() => UserWhereInputObjectSchema), z.lazy(() => UserWhereInputObjectSchema).array()]).optional(),
  email: z.union([z.lazy(() => StringFilterObjectSchema), z.string()]).optional(),
  name: z.union([z.lazy(() => StringNullableFilterObjectSchema), z.string()]).optional().nullable(),
  role: z.union([z.lazy(() => EnumRoleFilterObjectSchema), RoleSchema]).optional()
}).strict();
