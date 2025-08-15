import { z } from 'zod';
import type { Prisma } from '../../../../lib/generated/prisma';
import { RoleSchema } from '../enums/Role.schema'

export const UserCreateManyInputObjectSchema: z.ZodType<Prisma.UserCreateManyInput, Prisma.UserCreateManyInput> = z.object({
  id: z.string().optional(),
  email: z.string(),
  name: z.string().optional().nullable(),
  role: RoleSchema.optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
}).strict();
export const UserCreateManyInputObjectZodSchema = z.object({
  id: z.string().optional(),
  email: z.string(),
  name: z.string().optional().nullable(),
  role: RoleSchema.optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
}).strict();
