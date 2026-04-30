"use client";

import { useEffect, useState } from "react";
import { Rating, Avatar, Button, Textarea, Label } from "../../components/ui";
import { StarIcon, StarOutlineIcon } from "../../components/Icons";
import type { Review } from "@/types/Review";
import {
  getAverageReviewsForSalon,
  getReviewsForSalon,
} from "@/services/reviews";

export default function ReviewBlock({
  reviews,
  rating,
  count,
}: {
  reviews: Review[];
  rating: number;
  count: number;
}) {
  const [writeRating, setWriteRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => {
  if (window.location.hash === "#reviews") {
    setTimeout(() => {
      document
        .getElementById("reviews")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
  }
}, []);

  const breakdown = [5, 4, 3, 2, 1].map((star) => {
    const n = reviews.filter((r) => Math.round(r.rating) === star).length;
    const pct = reviews.length ? (n / reviews.length) * 100 : 0;
    return { star, n, pct };
  });

  return (
   <section id="reviews" className="scroll-mt-32 grid lg:grid-cols-[1fr_1.3fr] gap-8">
      {/* Summary + write */}
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
              <div key={b.star} className="flex items-center gap-3 text-sm">
                <span className="w-6 text-muted">{b.star}★</span>
                <div className="flex-1 h-2 rounded-full bg-[var(--background-soft)] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-[#d7a2ec] rounded-full"
                    style={{ width: `${b.pct}%` }}
                  />
                </div>
                <span className="w-6 text-right text-xs text-muted">{b.n}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-[var(--border)] shadow-softer p-7">
          <h4 className="font-display text-xl font-semibold">Ostavite recenziju</h4>
          <p className="text-sm text-muted mt-1">
            Podelite sa nama Vaše iskustvo - to pomaže drugim korisnicima.
          </p>

          {submitted ? (
            <div className="mt-5 p-4 rounded-2xl bg-success-soft text-[#2f6a51] text-sm">
              Hvala na Vašoj recenziji — ona&rsquo;će se pojaviti nakon kratke provere.
            </div>
          ) : (
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

              <Button
                className="w-full"
                onClick={() => setSubmitted(true)}
                disabled={!text.trim()}
              >
                Potvrdite recenziju
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Reviews list */}
      <div className="space-y-4">
        {reviews.length === 0 && (
          <div className="bg-white rounded-3xl border border-[var(--border)] p-10 text-center">
            <p className="text-muted">No reviews yet — be the first!</p>
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
                <div>
                  <p className="font-semibold">{r.userName || "Korisnik"}</p>
                  <p className="text-xs text-muted">
                    {new Date(r.createdAt).toLocaleDateString("sr-RS")}
                    {r.serviceName ? ` · ${r.serviceName}` : ""}
                  </p>
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
