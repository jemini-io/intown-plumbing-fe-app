import { z } from 'zod';
import type { Prisma } from '../../../../lib/generated/prisma';


export const StringFieldUpdateOperationsInputObjectSchema: z.ZodType<Prisma.StringFieldUpdateOperationsInput, Prisma.StringFieldUpdateOperationsInput> = z.object({
  set: z.string().optional()
}).strict();
export const StringFieldUpdateOperationsInputObjectZodSchema = z.object({
  set: z.string().optional()
}).strict();
