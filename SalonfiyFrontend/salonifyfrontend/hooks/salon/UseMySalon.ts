"use client";

import { useEffect, useState } from "react";
import { getMySalon } from "@/services/salon";
import { SalonApi } from "@/types/Salon";
import { Salon } from "@/app/lib/data";

export function useMySalon() {
const [salon, setSalon] = useState<Salon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSalon() {
      try {
        const data = await getMySalon();
        setSalon(data);
      } catch (err) {
        setError("Ne mogu da učitam podatke salona.");
      } finally {
        setLoading(false);
      }
    }

    loadSalon();
  }, []);

  return { salon, loading, error };
}