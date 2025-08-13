import { z } from 'zod';
// prettier-ignore
export const AppSettingModelSchema = z.object({
    id: z.number().int(),
    key: z.string(),
    value: z.string(),
    createdAt: z.date(),
    updatedAt: z.date()
}).strict();

export type AppSettingModelType = z.infer<typeof AppSettingModelSchema>;
