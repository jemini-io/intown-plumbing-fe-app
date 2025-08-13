import { z } from 'zod';
import type { Prisma } from '../../../../lib/generated/prisma';
import { AppSettingSelectObjectSchema } from './AppSettingSelect.schema'

export const AppSettingArgsObjectSchema = z.object({
  select: z.lazy(() => AppSettingSelectObjectSchema).optional()
}).strict();
export const AppSettingArgsObjectZodSchema = z.object({
  select: z.lazy(() => AppSettingSelectObjectSchema).optional()
}).strict();
