import { z } from 'zod';
import type { Prisma } from '../../../../lib/generated/prisma';


export const UserMinAggregateInputObjectSchema: z.ZodType<Prisma.UserMinAggregateInputType, Prisma.UserMinAggregateInputType> = z.object({
  id: z.literal(true).optional(),
  email: z.literal(true).optional(),
  name: z.literal(true).optional(),
  role: z.literal(true).optional(),
  createdAt: z.literal(true).optional(),
  updatedAt: z.literal(true).optional()
}).strict();
export const UserMinAggregateInputObjectZodSchema = z.object({
  id: z.literal(true).optional(),
  email: z.literal(true).optional(),
  name: z.literal(true).optional(),
  role: z.literal(true).optional(),
  createdAt: z.literal(true).optional(),
  updatedAt: z.literal(true).optional()
}).strict();
