import { z } from 'zod';
export const AppSettingFindFirstResultSchema = z.nullable(z.object({
  id: z.number().int(),
  key: z.string(),
  value: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
}));