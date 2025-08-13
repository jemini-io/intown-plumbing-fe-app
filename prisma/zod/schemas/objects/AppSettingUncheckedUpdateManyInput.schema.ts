import { z } from 'zod';
import type { Prisma } from '../../../../lib/generated/prisma';
import { StringFieldUpdateOperationsInputObjectSchema } from './StringFieldUpdateOperationsInput.schema'

export const AppSettingUncheckedUpdateManyInputObjectSchema: z.ZodType<Prisma.AppSettingUncheckedUpdateManyInput, Prisma.AppSettingUncheckedUpdateManyInput> = z.object({
  key: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  value: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional()
}).strict();
export const AppSettingUncheckedUpdateManyInputObjectZodSchema = z.object({
  key: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  value: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional()
}).strict();
