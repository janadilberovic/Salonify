"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type LoginRequest = {
  email: string;
  password: string;
};

type LoginResponse = {
  token: string;
  role: string;
  displayName: string;
};

export function useLogin() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async ({ email, password }: LoginRequest) => {
    try {
      setLoading(true);
      setError("");

      const data = await apiFetch<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("displayName", data.displayName);

      if (data.role === "Salon") {
        router.push("/salon-dashboard");
      } else {
        router.push("/salons");
      }
    } catch (err) {
      setError("Neispravan email ili lozinka.");
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    loading,
    error,
  };
}