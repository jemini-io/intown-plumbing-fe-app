import { z } from 'zod';
export const AppSettingDeleteManyResultSchema = z.object({
  count: z.number()
});