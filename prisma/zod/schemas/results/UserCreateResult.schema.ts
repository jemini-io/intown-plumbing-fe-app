import { z } from 'zod';
export const UserCreateResultSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string().optional(),
  role: z.unknown(),
  createdAt: z.date(),
  updatedAt: z.date()
});