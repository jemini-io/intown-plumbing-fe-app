"use client";

import { useEffect } from "react";
import { logoutAction } from "../actions/logout";

export default function LogoutPage() {
  useEffect(() => {
    logoutAction();
  }, []);

  return null;

//   return (
//     <div className="flex items-center justify-center min-h-screen">
//       <p className="text-lg text-gray-600">Signing you out...</p>
//     </div>
//   );
}
