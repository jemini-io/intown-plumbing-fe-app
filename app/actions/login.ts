"use client";

import { signIn } from "next-auth/react";

interface LoginParams {
  email: string;
  password: string;
  redirect?: boolean;
  callbackUrl?: string;
}

export async function loginAction({
  email,
  password,
  redirect = false,
  callbackUrl = "/dashboard",
}: LoginParams) {
  try {
    const res = await signIn("credentials", {
      redirect,
      email,
      password,
      callbackUrl,
    });

    // Normalize when signIn returns undefined (happens in some cases)
    if (!res) return { error: "CredentialsSignin" };

    return res;
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : typeof err === "string" ? err : "CredentialsSignin";
    return { error: message };
  }
}
