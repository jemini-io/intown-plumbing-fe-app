import { z } from 'zod';
export const AppSettingUpsertResultSchema = z.object({
  id: z.number().int(),
  key: z.string(),
  value: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
});