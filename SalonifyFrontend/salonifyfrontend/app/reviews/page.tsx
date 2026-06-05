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
  SalonCover,
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

type GetSalonIdByUserResponse =
  | string
  | {
      salonId?: string;
      id?: string;
    };

const NAME_IDENTIFIER_CLAIM =
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";

function getUserIdFromToken(): string | null {
  const token = localStorage.getItem("token");

  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));

    return payload[NAME_IDENTIFIER_CLAIM] ?? null;
  } catch (error) {
    console.error("Greška pri čitanju userId iz tokena:", error);
    return null;
  }
}

function isValidMongoId(value: string | null | undefined): value is string {
  return Boolean(
    value &&
    value !== "undefined" &&
    value !== "null" &&
    /^[a-fA-F0-9]{24}$/.test(value),
  );
}

function resolveSalonId(result: GetSalonIdByUserResponse): string | null {
  if (typeof result === "string") {
    return isValidMongoId(result) ? result : null;
  }

  if (isValidMongoId(result?.salonId)) {
    return result.salonId;
  }

  if (isValidMongoId(result?.id)) {
    return result.id;
  }

  return null;
}

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
      try {
        const storedRole = localStorage.getItem("role");
        const storedUserId = localStorage.getItem("userId");
        const tokenUserId = getUserIdFromToken();

        const userId = isValidMongoId(storedUserId)
          ? storedUserId
          : tokenUserId;

        setRole(storedRole);

        if (storedRole !== "Salon") {
          return;
        }

        if (!isValidMongoId(userId)) {
          console.error("UserId nije validan ili ne postoji:", {
            storedUserId,
            tokenUserId,
          });

          localStorage.removeItem("userId");
          return;
        }

        const result = (await getSalonIdByUser(
          userId,
        )) as GetSalonIdByUserResponse;

        const resolvedSalonId = resolveSalonId(result);

        if (!resolvedSalonId) {
          console.error("SalonId nije validan:", result);
          return;
        }

        setSalonId(resolvedSalonId);
      } catch (error) {
        console.error("Greška pri inicijalizaciji reviews stranice:", error);
      } finally {
        setReady(true);
      }
    }

    init();
  }, []);

  useEffect(() => {
    if (!ready) return;

    if (!isSalon || !salonId) {
      return;
    }

    async function loadSalonReviews() {
      try {
        setLoading(true);

        const currentSalonId = salonId;

        if (!currentSalonId) {
          return;
        }

        const [average, reviewsFromApi] = await Promise.all([
          getAverageReviewsForSalon(currentSalonId),
          getReviewsForSalon(currentSalonId),
        ]);

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
  }, [ready, isSalon, salonId]);

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
        pct: pageReviews.length ? (n / pageReviews.length) * 100 : 0,
      };
    });

    return {
      avg: calculatedAvg || 0,
      breakdown,
    };
  }, [pageReviews, isSalon, salonAvg]);

  const filtered = pageReviews.filter((r) => {
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
      <section className="mx-auto max-w-7xl px-6 pt-10 lg:px-10 lg:pt-14">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/80 bg-gradient-to-br from-white via-[#fdf0f7] to-[#f4e6f7] p-8 shadow-softer sm:p-12">
          <div className="absolute -right-20 -top-20 size-72 rounded-full bg-primary-soft blur-3xl" />
          <div className="absolute -bottom-24 -left-20 size-80 rounded-full bg-accent-soft blur-3xl" />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <EyebrowLabel>
                {isSalon
                  ? "Recenzije salona"
                  : "Realne recenzije, realne posete"}
              </EyebrowLabel>

              <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.03] tracking-tight sm:text-6xl">
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

              <p className="mt-4 max-w-xl text-muted">
                {isSalon
                  ? "Ovde vidiš sve recenzije koje su korisnici ostavili za tvoj salon — ocene, komentare i utiske nakon posete."
                  : "Sve recenzije na Salonify platformi dolaze nakon potvrđenih termina. Bez lažnih utisaka i preuveličavanja - samo iskrena iskustva zadovoljnih klijenata."}
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--border)] bg-white p-7 shadow-soft">
              <div className="flex items-end gap-4">
                <p className="font-display text-7xl font-semibold leading-none text-primary">
                  {avg.toFixed(2)}
                </p>

                <div className="pb-2">
                  <Rating value={avg} size={20} />

                  <p className="mt-2 text-xs text-muted">
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
                    className={`-mx-1.5 flex w-full items-center gap-3 rounded-xl p-1.5 text-sm transition ${
                      filter === b.star
                        ? "bg-primary-soft/60"
                        : "hover:bg-primary-soft/30"
                    }`}
                  >
                    <span className="w-7 text-left text-muted">{b.star}★</span>

                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--background-soft)]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-[#d7a2ec]"
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
      <section className="mx-auto mt-10 max-w-7xl px-6 lg:px-10">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                filter === "all"
                  ? "border-primary bg-primary text-white shadow-soft"
                  : "border-[var(--border)] bg-white hover:border-primary hover:text-primary"
              }`}
            >
              Sve recenzije
            </button>

            {[5, 4, 3].map((n) => (
              <button
                key={n}
                onClick={() => setFilter(filter === n ? "all" : n)}
                className={`inline-flex items-center gap-1 rounded-full border px-4 py-2 text-sm font-medium transition ${
                  filter === n
                    ? "border-primary bg-primary text-white shadow-soft"
                    : "border-[var(--border)] bg-white hover:border-primary hover:text-primary"
                }`}
              >
                {n} <StarIcon width={12} height={12} />
                {" & up"}
              </button>
            ))}
          </div>

          <div className="relative w-full max-w-sm">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />

            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Pretraži recenzije..."
              className="pl-11"
            />
          </div>
        </div>
      </section>

      {/* GRID */}
      <section className="mx-auto mt-6 max-w-7xl px-6 lg:px-10">
        {loading || !ready ? (
          <div className="rounded-3xl border border-[var(--border)] bg-white p-14 text-center shadow-softer">
            <p className="text-muted">Učitavanje recenzija...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-[var(--border)] bg-white p-14 text-center shadow-softer">
            <p className="text-muted">
              {isSalon
                ? "Trenutno nema recenzija za tvoj salon."
                : "Nema recenzija za zadate filtere."}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((r) => {
              const salon = !isSalon
                ? SALONS.find((s) => s.id === r.salonId)
                : null;

              return (
                <div
                  key={r.id}
                  className="hover-lift flex flex-col rounded-3xl border border-[var(--border)] bg-white p-6 shadow-softer"
                >
                  <div className="flex items-center justify-between">
                    <Rating value={r.rating} size={15} />

                    <span className="text-xs text-muted">
                      {timeAgo(r.date)}
                    </span>
                  </div>

                  <p className="mt-4 flex-1 text-[15px] leading-relaxed text-foreground/85">
                    &ldquo;{r.body}&rdquo;
                  </p>

                  <div className="mt-5 flex items-center gap-3 border-t border-[var(--border)] pt-5">
                    <Avatar name={r.author} size={40} />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {r.author}
                      </p>

                      <p className="truncate text-xs text-muted">{r.service}</p>
                    </div>

                    {isSalon && r.imageUrl && (
                      <div className="relative size-10 shrink-0 overflow-hidden rounded-xl border border-[var(--border)]">
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
                        className="relative size-10 shrink-0 overflow-hidden rounded-xl border border-[var(--border)]"
                        title={salon.name}
                      >
                        <SalonCover
                          name={salon.name}
                          src={salon.cover}
                          sizes="40px"
                          imageClassName="object-cover"
                          initialsClassName="text-base"
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
        <section className="mx-auto mt-20 max-w-7xl px-6 lg:px-10">
          <div className="grid items-start gap-6 lg:grid-cols-[1fr_1.3fr]">
            <div className="rounded-3xl border border-[var(--border)] bg-white p-8 shadow-softer">
              <EyebrowLabel>Vaš red!</EyebrowLabel>

              <h2 className="mt-3 font-display text-3xl font-semibold">
                Recite nam Vaše iskustvo!
              </h2>

              <p className="mt-3 text-muted">
                Nekoliko lepih ili iskrenih reči pomaže drugim klijentima da
                pronađu svoj sledeći ritual, a salonima da rastu na pravi način.
              </p>

              <div className="mt-6 grid grid-cols-3 gap-2">
                {["Hair", "Nails", "Facial"].map((c) => (
                  <span
                    key={c}
                    className="rounded-full bg-primary-soft/50 py-2 text-center text-xs font-medium text-[#5b3e8a]"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-[var(--border)] bg-white p-8 shadow-softer">
              {submitted ? (
                <div className="py-10 text-center">
                  <span className="mx-auto inline-flex size-16 items-center justify-center rounded-full bg-success-soft text-[#2f6a51]">
                    <SparkleIcon width={26} height={26} />
                  </span>

                  <h3 className="mt-5 font-display text-2xl font-semibold">
                    Hvala Vam✿
                  </h3>

                  <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
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
                      placeholder="Opišite svoje iskustvo — usluga, osoblje, prostor..."
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
