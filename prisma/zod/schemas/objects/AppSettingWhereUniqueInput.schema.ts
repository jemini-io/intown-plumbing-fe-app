import { z } from 'zod';
import type { Prisma } from '../../../../lib/generated/prisma';


export const AppSettingWhereUniqueInputObjectSchema: z.ZodType<Prisma.AppSettingWhereUniqueInput, Prisma.AppSettingWhereUniqueInput> = z.object({
  id: z.number().int(),
  key: z.string()
}).strict();
export const AppSettingWhereUniqueInputObjectZodSchema = z.object({
  id: z.number().int(),
  key: z.string()
}).strict();
