import { z } from 'zod';
import type { Prisma } from '../../../../lib/generated/prisma';
import { UserSelectObjectSchema } from './UserSelect.schema'

export const UserArgsObjectSchema = z.object({
  select: z.lazy(() => UserSelectObjectSchema).optional()
}).strict();
export const UserArgsObjectZodSchema = z.object({
  select: z.lazy(() => UserSelectObjectSchema).optional()
}).strict();
