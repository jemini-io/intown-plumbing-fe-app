import { z } from 'zod';
import type { Prisma } from '../../../../lib/generated/prisma';
import { StringFieldUpdateOperationsInputObjectSchema } from './StringFieldUpdateOperationsInput.schema'

export const AppSettingUncheckedUpdateInputObjectSchema: z.ZodType<Prisma.AppSettingUncheckedUpdateInput, Prisma.AppSettingUncheckedUpdateInput> = z.object({
  key: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  value: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional()
}).strict();
export const AppSettingUncheckedUpdateInputObjectZodSchema = z.object({
  key: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  value: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional()
}).strict();
