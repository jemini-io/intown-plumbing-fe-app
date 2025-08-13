import { z } from 'zod';
export const AppSettingCreateManyResultSchema = z.object({
  count: z.number()
});