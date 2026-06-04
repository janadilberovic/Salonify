"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SalonCard from "../components/SalonCard";
import { EyebrowLabel } from "../components/ui";
import {
  SearchIcon,
  MapPinIcon,
  SparkleIcon,
  ChevronRightIcon,
} from "../components/Icons";
import { searchSalons, getAllSalons } from "@/services/salon";
import { getAverageReviewsForSalon } from "@/services/reviews";
import PrettyDatePicker from "../components/PrettyDatePicker";
import PrettyTimePicker from "../components/PrettyTimePicker";
import PrettyCitySelect from "../components/PrettyCitySelect";

const SORTS = ["Najpopularnije", "Najbolje ocenjeni", "Najnoviji"];
const SALONS_PER_PAGE = 6;

const SERVICE_TYPES = [
  { value: "Haircut", label: "Šišanje" },
  { value: "Coloring", label: "Farbanje" },
  { value: "Styling", label: "Stilizovanje" },
  { value: "Manicure", label: "Manikir" },
  { value: "Pedicure", label: "Pedikir" },
  { value: "Makeup", label: "Šminkanje" },
  { value: "Massage", label: "Masaža" },
  { value: "Facial", label: "Tretman lica" },
  { value: "Waxing", label: "Depilacija" },
  { value: "SpaTreatment", label: "Spa tretman" },
  { value: "NailArt", label: "Ukrašavanje noktiju" },
  { value: "Other", label: "Ostalo" },
];

function getTodayDateOnlyString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function SalonsPage() {
  const resultsRef = useRef<HTMLElement | null>(null);
  const [salons, setSalons] = useState<any[]>([]);
  const [filteredSalons, setFilteredSalons] = useState<any[]>([]);
  const [salonRatings, setSalonRatings] = useState<Record<string, number>>({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [query, setQuery] = useState("");
  const [city, setCity] = useState<string | null>(null);
  const [serviceType, setServiceType] = useState<string | null>(null);

  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);

  const [sort, setSort] = useState(SORTS[0]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [openNow, setOpenNow] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageDirection, setPageDirection] = useState<"next" | "prev">("next");

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    loadAllSalons();
  }, []);

  useEffect(() => {
    // Ako korisnik nije prijavljen i pokušava da koristi filtere (osim city i query), zabrani
    if (!isLoggedIn && (serviceType || minPrice !== null || maxPrice !== null || date !== null || time !== null)) {
      // Resetuj filtere
      setServiceType(null);
      setMinPrice(null);
      setMaxPrice(null);
      setDate(null);
      setTime(null);
      setOpenNow(false);
      return;
    }

    performSearch();
  }, [city, serviceType, minPrice, maxPrice, date, time, openNow, isLoggedIn]);

  async function loadAllSalons() {
    try {
      setLoading(true);

      const data = await getAllSalons();

      setSalons(data);
      setFilteredSalons(data);
      loadSalonRatings(data);
    } catch (error) {
      console.error("Greška pri učitavanju salona:", error);
    } finally {
      setLoading(false);
    }
  }

  async function performSearch() {
    if (
      !city &&
      !serviceType &&
      minPrice === null &&
      maxPrice === null &&
      date === null &&
      time === null &&
      !openNow
    ) {
      setFilteredSalons(salons);
      return;
    }

    try {
      setSearching(true);

      const results = await searchSalons({
        city: city || undefined,
        serviceType: serviceType || undefined,
        minPrice: minPrice !== null ? minPrice : undefined,
        maxPrice: maxPrice !== null ? maxPrice : undefined,
        date: date || undefined,
        time: time || undefined,
      });

      // Filtriranje po "Otvoreno sada" na frontend-u jer API to ne podržava
      let filtered = results;
      if (openNow) {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTime = currentHour * 60 + currentMinute;

        filtered = results.filter((salon: any) => {
          if (!salon.openingHours || salon.openingHours.length === 0) {
            return false;
          }

          const dayOfWeek = now.getDay();
          // Map JS day (0=Sunday) to API format
          const dayMap = [0, 1, 2, 3, 4, 5, 6];
          const apiDay = dayMap[dayOfWeek];

          const todayHours = salon.openingHours.find(
            (h: any) =>
              Number(h.day) === apiDay ||
              h.day === String(apiDay) ||
              (dayOfWeek === 0 && h.day === "0")
          );

          if (!todayHours || todayHours.closed) {
            return false;
          }

          // Parse hours (format: "09:00 - 17:00" or "09:00-17:00")
          const timeParts = todayHours.hours.includes(" - ")
            ? todayHours.hours.split(" - ")
            : todayHours.hours.split("-").map((t: string) => t.trim());

          if (timeParts.length < 2) {
            return false;
          }

          const [startHour, startMinute] = timeParts[0].split(":").map(Number);
          const [endHour, endMinute] = timeParts[1].split(":").map(Number);

          const startTime = startHour * 60 + startMinute;
          const endTime = endHour * 60 + endMinute;

          return currentTime >= startTime && currentTime < endTime;
        });
      }

      setFilteredSalons(filtered);
      loadSalonRatings(filtered);
    } catch (error) {
      console.error("Greška pri pretrazi:", error);
      setFilteredSalons([]);
    } finally {
      setSearching(false);
    }
  }

  function clearFilters() {
    setCity(null);
    setServiceType(null);
    setMinPrice(null);
    setMaxPrice(null);
    setDate(null);
    setOpenNow(false);
    setTime(null);
  }

  async function loadSalonRatings(list: any[]) {
    const uniqueSalons = Array.from(
      new Map(
        list
          .filter((salon) => salon?.id)
          .map((salon) => [salon.id, salon]),
      ).values(),
    );

    if (uniqueSalons.length === 0) return;

    const ratings = await Promise.all(
      uniqueSalons.map(async (salon: any) => {
        try {
          const rating = await getAverageReviewsForSalon(salon.id);
          return [salon.id, rating ?? 0] as const;
        } catch {
          return [salon.id, 0] as const;
        }
      }),
    );

    setSalonRatings((prev) => ({
      ...prev,
      ...Object.fromEntries(ratings),
    }));
  }

  const cities = useMemo(() => {
    return Array.from(
      new Set(salons.map((s) => s.city).filter(Boolean)),
    ).sort();
  }, [salons]);

  const sorted = useMemo(() => {
    let list = [...filteredSalons];

    if (query.trim()) {
      const q = query.trim().toLowerCase();

      list = list.filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.city?.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q),
      );
    }

    if (sort === "Najbolje ocenjeni") {
      list = list.sort(
        (a, b) =>
          (salonRatings[b.id] ?? b.rating ?? 0) -
          (salonRatings[a.id] ?? a.rating ?? 0),
      );
    }

    if (sort === "Najnoviji") {
      list = list.reverse();
    }

    return list;
  }, [filteredSalons, sort, query, salonRatings]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / SALONS_PER_PAGE));
  const visibleSalons = sorted.slice(
    currentPage * SALONS_PER_PAGE,
    currentPage * SALONS_PER_PAGE + SALONS_PER_PAGE,
  );

  useEffect(() => {
    setCurrentPage(0);
    setPageDirection("next");
  }, [query, city, serviceType, minPrice, maxPrice, date, time, openNow, sort]);

  useEffect(() => {
    if (currentPage >= pageCount) {
      setCurrentPage(pageCount - 1);
    }
  }, [currentPage, pageCount]);

  function goToPage(page: number) {
    if (page < 0 || page >= pageCount || page === currentPage) return;

    setPageDirection(page > currentPage ? "next" : "prev");
    setCurrentPage(page);
    scrollToResults();
  }

  function scrollToResults() {
    const top = resultsRef.current
      ? resultsRef.current.getBoundingClientRect().top + window.scrollY - 96
      : 0;

    window.scrollTo({
      top: Math.max(top, 0),
      behavior: "smooth",
    });
  }

  const hasActiveFilters =
    city ||
    serviceType ||
    minPrice !== null ||
    maxPrice !== null ||
    date !== null ||
    time !== null ||
    openNow;

  const activeMoreFiltersCount = [
    minPrice !== null,
    maxPrice !== null,
    date !== null,
    time !== null,
  ].filter(Boolean).length;

  return (
    <>
      <Navbar />

      <section className="relative z-30 mx-auto max-w-7xl px-6 lg:px-10 pt-10 lg:pt-14">
        <div className="relative  rounded-[2.5rem] p-8 sm:p-12 bg-gradient-to-br from-white via-[#fdf0f7] to-[#f4e6f7] border border-white/80 shadow-softer">
          <div className="absolute -top-16 -right-16 size-64 rounded-full bg-primary-soft blur-3xl" />
          <div className="absolute -bottom-20 -left-20 size-64 rounded-full bg-accent-soft blur-3xl" />

          <div className="relative">
            <EyebrowLabel>Saloni</EyebrowLabel>

            <h1 className="font-display mt-4 text-4xl sm:text-5xl font-semibold tracking-tight">
              Pronađi salon za svoj{" "}
              <span className="italic text-primary">sledeći termin</span>.
            </h1>

            <p className="mt-3 text-muted max-w-xl">
              Pretraži salone po nazivu, gradu, usluzi, ceni i slobodnom
              vremenu.
            </p>

            {/* SEARCH BAR */}
            <div className="mt-8 bg-white rounded-3xl shadow-soft border border-[var(--border)] p-3 flex flex-col md:flex-row gap-2">
              <div className="flex items-center gap-2 flex-1 px-4">
                <SearchIcon className="text-primary shrink-0" />

                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Pretraži salone..."
                  className="flex-1 bg-transparent h-12 outline-none text-sm placeholder:text-muted-soft"
                />
              </div>

              <div className="h-px md:h-auto md:w-px bg-[var(--border)]" />

              <div className="flex items-center gap-2 flex-1 px-4">
               
                <PrettyCitySelect
                  value={city}
                  cities={cities}
                  onChange={setCity}
                />
              </div>
            </div>

            {/* FILTERS */}
            <div className="mt-6">
              {!isLoggedIn && (
                <div className="mb-4 rounded-2xl bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-700">
                  <p className="font-semibold mb-1">Prijavite se da koristite napredne filtere</p>
                  <p>Možete pretraživati po gradu, ali za korišćenje ostalih filtere (datum, vreme, cena, usluga), morate biti prijavljeni.</p>
                </div>
              )}

              <div className="flex items-center justify-between gap-4 mb-3">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Tip usluge
                </label>

                <div className="flex items-center gap-2">
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="hidden sm:inline-flex text-xs font-semibold px-4 py-2 rounded-full border border-[var(--border)] bg-white text-muted transition hover:border-primary hover:text-primary"
                    >
                      Obriši filtere
                    </button>
                  )}
                  <button
  type="button"
  onClick={() => {
    if (!isLoggedIn) return;
    const nextValue = !openNow;

    setOpenNow(nextValue);

    if (nextValue) {
      setDate(getTodayDateOnlyString());
      setTime(getCurrentTimeString());
    } else {
      setDate(null);
      setTime(null);
    }
  }}
  disabled={!isLoggedIn}
  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold shadow-sm transition ${
    !isLoggedIn
      ? "opacity-50 cursor-not-allowed bg-gray-100 border-gray-300 text-gray-500"
      : openNow
        ? "bg-primary text-white border-primary"
        : "bg-white text-muted border-[var(--border)] hover:border-primary hover:text-primary"
  }`}
  title={!isLoggedIn ? "Prijavite se da koristite ovaj filter" : ""}
>
  <span
    className={`size-2 rounded-full ${
      openNow ? "bg-white" : "bg-green-500"
    }`}
  />
  Otvoreno sada
</button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!isLoggedIn) return;
                      setShowMoreFilters((prev) => !prev);
                    }}
                    disabled={!isLoggedIn}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold shadow-sm transition ${
                      !isLoggedIn
                        ? "opacity-50 cursor-not-allowed bg-gray-100 border-gray-300 text-gray-500"
                        : "bg-white border-[var(--border)] hover:border-primary hover:text-primary"
                    }`}
                    title={!isLoggedIn ? "Prijavite se da koristite ovaj filter" : ""}
                  >
                    Još filtera
                    {activeMoreFiltersCount > 0 && (
                      <span className="inline-flex size-5 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                        {activeMoreFiltersCount}
                      </span>
                    )}
                    <span
                      className={`text-sm transition-transform ${
                        showMoreFilters ? "rotate-180" : ""
                      }`}
                    >
                      ↓
                    </span>
                  </button>
                </div>
              </div>

              {/* SERVICE CHIPS */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!isLoggedIn) return;
                    setServiceType(null);
                  }}
                  disabled={!isLoggedIn}
                  className={`text-xs font-medium px-3.5 py-2 rounded-full border transition ${
                    !isLoggedIn
                      ? "opacity-50 cursor-not-allowed bg-gray-100 border-gray-300 text-gray-500"
                      : !serviceType
                        ? "bg-primary text-white border-primary shadow-soft"
                        : "bg-white border-[var(--border)] hover:border-primary hover:text-primary"
                  }`}
                  title={!isLoggedIn ? "Prijavite se da koristite ovaj filter" : ""}
                >
                  Sve usluge
                </button>

                {SERVICE_TYPES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => {
                      if (!isLoggedIn) return;
                      setServiceType(s.value === serviceType ? null : s.value);
                    }}
                    disabled={!isLoggedIn}
                    className={`text-xs font-medium px-3.5 py-2 rounded-full border transition ${
                      !isLoggedIn
                        ? "opacity-50 cursor-not-allowed bg-gray-100 border-gray-300 text-gray-500"
                        : serviceType === s.value
                          ? "bg-primary text-white border-primary shadow-soft"
                          : "bg-white border-[var(--border)] hover:border-primary hover:text-primary"
                    }`}
                    title={!isLoggedIn ? "Prijavite se da koristite ovaj filter" : ""}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* MORE FILTERS DROPDOWN */}
              {showMoreFilters && (
                <div className="mt-5 rounded-[2rem] border border-white/80 bg-white/75 p-5 shadow-soft backdrop-blur">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-muted mb-2 block">
                        Min cena
                      </label>

                      <input
                        type="number"
                        value={minPrice ?? ""}
                        onChange={(e) => {
                          if (!isLoggedIn) return;
                          setMinPrice(
                            e.target.value ? Number(e.target.value) : null,
                          );
                        }}
                        disabled={!isLoggedIn}
                        placeholder="npr. 1000"
                        className={`w-full h-11 px-4 rounded-2xl bg-white border outline-none text-sm ${
                          !isLoggedIn
                            ? "opacity-50 cursor-not-allowed bg-gray-100 border-gray-300"
                            : "border-[var(--border)] focus:border-primary"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-muted mb-2 block">
                        Max cena
                      </label>

                      <input
                        type="number"
                        value={maxPrice ?? ""}
                        onChange={(e) => {
                          if (!isLoggedIn) return;
                          setMaxPrice(
                            e.target.value ? Number(e.target.value) : null,
                          );
                        }}
                        disabled={!isLoggedIn}
                        placeholder="npr. 5000"
                        className={`w-full h-11 px-4 rounded-2xl bg-white border outline-none text-sm ${
                          !isLoggedIn
                            ? "opacity-50 cursor-not-allowed bg-gray-100 border-gray-300"
                            : "border-[var(--border)] focus:border-primary"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-muted mb-2 block">
                        Datum
                      </label>

                      <div className={!isLoggedIn ? "opacity-50 pointer-events-none" : ""}>
                        <PrettyDatePicker
                          value={date ?? ""}
                          onChange={(value) => {
                            if (!isLoggedIn) return;
                            setDate(value || null);
                            setOpenNow(false);
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-muted mb-2 block">
                        Vreme
                      </label>

                      <div className={!isLoggedIn ? "opacity-50 pointer-events-none" : ""}>
                        <PrettyTimePicker
                          value={time ?? ""}
                          onChange={(value) => {
                            if (!isLoggedIn) return;
                            setTime(value || null);
                            setOpenNow(false);
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <p className="text-xs text-muted">
                      Izaberi datum i vreme samo ako želiš da vidiš salone koji
                      rade u tom terminu.
                    </p>

                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="sm:hidden text-xs font-semibold px-4 py-2 rounded-full border border-[var(--border)] bg-white text-muted transition hover:border-primary hover:text-primary"
                      >
                        Obriši filtere
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section
        ref={resultsRef}
        className="relative z-10 mx-auto max-w-7xl px-6 lg:px-10 mt-10"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <p className="text-sm text-muted">
            Pronađeno{" "}
            <span className="font-semibold text-foreground">
              {sorted.length}
            </span>{" "}
            salona
          </p>

          <div className="flex items-center gap-2 flex-wrap">
            {SORTS.map((s) => (
              <button
                key={s}
                type="button"
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

        {loading || searching ? (
          <p className="text-muted">Učitavanje salona...</p>
        ) : sorted.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div
              key={currentPage}
              className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ${
                pageDirection === "next"
                  ? "salon-page-enter-next"
                  : "salon-page-enter-prev"
              }`}
            >
              {visibleSalons.map((s, i) => (
                <SalonCard
                  key={s.id}
                  salon={s}
                  featured={currentPage === 0 && i === 0}
                />
              ))}
            </div>

            {pageCount > 1 && (
              <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
                <p className="text-sm text-muted">
                  Prikazano{" "}
                  <span className="font-semibold text-foreground">
                    {currentPage * SALONS_PER_PAGE + 1}-
                    {Math.min(
                      currentPage * SALONS_PER_PAGE + visibleSalons.length,
                      sorted.length,
                    )}
                  </span>{" "}
                  od {sorted.length}
                </p>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 0}
                    aria-label="Prethodna strana"
                    className="grid size-10 place-items-center rounded-full border border-[var(--border)] bg-white text-muted shadow-softer transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <ChevronRightIcon
                      width={18}
                      height={18}
                      className="rotate-180"
                    />
                  </button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: pageCount }).map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => goToPage(index)}
                        aria-label={`Strana ${index + 1}`}
                        className={`h-2.5 rounded-full transition-all ${
                          currentPage === index
                            ? "w-8 bg-primary"
                            : "w-2.5 bg-primary-soft hover:bg-primary/50"
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === pageCount - 1}
                    aria-label="Sledeća strana"
                    className="grid size-10 place-items-center rounded-full border border-[var(--border)] bg-white text-muted shadow-softer transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <ChevronRightIcon width={18} height={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-6 lg:px-10 mt-20">
        <div className="relative rounded-[2rem] bg-white border border-[var(--border)] shadow-softer p-8 sm:p-10 grid md:grid-cols-[1.2fr_1fr] gap-8 items-center overflow-hidden">
          <div className="absolute -top-16 -right-10 size-56 rounded-full bg-primary-soft blur-3xl" />

          <div className="relative">
            <EyebrowLabel>Za salone</EyebrowLabel>

            <h2 className="font-display mt-3 text-3xl font-semibold">
              Želiš da tvoj salon bude vidljiv?
            </h2>

            <p className="mt-3 text-muted max-w-md">
              Kreiraj profil salona, dodaj usluge, radno vreme i fotografije,
              kako bi korisnici mogli lakše da te pronađu i zakažu termin.
            </p>
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
        Nema pronađenih salona.
      </h3>

      <p className="mt-2 text-sm text-muted max-w-md mx-auto">
        Pokušaj sa drugim filtrima ili nazivom salona.
      </p>
    </div>
  );
}


function getCurrentTimeString() {
  const now = new Date();

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}
