"use client";

import { useEffect, useMemo, useState } from "react";
import { Rating, Avatar, Button, Textarea, Label } from "../../components/ui";
import { StarIcon, StarOutlineIcon } from "../../components/Icons";
import type { Review } from "@/types/Review";
import type { SalonService } from "@/types/SalonService";
import { createReview, getReviewsForSalon } from "@/services/reviews";

type SortValue = "newest" | "oldest" | "highest" | "lowest";

const SERVICE_TYPE_LABELS: Record<number, string> = {
  0: "Šišanje",
  1: "Farbanje",
  2: "Stilizovanje",
  3: "Manikir",
  4: "Pedikir",
  5: "Šminkanje",
  6: "Masaža",
  7: "Tretman lica",
  8: "Depilacija",
  9: "Spa tretman",
  10: "Nail art",
  11: "Ostalo",
};

const SERVICE_TYPE_VALUES: Record<string, number> = {
  haircut: 0,
  coloring: 1,
  styling: 2,
  manicure: 3,
  pedicure: 4,
  makeup: 5,
  massage: 6,
  facial: 7,
  waxing: 8,
  spatreatment: 9,
  nailart: 10,
  other: 11,
};

function getServiceTypeNumber(value?: string | number) {
  if (typeof value === "number") return value;

  if (typeof value === "string") {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) return parsed;

    return SERVICE_TYPE_VALUES[value.trim().toLowerCase()];
  }

  return undefined;
}

export default function ReviewBlock({
  salonId,
  reviews,
  rating,
  count,
  availableServices = [],
  reviewAppointmentId,
  reviewServiceName,
}: {
  salonId: string;
  reviews: Review[];
  rating: number;
  count: number;
  availableServices?: SalonService[];
  reviewAppointmentId?: string;
  reviewServiceName?: string;
}) {
  const [allReviews, setAllReviews] = useState<Review[]>(reviews);

  const [writeRating, setWriteRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [minRatingFilter, setMinRatingFilter] = useState<number | "all">("all");
  const [serviceFilter, setServiceFilter] = useState<number | "all">("all");
  const [sortFilter, setSortFilter] = useState<SortValue>("newest");

  const [serviceMenuOpen, setServiceMenuOpen] = useState(false);

  const serviceOptions = useMemo(() => {
    const unique = new Map<number, string>();

    availableServices.forEach((service) => {
      const serviceTypeNumber = getServiceTypeNumber(service.serviceType);

      if (serviceTypeNumber === undefined) return;

      unique.set(
        serviceTypeNumber,
        service.name ||
          service.serviceName ||
          SERVICE_TYPE_LABELS[serviceTypeNumber] ||
          "Usluga"
      );
    });

    return [
      { value: "all" as const, label: "Sve usluge" },
      ...Array.from(unique.entries()).map(([value, label]) => ({
        value,
        label,
      })),
    ];
  }, [availableServices]);

  const selectedServiceLabel =
    serviceOptions.find((option) => option.value === serviceFilter)?.label ||
    "Sve usluge";

  const selectedServiceNames = useMemo(() => {
    if (serviceFilter === "all") return [];

    return availableServices
      .filter((service) => getServiceTypeNumber(service.serviceType) === serviceFilter)
      .flatMap((service) => [service.name, service.serviceName])
      .filter(Boolean)
      .map((value) => String(value).trim().toLowerCase());
  }, [availableServices, serviceFilter]);

  const hasActiveFilters =
    minRatingFilter !== "all" ||
    serviceFilter !== "all" ||
    sortFilter !== "newest";

  function resetFilters() {
    setMinRatingFilter("all");
    setServiceFilter("all");
    setSortFilter("newest");
    setServiceMenuOpen(false);
  }

  const displayedReviews = useMemo(() => {
    let filtered = [...allReviews];

    if (minRatingFilter !== "all") {
      filtered = filtered.filter((review) => review.rating >= minRatingFilter);
    }

    if (serviceFilter !== "all") {
      filtered = filtered.filter((review) => {
      const reviewServiceType = getServiceTypeNumber(review.serviceType);

      if (reviewServiceType === serviceFilter) {
        return true;
      }

      const reviewServiceName = review.serviceName?.trim().toLowerCase();

      return Boolean(
        reviewServiceName && selectedServiceNames.includes(reviewServiceName)
      );
    });
    }

    return filtered.sort((a, b) => {
      if (sortFilter === "highest") return b.rating - a.rating;
      if (sortFilter === "lowest") return a.rating - b.rating;

      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();

      if (sortFilter === "oldest") return dateA - dateB;

      return dateB - dateA;
    });
  }, [
    allReviews,
    minRatingFilter,
    selectedServiceNames,
    serviceFilter,
    sortFilter,
  ]);

  const reviewStats = useMemo(() => {
    const total = allReviews.length;
    const average = total
      ? allReviews.reduce((sum, review) => sum + review.rating, 0) / total
      : rating;

    const breakdown = [5, 4, 3, 2, 1].map((star) => {
      const n = allReviews.filter((r) => Math.round(r.rating) === star).length;
      const pct = total ? (n / total) * 100 : 0;

      return { star, n, pct };
    });

    return {
      average,
      count: total || count,
      breakdown,
    };
  }, [allReviews, count, rating]);

  async function searchSalonReviews(
    targetSalonId?: string,
    _params?: {
      minRating?: number;
      serviceType?: number;
      sortBy?: SortValue;
    }
  ) {
    if (!targetSalonId) return reviews;

    return getReviewsForSalon(targetSalonId);
  }

  function applyServiceFilter(data: Review[]) {
    return data;
  }

  const setDisplayedReviews = setAllReviews;

  useEffect(() => {
    setAllReviews(reviews);
  }, [reviews]);

  useEffect(() => {
    if (window.location.hash === "#reviews") {
      setTimeout(() => {
        document
          .getElementById("reviews")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  }, []);

  useEffect(() => {
    async function loadFilteredReviews() {
      if (!salonId) return;

      const noFiltersSelected =
        minRatingFilter === "all" &&
        serviceFilter === "all" &&
        sortFilter === "newest";

      if (noFiltersSelected) {
        return;
      }

      try {
        setFilterLoading(true);

        const data = await searchSalonReviews(salonId, {
          minRating: minRatingFilter === "all" ? undefined : minRatingFilter,
          serviceType: serviceFilter === "all" ? undefined : serviceFilter,
          sortBy: sortFilter,
        });

        setDisplayedReviews(applyServiceFilter(data));
      } catch (error) {
        console.error("Greška pri filtriranju recenzija:", error);
        setDisplayedReviews(reviews);
      } finally {
        setFilterLoading(false);
      }
    }

    loadFilteredReviews();
  }, [
    salonId,
    minRatingFilter,
    serviceFilter,
    sortFilter,
    availableServices,
    reviews,
  ]);

  const alreadyReviewed = useMemo(() => {
    if (!reviewAppointmentId) return false;

    return allReviews.some(
      (review) => review.appointmentId === reviewAppointmentId
    );
  }, [allReviews, reviewAppointmentId]);

  const canWriteReview = Boolean(reviewAppointmentId) && !alreadyReviewed;

  async function reloadReviews() {
    if (!salonId) return;

    try {
      const data = await getReviewsForSalon(salonId);

      setAllReviews(data);
    } catch (error) {
      console.error("Greška pri ponovnom učitavanju recenzija:", error);
      setDisplayedReviews(reviews);
    }
  }

  async function handleSubmitReview() {
    setErrorMessage("");

    if (!reviewAppointmentId) {
      setErrorMessage("Nedostaje termin za koji se ostavlja recenzija.");
      return;
    }

    if (!text.trim()) {
      setErrorMessage("Unesite komentar za recenziju.");
      return;
    }

    try {
      setLoading(true);

      await createReview({
        appointmentId: reviewAppointmentId,
        rating: writeRating,
        comment: text.trim(),
      });

      setSubmitted(true);
      setText("");
      setWriteRating(5);

      await reloadReviews();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Došlo je do greške prilikom dodavanja recenzije."
      );
    } finally {
      setLoading(false);
    }
  }

  function FilterPanel() {
    return (
      <div className="w-full rounded-[28px] border border-[var(--border)] bg-white p-5 shadow-softer">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="font-display text-xl font-semibold text-foreground">
                Filteri recenzija
              </h3>

              <p className="mt-1 text-xs text-muted">
                Prikažite iskustva po oceni, usluzi ili datumu.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {filterLoading && (
                <span className="rounded-full bg-[var(--background-soft)] px-3 py-1.5 text-xs font-medium text-muted">
                  Učitavanje...
                </span>
              )}

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium text-muted transition hover:border-primary/40 hover:text-primary"
                >
                  Resetuj
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                Ocena
              </p>

              <div className="flex flex-wrap gap-2">
                {[
                  { value: "all" as const, label: "Sve" },
                  { value: 5 as const, label: "5★" },
                  { value: 4 as const, label: "4+ ★" },
                  { value: 3 as const, label: "3+ ★" },
                  { value: 2 as const, label: "2+ ★" },
                  { value: 1 as const, label: "1+ ★" },
                ].map((option) => {
                  const active = minRatingFilter === option.value;

                  return (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => setMinRatingFilter(option.value)}
                      className={[
                        "rounded-full border px-3.5 py-2 text-xs font-semibold transition",
                        active
                          ? "border-primary bg-primary text-white shadow-sm"
                          : "border-[var(--border)] bg-[var(--background-soft)] text-muted hover:border-primary/40 hover:bg-white hover:text-primary",
                      ].join(" ")}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
              <div className="relative">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                  Usluga
                </p>

                <button
                  type="button"
                  onClick={() => setServiceMenuOpen((prev) => !prev)}
                  className={[
                    "flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition",
                    serviceMenuOpen
                      ? "border-primary/50 bg-white shadow-sm"
                      : "border-[var(--border)] bg-[var(--background-soft)] hover:border-primary/40 hover:bg-white",
                  ].join(" ")}
                >
                  <span className="min-w-0 truncate text-sm font-semibold text-foreground">
                    {selectedServiceLabel}
                  </span>

                  <span
                    className={[
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-primary shadow-sm transition",
                      serviceMenuOpen ? "rotate-180" : "",
                    ].join(" ")}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5 7.5L10 12.5L15 7.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>

                {serviceMenuOpen && (
                  <div className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-2 shadow-soft">
                    <div className="max-h-60 overflow-y-auto pr-1">
                      {serviceOptions.map((service) => {
                        const active = serviceFilter === service.value;

                        return (
                          <button
                            key={String(service.value)}
                            type="button"
                            onClick={() => {
                              setServiceFilter(service.value);
                              setServiceMenuOpen(false);
                            }}
                            className={[
                              "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition",
                              active
                                ? "bg-primary text-white shadow-sm"
                                : "text-foreground hover:bg-[var(--background-soft)] hover:text-primary",
                            ].join(" ")}
                          >
                            <span className="truncate">{service.label}</span>

                            {active && (
                              <span className="ml-3 text-xs font-semibold">
                                ✓
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                  Datum
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSortFilter("newest")}
                    className={[
                      "rounded-full border px-4 py-2 text-xs font-semibold transition",
                      sortFilter === "newest"
                        ? "border-primary bg-primary text-white shadow-sm"
                        : "border-[var(--border)] bg-[var(--background-soft)] text-muted hover:border-primary/40 hover:bg-white hover:text-primary",
                    ].join(" ")}
                  >
                    Najnovije
                  </button>

                  <button
                    type="button"
                    onClick={() => setSortFilter("oldest")}
                    className={[
                      "rounded-full border px-4 py-2 text-xs font-semibold transition",
                      sortFilter === "oldest"
                        ? "border-primary bg-primary text-white shadow-sm"
                        : "border-[var(--border)] bg-[var(--background-soft)] text-muted hover:border-primary/40 hover:bg-white hover:text-primary",
                    ].join(" ")}
                  >
                    Najstarije
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section
      id="reviews"
      className="grid w-full scroll-mt-28 gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.35fr)]"
    >
      <div className="space-y-5">
        <div className="rounded-[28px] border border-[var(--border)] bg-white p-7 shadow-softer">
          <div className="flex items-center gap-5">
            <p className="font-display text-6xl font-semibold leading-none text-primary">
              {reviewStats.average.toFixed(2)}
            </p>

            <div>
              <Rating value={reviewStats.average} size={17} />

              <p className="mt-2 text-sm text-muted">
                Broj trenutnih recenzija: {reviewStats.count} 
              </p>
            </div>
          </div>

          <div className="mt-7 space-y-3">
            {reviewStats.breakdown.map((b) => (
              <div
                key={b.star}
                className="grid grid-cols-[42px_1fr_24px] items-center gap-4 text-sm"
              >
                <span className="text-sm font-medium text-muted">
                  {b.star}★
                </span>

                <div className="h-2 overflow-hidden rounded-full bg-[var(--background-soft)]">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${b.pct}%` }}
                  />
                </div>

                <span className="text-right text-sm font-medium text-muted">
                  {b.n}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-[var(--border)] bg-white p-6 shadow-softer">
          {!reviewAppointmentId && (
            <>
              <h4 className="font-display text-lg font-semibold">
                Recenzije ostavljaju samo klijenti
              </h4>

              <p className="mt-2 text-sm leading-6 text-muted">
                Recenziju možete ostaviti tek nakon završenog tretmana.
              </p>
            </>
          )}

          {reviewAppointmentId && alreadyReviewed && (
            <>
              <h4 className="font-display text-lg font-semibold">
                Recenzija je već ostavljena
              </h4>

              <p className="mt-2 text-sm leading-6 text-muted">
                Za ovaj završeni tretman ste već ostavili recenziju.
              </p>
            </>
          )}

          {reviewAppointmentId && submitted && (
            <div className="rounded-2xl bg-success-soft p-4 text-sm text-[#2f6a51]">
              Hvala na Vašoj recenziji.
            </div>
          )}

          {canWriteReview && !submitted && (
            <>
              <h4 className="font-display text-lg font-semibold">
                Ostavite recenziju
              </h4>

              <p className="mt-1 text-sm text-muted">
                Recenzija se odnosi na tretman{" "}
                {reviewServiceName && (
                  <span className="font-semibold text-foreground">
                    {reviewServiceName}
                  </span>
                )}
                .
              </p>

              <div className="mt-5 space-y-4">
                <div>
                  <Label>Vaša ocena</Label>

                  <div className="mt-1 flex items-center gap-1 text-[var(--gold)]">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const value = i + 1;
                      const active = (hoverRating ?? writeRating) >= value;

                      return (
                        <button
                          key={value}
                          onMouseEnter={() => setHoverRating(value)}
                          onMouseLeave={() => setHoverRating(null)}
                          onClick={() => setWriteRating(value)}
                          className="p-1 transition hover:scale-110"
                          type="button"
                        >
                          {active ? (
                            <StarIcon width={25} height={25} />
                          ) : (
                            <StarOutlineIcon
                              width={25}
                              height={25}
                              className="text-[#e6d6bb]"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label htmlFor="review-comment">Vaš komentar</Label>

                  <Textarea
                    id="review-comment"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Recite nam nešto o Vašem iskustvu..."
                  />
                </div>

                {errorMessage && (
                  <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                    {errorMessage}
                  </p>
                )}

                <Button
                  className="w-full"
                  onClick={handleSubmitReview}
                  disabled={!text.trim() || loading}
                >
                  {loading ? "Slanje..." : "Potvrdite recenziju"}
                </Button>
              </div>
            </>
          )}
        </div>

        <FilterPanel />
      </div>

      <div className="min-w-0 w-full space-y-5">
        <div className="hidden">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="font-display text-xl font-semibold text-foreground">
                  Recenzije
                </h3>

                <p className="mt-1 text-xs text-muted">
                  Prikažite iskustva po oceni, usluzi ili datumu.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {filterLoading && (
                  <span className="rounded-full bg-[var(--background-soft)] px-3 py-1.5 text-xs font-medium text-muted">
                    Učitavanje...
                  </span>
                )}

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium text-muted transition hover:border-primary/40 hover:text-primary"
                  >
                    Resetuj
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                  Ocena
                </p>

                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "all" as const, label: "Sve" },
                    { value: 5 as const, label: "5★" },
                    { value: 4 as const, label: "4+ ★" },
                    { value: 3 as const, label: "3+ ★" },
                    { value: 2 as const, label: "2+ ★" },
                    { value: 1 as const, label: "1+ ★" },
                  ].map((option) => {
                    const active = minRatingFilter === option.value;

                    return (
                      <button
                        key={option.label}
                        type="button"
                        onClick={() => setMinRatingFilter(option.value)}
                        className={[
                          "rounded-full border px-3.5 py-2 text-xs font-semibold transition",
                          active
                            ? "border-primary bg-primary text-white shadow-sm"
                            : "border-[var(--border)] bg-[var(--background-soft)] text-muted hover:border-primary/40 hover:bg-white hover:text-primary",
                        ].join(" ")}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                <div className="relative">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                    Usluga
                  </p>

                  <button
                    type="button"
                    onClick={() => setServiceMenuOpen((prev) => !prev)}
                    className={[
                      "flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition",
                      serviceMenuOpen
                        ? "border-primary/50 bg-white shadow-sm"
                        : "border-[var(--border)] bg-[var(--background-soft)] hover:border-primary/40 hover:bg-white",
                    ].join(" ")}
                  >
                    <span className="min-w-0 truncate text-sm font-semibold text-foreground">
                      {selectedServiceLabel}
                    </span>

                    <span
                      className={[
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-primary shadow-sm transition",
                        serviceMenuOpen ? "rotate-180" : "",
                      ].join(" ")}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M5 7.5L10 12.5L15 7.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </button>

                  {serviceMenuOpen && (
                    <div className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-2 shadow-soft">
                      <div className="max-h-60 overflow-y-auto pr-1">
                        {serviceOptions.map((service) => {
                          const active = serviceFilter === service.value;

                          return (
                            <button
                              key={String(service.value)}
                              type="button"
                              onClick={() => {
                                setServiceFilter(service.value);
                                setServiceMenuOpen(false);
                              }}
                              className={[
                                "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition",
                                active
                                  ? "bg-primary text-white shadow-sm"
                                  : "text-foreground hover:bg-[var(--background-soft)] hover:text-primary",
                              ].join(" ")}
                            >
                              <span className="truncate">{service.label}</span>

                              {active && (
                                <span className="ml-3 text-xs font-semibold">
                                  ✓
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                    Datum
                  </p>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSortFilter("newest")}
                      className={[
                        "rounded-full border px-4 py-2 text-xs font-semibold transition",
                        sortFilter === "newest"
                          ? "border-primary bg-primary text-white shadow-sm"
                          : "border-[var(--border)] bg-[var(--background-soft)] text-muted hover:border-primary/40 hover:bg-white hover:text-primary",
                      ].join(" ")}
                    >
                      Najnovije
                    </button>

                    <button
                      type="button"
                      onClick={() => setSortFilter("oldest")}
                      className={[
                        "rounded-full border px-4 py-2 text-xs font-semibold transition",
                        sortFilter === "oldest"
                          ? "border-primary bg-primary text-white shadow-sm"
                          : "border-[var(--border)] bg-[var(--background-soft)] text-muted hover:border-primary/40 hover:bg-white hover:text-primary",
                      ].join(" ")}
                    >
                      Najstarije
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {displayedReviews.length === 0 && (
          <div className="w-full rounded-[28px] border border-[var(--border)] bg-white p-8 text-center shadow-softer">
            <p className="text-sm text-muted">
              Nema recenzija za izabrane filtere.
            </p>
          </div>
        )}

        <div className="w-full space-y-4">
          {displayedReviews.map((review) => (
              <article
                key={review.id}
                className="w-full rounded-[26px] border border-[var(--border)] bg-white px-5 py-5 shadow-softer transition hover:-translate-y-0.5 hover:shadow-soft"
              >
                <div className="grid grid-cols-[1fr_auto] gap-6">
                  <div className="min-w-0">
                    <div className="flex items-start gap-4">
                      <Avatar name={review.userName || "Korisnik"} size={48} />

                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-foreground">
                          {review.userName || "Korisnik"}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
                          <span>
                            {new Date(review.createdAt).toLocaleDateString(
                              "sr-RS",
                              {
                                day: "numeric",
                                month: "numeric",
                                year: "numeric",
                              }
                            )}
                          </span>

                          {review.serviceName && (
                            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                              {review.serviceName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="mt-4 text-base leading-7 text-foreground/85">
                      {review.comment}
                    </p>
                  </div>

                  <div className="flex shrink-0 justify-end pt-1">
                    <Rating value={review.rating} size={15} />
                  </div>
                </div>
              </article>
            ))}
        </div>
      </div>
    </section>
  );
}
