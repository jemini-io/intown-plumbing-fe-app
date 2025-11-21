"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { loginAction } from "../actions/login";
import Image from "next/image";
// import pino from "pino";
import PasswordInput from "@/components/PasswordInput";
import { useTheme } from "../dashboard/contexts/ThemeContext";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

// const logger = pino({ name: "LoginForm" });

const errorMessages: Record<string, string> = {
  CredentialsSignin: "Invalid email or password. Please try again.",
  NotAllowed: "Your account has been temporarily disabled. Please contact the administrator.",
  default: "An unexpected error occurred. Please try again later.",
};

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, toggleTheme } = useTheme();

  const { status, update } = useSession();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  // Capture error from query params and normalize it
  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      setErrorMessage(errorMessages[error] || errorMessages.default);
      router.replace("/login");
    }
  }, [searchParams, router]);

  // Handle form submission with loginAction
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      type LoginSuccess = { ok?: boolean; url?: string };
      type LoginError = { error: string | null };
      const res: LoginSuccess | LoginError = await loginAction({
        email,
        password,
      });

      // signIn returns { ok: true, error: null, url } on success (so check ok)
      if ("ok" in res && (res as LoginSuccess).ok) {
        // console.log("Login successful, updating session...");
        await update();
        const successRes = res as { url?: string };
        router.replace(successRes.url || "/dashboard");
        return;
      }

      // Handle error (res.error may be a string code)
      const errMsg = (res as LoginError).error;
      if (errMsg) {
        setErrorMessage(errorMessages[errMsg] || errMsg || errorMessages.default);
      } else {
        // fallback when signIn returned undefined or unexpected shape
        setErrorMessage(errorMessages.default);
      }
    } catch {
      setErrorMessage(errorMessages.default);
    } finally {
      setIsLoading(false);
    }
  }

  if (status === "loading") {
    return <p className="text-center dark:text-gray-400">Loading...</p>;
  }

  if (status === "authenticated") {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 relative">
      {/* Theme toggle button - top right corner */}
      <button
        type="button"
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      >
        {theme === "light" ? (
          <MoonIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
        ) : (
          <SunIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
        )}
      </button>

      {/* Login card */}
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md dark:shadow-gray-700/50">
        <div className="flex justify-center mb-6">
          <Image
            src="/intown-logo-2023.svg"
            alt="Intown Logo"
            width={100}
            height={100}
            priority
          />
        </div>
        <h1 className="text-2xl font-semibold text-center text-gray-800 dark:text-white mb-6">
          Admin Access
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
          Please enter your admin credentials to continue
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
              required
            />
          </div>

          {/* Password input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Error message */}
          {errorMessage && (
            <p className="text-red-600 dark:text-red-400 text-sm text-center">{errorMessage}</p>
          )}

          {/* Submit button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-gray-800 to-gray-700 dark:from-white dark:to-gray-200 text-white dark:text-gray-900 py-2 rounded-md font-medium shadow-md hover:from-gray-900 hover:to-gray-800 dark:hover:from-gray-100 dark:hover:to-gray-300 transition disabled:from-gray-400 disabled:to-gray-400 dark:disabled:from-gray-600 dark:disabled:to-gray-600"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-8">
          Powered by{" "}
          <a
            href="https://jemini.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:no-underline"
          >
            Jemini.io
          </a>
        </p>
      </div>
    </div>
  );
}
