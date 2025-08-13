import { z } from 'zod';
import type { Prisma } from '../../../../lib/generated/prisma';


export const AppSettingSumAggregateInputObjectSchema: z.ZodType<Prisma.AppSettingSumAggregateInputType, Prisma.AppSettingSumAggregateInputType> = z.object({
  id: z.literal(true).optional()
}).strict();
export const AppSettingSumAggregateInputObjectZodSchema = z.object({
  id: z.literal(true).optional()
}).strict();
