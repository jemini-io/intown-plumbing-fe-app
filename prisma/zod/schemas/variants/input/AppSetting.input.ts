import { z } from 'zod';
// prettier-ignore
export const AppSettingInputSchema = z.object({
    key: z.string(),
    value: z.string()
}).strict();

export type AppSettingInputType = z.infer<typeof AppSettingInputSchema>;
