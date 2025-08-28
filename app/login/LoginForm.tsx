"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import pino from "pino";

const logger = pino({ name: "LoginForm" });

const errorMessages: Record<string, string> = {
  CredentialsSignin: "Invalid email or password. Please try again.",
  default: "An unexpected error occurred. Please try again later.",
};

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: session, status } = useSession();
  logger.info(session, "Current session:");

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/admin");
    }
  }, [status, router]);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      setErrorMessage(errorMessages[error] || errorMessages.default);
      router.replace("/login");
    }
  }, [searchParams, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl: "/admin",
      });

      logger.info(res, "SignIn response:");

      if (res?.ok) {
        router.push(res.url || "/admin");
      } else if (res?.error) {
        router.push(`/login?error=${res.error}`);
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
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Login</h1>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-1 w-full"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-1 w-full"
          required
        />

        {errorMessage && (
          <p className="text-red-600 text-sm">{errorMessage}</p>
        )}

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
