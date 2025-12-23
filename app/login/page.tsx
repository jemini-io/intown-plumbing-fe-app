import { Suspense } from "react";
import LoginForm from "./LoginForm";
import { ThemeProvider } from "../dashboard/contexts/ThemeContext";

export default function LoginPage() {
  return (
    <ThemeProvider>
      <Suspense fallback={<p className="text-center dark:text-gray-400">Loading...</p>}>
        <LoginForm />
      </Suspense>
    </ThemeProvider>
  );
}
