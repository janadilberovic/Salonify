"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type RegisterRequest = {
  email: string;
  password: string;
  role: number;
  displayName: string;
  salonDescription?: string;
};

export function useRegister() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const register = async (request: RegisterRequest) => {
    try {
      setLoading(true);
      setError("");

      await apiFetch<void>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(request),
      });

      router.push("/login");
    } catch (err) {
      setError("Registracija nije uspela. Proverite podatke.");
    } finally {
      setLoading(false);
    }
  };

  return {
    register,
    loading,
    error,
  };
}