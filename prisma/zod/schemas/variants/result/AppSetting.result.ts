import { z } from 'zod';
// prettier-ignore
export const AppSettingResultSchema = z.object({
    id: z.number().int(),
    key: z.string(),
    value: z.string(),
    createdAt: z.date(),
    updatedAt: z.date()
}).strict();

export type AppSettingResultType = z.infer<typeof AppSettingResultSchema>;
