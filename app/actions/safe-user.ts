"use server";

import { createSafeActionClient } from "next-safe-action";
import { revalidatePath } from "next/cache";
import { CreateUserSchema } from "@/lib/schemas/user";
import { prisma } from "@/lib/prisma";

const action = createSafeActionClient({
  handleServerError(e) {
    // map thrown errors to safe messages (don’t leak internals)
    return "Something went wrong";
  },
});

export const safeCreateUser = action(CreateUserSchema, async ({ email, name }) => {
  const user = await prisma.user.create({ data: { email, name } });
  revalidatePath("/users");
  return user; // typed result inferred on client
});
