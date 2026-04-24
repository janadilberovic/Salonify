"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthShell from "../components/AuthShell";
import { Button, Input, Label } from "../components/ui";
import { ArrowRightIcon } from "../components/Icons";
import { apiFetch } from "@/lib/api";

type LoginResponse = {
  token: string;
  role: string;
  displayName: string;
};

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await apiFetch<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      localStorage.setItem("token", response.token);
      localStorage.setItem("role", response.role);
      localStorage.setItem("displayName", response.displayName);
      document.cookie = `token=${response.token}; path=/`;
      document.cookie = `role=${response.role}; path=/`;

      if (response.role === "Salon") {
        router.push("/dashboard");
      } else if (response.role === "Admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch {
      setError("Prijava nije uspela. Proverite email i lozinku.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Dobrodošli nazad"
      subtitle="Prijavite se i nastavite sa zakazivanjem termina."
      footer={
        <>
          Nemaš nalog?{" "}
          <Link
            href="/register"
            className="text-primary font-semibold hover:underline"
          >
            Kreiraj nalog
          </Link>
        </>
      }
    >
      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <Label htmlFor="email">Email adresa</Label>
          <Input
            id="email"
            type="email"
            placeholder="ime@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <Label htmlFor="password">Lozinka</Label>
          <Input
            id="password"
            type="password"
            placeholder="Unesite lozinku"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        <label className="flex items-center gap-2.5 text-sm text-foreground/80">
          <input
            type="checkbox"
            className="size-4 accent-[var(--primary)] rounded"
          />
          Ostani prijavljena
        </label>

        {error && (
          <p className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full mt-2"
          disabled={loading}
        >
          {loading ? "Prijavljivanje..." : "Prijavi se"}
          {!loading && <ArrowRightIcon width={16} height={16} />}
        </Button>
      </form>
    </AuthShell>
  );
}
