import { z } from "zod";

export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
});
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
