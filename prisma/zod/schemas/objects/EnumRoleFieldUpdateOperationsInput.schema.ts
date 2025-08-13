import { z } from 'zod';
import type { Prisma } from '../../../../lib/generated/prisma';
import { RoleSchema } from '../enums/Role.schema'

export const EnumRoleFieldUpdateOperationsInputObjectSchema: z.ZodType<Prisma.EnumRoleFieldUpdateOperationsInput, Prisma.EnumRoleFieldUpdateOperationsInput> = z.object({
  set: RoleSchema.optional()
}).strict();
export const EnumRoleFieldUpdateOperationsInputObjectZodSchema = z.object({
  set: RoleSchema.optional()
}).strict();
