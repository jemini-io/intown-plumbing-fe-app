"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import pino from 'pino';

const logger = pino({ name: "LoginPage" });

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const text = await res.text();
      logger.info({ response: text }, "🔹 Login API: received response:");

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Respuesta no es JSON válido");
      }

      if (res.ok && data.success) {
        router.push("/admin/settings");
      } else {
        setError(data.error || "Wrong User or password");
      }
    } catch (err) {
      logger.error(err, "💥 Error in login submission:");
      setError("Something went wrong. Try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Login</h1>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-1 w-full"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-1 w-full"
          required
        />
        {error && <p className="text-red-600">{error}</p>}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
