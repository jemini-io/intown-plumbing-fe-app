import { z } from 'zod';
import type { Prisma } from '../../../../lib/generated/prisma';


export const UserWhereUniqueInputObjectSchema: z.ZodType<Prisma.UserWhereUniqueInput, Prisma.UserWhereUniqueInput> = z.object({
  id: z.string(),
  email: z.string()
}).strict();
export const UserWhereUniqueInputObjectZodSchema = z.object({
  id: z.string(),
  email: z.string()
}).strict();
