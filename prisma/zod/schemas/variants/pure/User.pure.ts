import { z } from 'zod';
import { RoleSchema } from '../../enums/Role.schema';
// prettier-ignore
export const UserModelSchema = z.object({
    id: z.string(),
    email: z.string(),
    name: z.string().nullable(),
    role: RoleSchema,
    createdAt: z.date(),
    updatedAt: z.date()
}).strict();

export type UserModelType = z.infer<typeof UserModelSchema>;
