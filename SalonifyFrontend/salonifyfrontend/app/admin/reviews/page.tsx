"use client";

import { useEffect, useMemo, useState } from "react";
import { EyebrowLabel, Input, Rating, Select } from "../../components/ui";
import ConfirmDialog from "../../components/ConfirmDialog";
import { showToast } from "../../components/Toast";
import { deleteReviewAdmin, getAllReviewsAdmin } from "@/services/admin";
import { AdminReview } from "@/types/admin";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [minRating, setMinRating] = useState("");
  const [reviewToDelete, setReviewToDelete] = useState<AdminReview | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getAllReviewsAdmin();
        setReviews(data);
      } catch (error) {
        console.error("Greška pri učitavanju recenzija:", error);
        showToast("Greška pri učitavanju recenzija.", "error");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const filteredReviews = useMemo(() => {
    const query = search.trim().toLowerCase();
    const min = minRating ? Number(minRating) : 0;

    return reviews.filter((review) => {
      if (review.rating < min) return false;

      if (!query) return true;

      return (
        review.salonName.toLowerCase().includes(query) ||
        review.userName.toLowerCase().includes(query) ||
        review.comment.toLowerCase().includes(query)
      );
    });
  }, [reviews, search, minRating]);

  async function handleDelete() {
    if (!reviewToDelete) return;

    try {
      setDeleting(true);
      await deleteReviewAdmin(reviewToDelete.id);
      setReviews((prev) => prev.filter((r) => r.id !== reviewToDelete.id));
      showToast("Recenzija je obrisana.");
      setReviewToDelete(null);
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Greška pri brisanju recenzije.",
        "error"
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/80 bg-white/80 p-8 shadow-softer">
        <EyebrowLabel>Recenzije</EyebrowLabel>
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight">
          Moderacija recenzija
        </h1>
        <p className="mt-2 text-muted">
          Pregled svih recenzija u sistemu sa mogućnošću brisanja neprikladnog
          sadržaja.
        </p>
      </section>

      <section className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Pretraži po salonu, korisniku ili komentaru..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />

        <Select
          value={minRating}
          onChange={(e) => setMinRating(e.target.value)}
          className="sm:max-w-45"
        >
          <option value="">Sve ocene</option>
          <option value="1">1+ zvezdica</option>
          <option value="2">2+ zvezdice</option>
          <option value="3">3+ zvezdice</option>
          <option value="4">4+ zvezdice</option>
          <option value="5">Samo 5 zvezdica</option>
        </Select>
      </section>

      {loading ? (
        <p className="text-muted">Učitavanje recenzija...</p>
      ) : filteredReviews.length === 0 ? (
        <p className="text-muted">Nema recenzija za zadate filtere.</p>
      ) : (
        <ul className="space-y-3">
          {filteredReviews.map((review) => (
            <li
              key={review.id}
              className="rounded-[1.5rem] border border-[var(--border)] bg-white p-5 shadow-softer"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <Rating value={review.rating} />
                    <span className="font-medium">{review.salonName}</span>
                    {review.serviceName && (
                      <span className="inline-flex h-6 items-center rounded-full bg-primary-soft px-3 text-xs font-medium text-primary">
                        {review.serviceName}
                      </span>
                    )}
                  </div>

                  {review.comment && (
                    <p className="mt-2 text-sm leading-6 text-foreground/80">
                      {review.comment}
                    </p>
                  )}

                  <p className="mt-2 text-xs text-muted">
                    {review.userName} ·{" "}
                    {new Date(review.createdAt).toLocaleDateString("sr-RS")}
                  </p>
                </div>

                <button
                  onClick={() => setReviewToDelete(review)}
                  className="shrink-0 px-4 py-2 rounded-2xl bg-danger-soft text-[#8a3948] hover:bg-[var(--danger)] hover:text-white transition text-sm font-medium"
                >
                  Obriši
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={reviewToDelete !== null}
        title="Brisanje recenzije"
        message={`Da li sigurno želiš da obrišeš recenziju korisnika "${reviewToDelete?.userName}" za salon "${reviewToDelete?.salonName}"?`}
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setReviewToDelete(null)}
      />
    </div>
  );
}
