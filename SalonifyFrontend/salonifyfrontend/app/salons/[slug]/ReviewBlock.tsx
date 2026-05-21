"use client";

import { useEffect, useMemo, useState } from "react";
import { Rating, Avatar, Button, Textarea, Label } from "../../components/ui";
import { StarIcon, StarOutlineIcon } from "../../components/Icons";
import type { Review } from "@/types/Review";
import { createReview } from "@/services/reviews";

export default function ReviewBlock({
  reviews,
  rating,
  count,
  reviewAppointmentId,
  reviewServiceName,
}: {
  reviews: Review[];
  rating: number;
  count: number;
  reviewAppointmentId?: string;
  reviewServiceName?: string;
}) {
  const [writeRating, setWriteRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [minRatingFilter, setMinRatingFilter] = useState<number | "all">("all");
const [serviceFilter, setServiceFilter] = useState("all");
const [sortFilter, setSortFilter] = useState<
  "newest" | "oldest" | "highest" | "lowest"
>("newest");

  useEffect(() => {
    if (window.location.hash === "#reviews") {
      setTimeout(() => {
        document
          .getElementById("reviews")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  }, []);

  const alreadyReviewed = useMemo(() => {
    if (!reviewAppointmentId) return false;

    return reviews.some(
      (review) => review.appointmentId === reviewAppointmentId,
    );
  }, [reviews, reviewAppointmentId]);

  const canWriteReview = Boolean(reviewAppointmentId) && !alreadyReviewed;

  const breakdown = [5, 4, 3, 2, 1].map((star) => {
    const n = reviews.filter((r) => Math.round(r.rating) === star).length;
    const pct = reviews.length ? (n / reviews.length) * 100 : 0;
    return { star, n, pct };
  });

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
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Došlo je do greške prilikom dodavanja recenzije.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      id="reviews"
      className="scroll-mt-32 grid lg:grid-cols-[1fr_1.3fr] gap-8"
    >
      <div className="space-y-6">
        <div className="bg-white rounded-3xl border border-[var(--border)] shadow-softer p-7">
          <div className="flex items-end gap-4">
            <p className="font-display text-6xl font-semibold text-primary">
              {rating.toFixed(1)}
            </p>

            <div className="pb-2">
              <Rating value={rating} size={18} />
              <p className="text-xs text-muted mt-1">
                Bazirano na {count} recenzije
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            {breakdown.map((b) => (
              <div
                key={b.star}
                className="grid grid-cols-[34px_1fr_28px] items-center gap-3 text-sm"
              >
                <span className="text-muted">{b.star}★</span>

                <div className="h-2 rounded-full bg-[var(--background-soft)] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-[#d7a2ec] rounded-full"
                    style={{ width: `${b.pct}%` }}
                  />
                </div>

                <span className="text-right text-xs tabular-nums text-muted">
                  {b.n}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-[var(--border)] shadow-softer p-7">
          {!reviewAppointmentId && (
            <>
              <h4 className="font-display text-xl font-semibold">
                Recenzije ostavljaju samo klijenti
              </h4>

              <p className="text-sm text-muted mt-2 leading-6">
                Recenziju možete ostaviti tek nakon završenog tretmana. Kada
                tretman bude označen kao završen, opcija za recenziju će se
                pojaviti u sekciji Vaši termini.
              </p>
            </>
          )}

          {reviewAppointmentId && alreadyReviewed && (
            <>
              <h4 className="font-display text-xl font-semibold">
                Recenzija je već ostavljena
              </h4>

              <p className="text-sm text-muted mt-2 leading-6">
                Za ovaj završeni tretman ste već ostavili recenziju. Jedan
                tretman može imati samo jednu recenziju.
              </p>
            </>
          )}

          {reviewAppointmentId && submitted && (
            <div className="p-4 rounded-2xl bg-success-soft text-[#2f6a51] text-sm">
              Hvala na Vašoj recenziji — ona će sada biti uračunata u prosečnu
              ocenu salona.
            </div>
          )}

          {canWriteReview && !submitted && (
            <>
              <h4 className="font-display text-xl font-semibold">
                Ostavite recenziju
              </h4>

              <p className="text-sm text-muted mt-1">
                Recenzija se odnosi na završeni tretman
                {reviewServiceName ? (
                  <>
                    {" "}
                    <span className="font-semibold text-foreground">
                      {reviewServiceName}
                    </span>
                  </>
                ) : (
                  ""
                )}
                .
              </p>

              <div className="mt-5 space-y-4">
                <div>
                  <Label>Vaša ocena</Label>

                  <div className="flex items-center gap-1.5 text-[var(--gold)]">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const v = i + 1;
                      const active = (hoverRating ?? writeRating) >= v;

                      return (
                        <button
                          key={i}
                          onMouseEnter={() => setHoverRating(v)}
                          onMouseLeave={() => setHoverRating(null)}
                          onClick={() => setWriteRating(v)}
                          className="p-1 transition hover:scale-110"
                          type="button"
                        >
                          {active ? (
                            <StarIcon width={28} height={28} />
                          ) : (
                            <StarOutlineIcon
                              width={28}
                              height={28}
                              className="text-[#e6d6bb]"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label htmlFor="r">Vaš komentar</Label>

                  <Textarea
                    id="r"
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
                  {loading ? "Slanje recenzije..." : "Potvrdite recenziju"}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {reviews.length === 0 && (
          <div className="bg-white rounded-3xl border border-[var(--border)] p-10 text-center">
            <p className="text-muted">Još uvek nema recenzija za ovaj salon.</p>
          </div>
        )}

        {reviews.map((r) => (
          <div
            key={r.id}
            className="bg-white rounded-3xl border border-[var(--border)] shadow-softer p-6 hover-lift"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar name={r.userName || "Korisnik"} size={44} />

                <div className="flex items-center gap-2 text-xs text-muted">
                  <span>
                    {new Date(r.createdAt).toLocaleDateString("sr-RS")}
                  </span>

                  {r.serviceName && (
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary">
                      {r.serviceName}
                    </span>
                  )}
                </div>
              </div>

              <Rating value={r.rating} size={14} />
            </div>

            <p className="mt-4 text-[15px] text-foreground/85 leading-relaxed">
              {r.comment}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
