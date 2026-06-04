"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthShell from "../components/AuthShell";
import { Button, Input, Label } from "../components/ui";
import { ArrowRightIcon } from "../components/Icons";
import { apiFetch } from "@/lib/api";
import { getMySalon } from "@/services/salon";
import { Salon } from "../lib/data";

type LoginResponse = {
  token: string;
  role: string;
  displayName: string;
  userId:string;
};

export default function LoginPage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Ako je korisnik već prijavljen, redirekciju ga
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role) {
      if (role === "Salon") {
        redirectSalonAfterLogin(router.push);
      } else if (role === "Admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } else {
      const readyTimer = window.setTimeout(() => setIsReady(true), 0);
      return () => window.clearTimeout(readyTimer);
    }
  }, [router]);

  if (!isReady) {
    return null;
  }

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
      localStorage.setItem("userId", response.userId);
  
      // Setuj cookies sa options za SSR
      document.cookie = `token=${response.token}; path=/; max-age=${60 * 60 * 24 * 30}`; // 30 days
      document.cookie = `role=${response.role}; path=/; max-age=${60 * 60 * 24 * 30}`;

      if (response.role === "Salon") {
        await redirectSalonAfterLogin(router.push);
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

async function redirectSalonAfterLogin(push: (href: string) => void) {
  try {
    const salon = await getMySalon();
    push(isSalonProfileComplete(salon) ? "/dashboard" : "/dashboard/profile?welcome=1");
  } catch {
    push("/dashboard/profile?welcome=1");
  }
}

function isSalonProfileComplete(salon: Salon) {
  return Boolean(
    salon.name?.trim() &&
      salon.description?.trim() &&
      salon.address?.trim() &&
      salon.city?.trim() &&
      salon.phone?.trim() &&
      salon.openingHours.some((day) => !day.closed) &&
      salon.services.length > 0
  );
}
