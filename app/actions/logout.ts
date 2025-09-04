"use client";

import { signOut } from "next-auth/react";

export async function logoutAction() {
  await signOut({ callbackUrl: "/login" });
}