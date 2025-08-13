import { z } from 'zod';
import { RoleSchema } from '../../enums/Role.schema';
// prettier-ignore
export const UserInputSchema = z.object({
    email: z.string(),
    name: z.string().optional().nullable(),
    role: RoleSchema
}).strict();

export type UserInputType = z.infer<typeof UserInputSchema>;
