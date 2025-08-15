import { z } from 'zod';
import type { Prisma } from '../../../../lib/generated/prisma';
import { StringFieldUpdateOperationsInputObjectSchema } from './StringFieldUpdateOperationsInput.schema'

export const AppSettingUpdateManyMutationInputObjectSchema: z.ZodType<Prisma.AppSettingUpdateManyMutationInput, Prisma.AppSettingUpdateManyMutationInput> = z.object({
  key: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  value: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional()
}).strict();
export const AppSettingUpdateManyMutationInputObjectZodSchema = z.object({
  key: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  value: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional()
}).strict();
