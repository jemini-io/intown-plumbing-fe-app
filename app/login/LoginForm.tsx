"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { loginAction } from "../actions/login";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import pino from "pino";

const logger = pino({ name: "LoginForm" });

const errorMessages: Record<string, string> = {
  CredentialsSignin: "Invalid email or password. Please try again.",
  default: "An unexpected error occurred. Please try again later.",
};

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: session, status, update } = useSession();
  logger.info(session, "Current session:");

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
      const res = await loginAction({
        email,
        password,
      });

      logger.info(res, "LoginAction response:");

      if (res?.ok) {
        await update();
        router.replace(res.url || "/dashboard");
      } else if (res?.error) {
        router.replace(`/login?error=${res.error}`);
      }
    } catch (err) {
      logger.error(err, "Login error:");
      setErrorMessage(errorMessages.default);
    } finally {
      setIsLoading(false);
    }
  }

  if (status === "loading") {
    return <p className="text-center">Loading...</p>;
  }

  if (status === "authenticated") {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {/* Login card */}
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">
        <div className="flex justify-center mb-6">
          <Image
            src="/intown-logo-2023.svg"
            alt="Intown Logo"
            width={100}
            height={100}
            priority
          />
        </div>
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Admin Access
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Please enter your admin credentials to continue
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Password input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border border-gray-300 p-2 pr-10 w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Error message */}
          {errorMessage && (
            <p className="text-red-600 text-sm text-center">{errorMessage}</p>
          )}

          {/* Submit button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-gray-800 to-gray-700 text-white py-2 rounded-md font-medium shadow-md hover:from-gray-900 hover:to-gray-800 transition disabled:from-gray-400 disabled:to-gray-400"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
