"use client";

import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SalonCard from "../components/SalonCard";
import { EyebrowLabel, LinkButton } from "../components/ui";
import { useEffect, useState } from "react";
import { getAllSalons } from "@/services/salon";

export default function RecommendedPage() {
  const [salons, setSalons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSalons() {
      try {
        setLoading(true);
        const data = await getAllSalons();
        // Sortira po rejting-u i prikaži top 9
        const recommended = data
          .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
          .slice(0, 9);
        setSalons(recommended);
      } catch (error) {
        console.error("Greška pri učitavanju salona:", error);
      } finally {
        setLoading(false);
      }
    }

    loadSalons();
  }, []);

  return (
    <>
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 lg:px-10 pt-10 lg:pt-14">
        <div className="relative rounded-[2.5rem] overflow-hidden p-8 sm:p-12 bg-gradient-to-br from-white via-[#fdf0f7] to-[#f4e6f7] border border-white/80 shadow-softer">
          <div className="absolute -top-20 -right-20 size-72 rounded-full bg-primary-soft blur-3xl" />
          <div className="absolute -bottom-24 -left-20 size-80 rounded-full bg-accent-soft blur-3xl" />

          <div className="relative">
            <EyebrowLabel>Preporučeni za Vas</EyebrowLabel>

            <h1 className="font-display mt-4 text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.03]">
              Saloni koji će Vam se{" "}
              <span className="italic text-primary"> svideti</span>.
            </h1>

            <p className="mt-4 text-muted max-w-xl">
              Otkrijte salone koji su po Vašem ukusu. Pronađite novi omiljeni salon.
            </p>

            <div className="mt-6 flex gap-3">
              <LinkButton href="/salons">
                Svi saloni
              </LinkButton>

              <Link
                href="/reviews"
                className="text-sm font-medium px-6 py-3 rounded-full border border-[var(--border)] hover:border-primary hover:text-primary transition"
              >
                Sve recenzije
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 lg:px-10 mt-10 pb-20">
        {loading ? (
          <div className="text-center py-20">
            <p className="text-muted">Učitavanje preporučenih salona...</p>
          </div>
        ) : salons.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[var(--border)] shadow-softer p-14 text-center">
            <p className="text-muted">Nema dostupnih preporučenih salona.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {salons.map((salon) => (
              <SalonCard key={salon.id} salon={salon} featured={false} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </>
  );
}
