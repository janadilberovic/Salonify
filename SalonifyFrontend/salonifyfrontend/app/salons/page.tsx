"use client";

import { useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SalonCard from "../components/SalonCard";
import { EyebrowLabel, Input } from "../components/ui";
import {
  SearchIcon,
  MapPinIcon,
  SparkleIcon,
} from "../components/Icons";
import { SALONS, CITIES, CATEGORIES } from "../lib/data";

const SORTS = ["Most loved", "Highest rated", "Newest", "Price: low → high"];

export default function SalonsPage() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [sort, setSort] = useState(SORTS[0]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = SALONS.filter((s) => {
      if (city && s.city !== city) return false;
      if (category && !s.categories.includes(category)) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.tagline.toLowerCase().includes(q) ||
        s.categories.some((c) => c.toLowerCase().includes(q))
      );
    });
    if (sort === "Highest rated") list = [...list].sort((a, b) => b.rating - a.rating);
    if (sort === "Price: low → high")
      list = [...list].sort((a, b) => a.priceLevel - b.priceLevel);
    return list;
  }, [query, city, category, sort]);

  return (
    <>
      <Navbar />

      {/* HEADER */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 pt-10 lg:pt-14">
        <div className="relative overflow-hidden rounded-[2.5rem] p-8 sm:p-12 bg-gradient-to-br from-white via-[#fdf0f7] to-[#f4e6f7] border border-white/80 shadow-softer">
          <div className="absolute -top-16 -right-16 size-64 rounded-full bg-primary-soft blur-3xl" />
          <div className="absolute -bottom-20 -left-20 size-64 rounded-full bg-accent-soft blur-3xl" />

          <div className="relative">
            <EyebrowLabel>Discover</EyebrowLabel>
            <h1 className="font-display mt-4 text-4xl sm:text-5xl font-semibold tracking-tight">
              Find your next{" "}
              <span className="italic text-primary">signature look</span>.
            </h1>
            <p className="mt-3 text-muted max-w-xl">
              Search by city, service or name. Every salon on Salonify has
              been verified by our team.
            </p>

            {/* Big search pill */}
            <div className="mt-8 bg-white rounded-3xl shadow-soft border border-[var(--border)] p-3 flex flex-col md:flex-row gap-2">
              <div className="flex items-center gap-2 flex-1 px-4">
                <SearchIcon className="text-primary shrink-0" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search salons or services…"
                  className="flex-1 bg-transparent h-12 outline-none text-sm placeholder:text-muted-soft"
                />
              </div>
              <div className="h-px md:h-auto md:w-px bg-[var(--border)]" />
              <div className="flex items-center gap-2 flex-1 px-4">
                <MapPinIcon className="text-primary shrink-0" />
                <select
                  value={city ?? ""}
                  onChange={(e) => setCity(e.target.value || null)}
                  className="flex-1 bg-transparent h-12 outline-none text-sm"
                >
                  <option value="">Any city</option>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category chips */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setCategory(null)}
                className={`text-xs font-medium px-3.5 py-2 rounded-full border transition ${
                  !category
                    ? "bg-primary text-white border-primary shadow-soft"
                    : "bg-white border-[var(--border)] hover:border-primary hover:text-primary"
                }`}
              >
                All services
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c === category ? null : c)}
                  className={`text-xs font-medium px-3.5 py-2 rounded-full border transition ${
                    category === c
                      ? "bg-primary text-white border-primary shadow-soft"
                      : "bg-white border-[var(--border)] hover:border-primary hover:text-primary"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* RESULTS */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 mt-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-sm text-muted">
              <span className="font-semibold text-foreground">
                {filtered.length}
              </span>{" "}
              salons found
              {city && (
                <>
                  {" "}
                  in <span className="font-semibold text-foreground">{city}</span>
                </>
              )}
              {category && (
                <>
                  {" "}
                  for{" "}
                  <span className="font-semibold text-foreground">{category}</span>
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {SORTS.map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={`text-xs font-medium px-3.5 py-2 rounded-full border transition ${
                  sort === s
                    ? "bg-primary-soft border-primary text-[#5a3e8a]"
                    : "bg-white border-[var(--border)] hover:border-primary hover:text-primary"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((s, i) => (
              <SalonCard key={s.id} salon={s} featured={i === 0} />
            ))}
          </div>
        )}
      </section>

      {/* Map placeholder / Inline promo */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 mt-20">
        <div className="relative rounded-[2rem] bg-white border border-[var(--border)] shadow-softer p-8 sm:p-10 grid md:grid-cols-[1.2fr_1fr] gap-8 items-center overflow-hidden">
          <div className="absolute -top-16 -right-10 size-56 rounded-full bg-primary-soft blur-3xl" />
          <div className="relative">
            <EyebrowLabel>Be the first to know</EyebrowLabel>
            <h2 className="font-display mt-3 text-3xl font-semibold">
              New studios, weekly
            </h2>
            <p className="mt-3 text-muted max-w-md">
              Our editors add a handful of new salons every week. Drop your
              email to get a short, pretty round-up.
            </p>
            <form className="mt-6 flex gap-2 max-w-md">
              <Input placeholder="your@email.com" />
              <button className="h-12 px-5 rounded-2xl bg-primary text-white font-medium text-sm hover:bg-primary-hover transition whitespace-nowrap">
                Subscribe
              </button>
            </form>
          </div>
          <div className="relative grid grid-cols-3 gap-3">
            {[
              "from-[#f6dce9] to-[#f3cfe0]",
              "from-[#ecdff7] to-[#ddc8ee]",
              "from-[#f5e2d7] to-[#f0ccbf]",
              "from-[#e3dbf6] to-[#cdc2ea]",
              "from-[#f8d6e5] to-[#f2bcd2]",
              "from-[#e4dff1] to-[#d2cde7]",
            ].map((t, i) => (
              <div
                key={i}
                className={`aspect-square rounded-2xl bg-gradient-to-br ${t} flex items-center justify-center`}
              >
                <SparkleIcon className="text-white/70" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

function EmptyState() {
  return (
    <div className="bg-white rounded-3xl border border-[var(--border)] p-14 text-center shadow-softer">
      <span className="inline-flex items-center justify-center size-16 rounded-full bg-primary-soft text-primary mx-auto">
        <SearchIcon width={26} height={26} />
      </span>
      <h3 className="font-display mt-5 text-2xl font-semibold">
        No salons match — yet.
      </h3>
      <p className="mt-2 text-sm text-muted max-w-md mx-auto">
        Try a different city or relax your filters. Our directory grows every
        week.
      </p>
    </div>
  );
}
