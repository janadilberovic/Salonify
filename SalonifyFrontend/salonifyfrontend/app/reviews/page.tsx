"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Rating,
  Avatar,
  EyebrowLabel,
  Button,
  Textarea,
  Label,
  Input,
} from "../components/ui";
import {
  StarIcon,
  StarOutlineIcon,
  SparkleIcon,
  ArrowRightIcon,
  SearchIcon,
} from "../components/Icons";
import { REVIEWS, SALONS } from "../lib/data";
import {
  getAverageReviewsForSalon,
  getReviewsForSalon,
} from "@/services/reviews";
import { Review } from "@/types/Review";
import { getSalonIdByUser } from "@/services/salon";
import { timeAgo } from "./timeAgo";

type PageReview = {
  id: string;
  rating: number;
  body: string;
  author: string;
  service?: string;
  date: string;
  imageUrl?: string;
  salonId?: string;
};

export default function ReviewsPage() {
  const [filter, setFilter] = useState<number | "all">("all");
  const [q, setQ] = useState("");
  const [writeRating, setWriteRating] = useState(5);
  const [hover, setHover] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [ready, setReady] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [salonId, setSalonId] = useState<string | null>(null);

  const [salonReviews, setSalonReviews] = useState<PageReview[]>([]);
  const [salonAvg, setSalonAvg] = useState(0);
  const [loading, setLoading] = useState(false);

  const isSalon = role === "Salon";
  const isUser = role === "User";

  useEffect(() => {
    async function init() {
      const storedRole = localStorage.getItem("role");
      const storedUserId = localStorage.getItem("userId");

      setRole(storedRole);

      if (storedRole === "Salon" && storedUserId) {
        const result = await getSalonIdByUser(storedUserId);
        setSalonId(result.salonId);
      }

      setReady(true);
    }

    init();
  }, []);

  useEffect(() => {
    if (!ready) return;

    console.log("ROLE:", role);
    console.log("IS SALON:", isSalon);
    console.log("SALON ID:", salonId);

    if (!isSalon || !salonId) {
      console.log("PREKINUTO jer nije salon ili nema salonId");
      return;
    }
    const currentSalonId = salonId;

    async function loadSalonReviews() {
      try {
        setLoading(true);

        console.log("POZIVAM RECENZIJE ZA:", salonId);

        const [average, reviewsFromApi] = await Promise.all([
          getAverageReviewsForSalon(currentSalonId),
          getReviewsForSalon(currentSalonId),
        ]);

        console.log("AVG:", average);
        console.log("REVIEWS:", reviewsFromApi);

        const mappedReviews: PageReview[] = reviewsFromApi.map(
          (review: Review) => ({
            id: review.id,
            rating: review.rating,
            body: review.comment,
            author: review.userName ?? "Korisnik",
            service: review.serviceName ?? "Verified client",
            date: review.createdAt,
            imageUrl: review.imageUrl,
          }),
        );

        setSalonAvg(average ?? 0);
        setSalonReviews(mappedReviews);
      } catch (error) {
        console.error("Greška pri učitavanju recenzija:", error);
      } finally {
        setLoading(false);
      }
    }

    loadSalonReviews();
  }, [ready, role, isSalon, salonId]);

  const pageReviews: PageReview[] = isSalon
    ? salonReviews
    : REVIEWS.map((r) => ({
        id: r.id,
        rating: r.rating,
        body: r.body,
        author: r.author,
        service: r.service,
        date: r.date,
        salonId: r.salonId,
      }));

  const { avg, breakdown } = useMemo(() => {
    if (pageReviews.length === 0) {
      return {
        avg: 0,
        breakdown: [5, 4, 3, 2, 1].map((star) => ({
          star,
          n: 0,
          pct: 0,
        })),
      };
    }

    const calculatedAvg = isSalon
      ? salonAvg
      : pageReviews.reduce((s, r) => s + r.rating, 0) / pageReviews.length;

    const breakdown = [5, 4, 3, 2, 1].map((star) => {
      const n = pageReviews.filter((r) => Math.round(r.rating) === star).length;

      return {
        star,
        n,
        pct: (n / pageReviews.length) * 100,
      };
    });

    return {
      avg: calculatedAvg || 0,
      breakdown,
    };
  }, [pageReviews, isSalon, salonAvg]);

const filtered = pageReviews.filter((r) => {
  // 5 & up / 4 & up / 3 & up
  if (filter !== "all" && r.rating < filter) return false;

  const qq = q.trim().toLowerCase();

  if (!qq) return true;

  return (
    r.body.toLowerCase().includes(qq) ||
    r.author.toLowerCase().includes(qq) ||
    r.service?.toLowerCase().includes(qq)
  );
});
  return (
    <>
      <Navbar />

      {/* HEADER */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 pt-10 lg:pt-14">
        <div className="relative rounded-[2.5rem] overflow-hidden p-8 sm:p-12 bg-gradient-to-br from-white via-[#fdf0f7] to-[#f4e6f7] border border-white/80 shadow-softer">
          <div className="absolute -top-20 -right-20 size-72 rounded-full bg-primary-soft blur-3xl" />
          <div className="absolute -bottom-24 -left-20 size-80 rounded-full bg-accent-soft blur-3xl" />

          <div className="relative grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
            <div>
              <EyebrowLabel>
                {isSalon
                  ? "Recenzije salona"
                  : "Realne recenzije, realne posete"}
              </EyebrowLabel>

              <h1 className="font-display mt-4 text-4xl sm:text-6xl font-semibold tracking-tight leading-[1.03]">
                {isSalon ? (
                  <>
                    Šta vaši{" "}
                    <span className="italic text-primary">klijenti</span> kažu o
                    vašem salonu.
                  </>
                ) : (
                  <>
                    Voljena od{" "}
                    <span className="italic text-primary">zajednice</span>{" "}
                    zaljubljenika u negu i lepotu.
                  </>
                )}
              </h1>

              <p className="mt-4 text-muted max-w-xl">
                {isSalon
                  ? "Ovde vidiš sve recenzije koje su korisnici ostavili za tvoj salon — ocene, komentare i utiske nakon posete."
                  : "Sve recenzije na Salonify platformi dolaze nakon potvrđenih termina. Bez lažnih utisaka i preuveličavanja - samo iskrena iskustva zadovoljnih klijenata."}
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-[var(--border)] shadow-soft p-7">
              <div className="flex items-end gap-4">
                <p className="font-display text-7xl font-semibold text-primary leading-none">
                  {avg.toFixed(1)}
                </p>

                <div className="pb-2">
                  <Rating value={avg} size={20} />
                  <p className="text-xs text-muted mt-2">
                    Od ukupno {pageReviews.length} ocena
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                {breakdown.map((b) => (
                  <button
                    key={b.star}
                    onClick={() =>
                      setFilter(filter === b.star ? "all" : b.star)
                    }
                    className={`w-full flex items-center gap-3 text-sm p-1.5 -mx-1.5 rounded-xl transition ${
                      filter === b.star
                        ? "bg-primary-soft/60"
                        : "hover:bg-primary-soft/30"
                    }`}
                  >
                    <span className="w-7 text-muted text-left">{b.star}★</span>

                    <div className="flex-1 h-2 rounded-full bg-[var(--background-soft)] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-[#d7a2ec] rounded-full"
                        style={{ width: `${b.pct}%` }}
                      />
                    </div>

                    <span className="w-8 text-right text-xs text-muted">
                      {b.n}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTROLS */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 mt-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setFilter("all")}
              className={`text-sm font-medium px-4 py-2 rounded-full border transition ${
                filter === "all"
                  ? "bg-primary text-white border-primary shadow-soft"
                  : "bg-white border-[var(--border)] hover:border-primary hover:text-primary"
              }`}
            >
              Sve recenzije
            </button>

            {[5, 4, 3].map((n) => (
              <button
                key={n}
                onClick={() => setFilter(filter === n ? "all" : n)}
                className={`text-sm font-medium px-4 py-2 rounded-full border transition inline-flex items-center gap-1 ${
                  filter === n
                    ? "bg-primary text-white border-primary shadow-soft"
                    : "bg-white border-[var(--border)] hover:border-primary hover:text-primary"
                }`}
              >
                {n} <StarIcon width={12} height={12} />
                {" & up"}
              </button>
            ))}
          </div>

          <div className="relative max-w-sm w-full">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search reviews…"
              className="pl-11"
            />
          </div>
        </div>
      </section>

      {/* GRID */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 mt-6">
        {loading ? (
          <div className="bg-white rounded-3xl border border-[var(--border)] shadow-softer p-14 text-center">
            <p className="text-muted">Učitavanje recenzija...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[var(--border)] shadow-softer p-14 text-center">
            <p className="text-muted">
              {isSalon
                ? "Trenutno nema recenzija za tvoj salon."
                : "Nema recenzija za zadate filtere."}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((r) => {
              const salon = !isSalon
                ? SALONS.find((s) => s.id === r.salonId)
                : null;

              return (
                <div
                  key={r.id}
                  className="bg-white rounded-3xl border border-[var(--border)] shadow-softer p-6 hover-lift flex flex-col"
                >
                  <div className="flex items-center justify-between">
                    <Rating value={r.rating} size={15} />
                    <span className="text-xs text-muted">
                      {timeAgo(r.date)}
                    </span>
                  </div>

                  <p className="mt-4 text-[15px] leading-relaxed text-foreground/85 flex-1">
                    &ldquo;{r.body}&rdquo;
                  </p>

                  <div className="mt-5 pt-5 border-t border-[var(--border)] flex items-center gap-3">
                    <Avatar name={r.author} size={40} />

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate">
                        {r.author}
                      </p>
                      <p className="text-xs text-muted truncate">{r.service}</p>
                    </div>

                    {isSalon && r.imageUrl && (
                      <div className="relative size-10 rounded-xl overflow-hidden shrink-0 border border-[var(--border)]">
                        <img
                          src={r.imageUrl}
                          alt="Review image"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}

                    {!isSalon && salon && (
                      <Link
                        href={`/salons/${salon.slug}`}
                        className="relative size-10 rounded-xl overflow-hidden shrink-0 border border-[var(--border)]"
                        title={salon.name}
                      >
                        <Image
                          src={salon.cover}
                          alt={salon.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* LEAVE A REVIEW - SAMO ZA KORISNIKA */}
      {isUser && (
        <section className="mx-auto max-w-7xl px-6 lg:px-10 mt-20">
          <div className="grid lg:grid-cols-[1fr_1.3fr] gap-6 items-start">
            <div className="bg-white rounded-3xl border border-[var(--border)] shadow-softer p-8">
              <EyebrowLabel>Vaš red!</EyebrowLabel>

              <h2 className="font-display mt-3 text-3xl font-semibold">
                Recite nam Vaše iskustvo!
              </h2>

              <p className="mt-3 text-muted">
                Nekoliko lepih (ili iskrenih) reči pomaže drugim klijentima da
                pronađu svoj sledeći ritual, a salonima da rastu na pravi način.
              </p>

              <div className="mt-6 grid grid-cols-3 gap-2">
                {["Hair", "Nails", "Facial"].map((c) => (
                  <span
                    key={c}
                    className="text-xs text-center font-medium py-2 rounded-full bg-primary-soft/50 text-[#5b3e8a]"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-[var(--border)] shadow-softer p-8">
              {submitted ? (
                <div className="text-center py-10">
                  <span className="inline-flex items-center justify-center size-16 rounded-full bg-success-soft text-[#2f6a51] mx-auto">
                    <SparkleIcon width={26} height={26} />
                  </span>

                  <h3 className="font-display mt-5 text-2xl font-semibold">
                    Hvala Vam✿
                  </h3>

                  <p className="mt-2 text-sm text-muted max-w-sm mx-auto">
                    Vaša recenzija je poslata — biće prikazana nakon kratke
                    provere.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <Label>Koji salon?</Label>

                    <select className="h-12 w-full rounded-2xl border border-[var(--border-strong)] bg-white px-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary-soft/70">
                      {SALONS.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} · {s.city}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label>Vaša ocena</Label>

                    <div className="flex items-center gap-1.5 text-[var(--gold)]">
                      {Array.from({ length: 5 }).map((_, i) => {
                        const v = i + 1;
                        const active = (hover ?? writeRating) >= v;

                        return (
                          <button
                            key={i}
                            type="button"
                            onMouseEnter={() => setHover(v)}
                            onMouseLeave={() => setHover(null)}
                            onClick={() => setWriteRating(v)}
                            className="p-1 transition hover:scale-110"
                          >
                            {active ? (
                              <StarIcon width={32} height={32} />
                            ) : (
                              <StarOutlineIcon
                                width={32}
                                height={32}
                                className="text-[#e6d6bb]"
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <Label>Recite nam kako je proteklo.</Label>

                    <Textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Describe your experience — service, staff, space…"
                      className="min-h-36"
                    />
                  </div>

                  <Button
                    size="lg"
                    className="w-full"
                    onClick={() => setSubmitted(true)}
                    disabled={!text.trim()}
                  >
                    Postavite recenziju
                    <ArrowRightIcon />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </>
  );
}
