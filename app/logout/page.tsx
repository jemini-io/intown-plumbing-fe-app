"use client";

import { useEffect } from "react";
import { logoutAction } from "../actions/logout";

export default function LogoutPage() {
  useEffect(() => {
    logoutAction();
  }, []);

  return null;
}
