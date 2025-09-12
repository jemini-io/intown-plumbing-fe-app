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
  const res = await signIn("credentials", {
    redirect,
    email,
    password,
    callbackUrl,
  });

  return res;
}
