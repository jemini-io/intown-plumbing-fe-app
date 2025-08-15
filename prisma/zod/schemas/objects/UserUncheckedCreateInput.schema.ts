import { z } from 'zod';
import type { Prisma } from '../../../../lib/generated/prisma';
import { RoleSchema } from '../enums/Role.schema'

export const UserUncheckedCreateInputObjectSchema: z.ZodType<Prisma.UserUncheckedCreateInput, Prisma.UserUncheckedCreateInput> = z.object({
  id: z.string().optional(),
  email: z.string(),
  name: z.string().optional().nullable(),
  role: RoleSchema.optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
}).strict();
export const UserUncheckedCreateInputObjectZodSchema = z.object({
  id: z.string().optional(),
  email: z.string(),
  name: z.string().optional().nullable(),
  role: RoleSchema.optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
}).strict();
