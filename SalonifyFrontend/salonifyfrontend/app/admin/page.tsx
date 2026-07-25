"use client";

import { useEffect, useState } from "react";
import { EyebrowLabel, Button, Rating, StatusBadge } from "../components/ui";
import {
  refreshSalonFeatureVectors,
  normalizeUserPreferenceVectors,
  getAdminStats,
} from "@/services/admin";
import { AdminStats } from "@/types/admin";

type ActionState = {
  loading: boolean;
  message: string;
  error: string;
};

const initialActionState: ActionState = {
  loading: false,
  message: "",
  error: "",
};

const STATUS_ORDER = [
  "Pending",
  "Approved",
  "Completed",
  "Rejected",
  "Cancelled",
] as const;

export default function AdminPage() {
  const [displayName] = useState(() => {
    if (typeof window === "undefined") {
      return "Admin";
    }

    return localStorage.getItem("displayName") || "Admin";
  });
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [featureVectors, setFeatureVectors] =
    useState<ActionState>(initialActionState);
  const [preferenceVectors, setPreferenceVectors] =
    useState<ActionState>(initialActionState);

  useEffect(() => {
    async function loadStats() {
      try {
        setStatsLoading(true);
        const data = await getAdminStats();
        setStats(data);
      } catch (error) {
        console.error("Greška pri učitavanju statistike:", error);
      } finally {
        setStatsLoading(false);
      }
    }

    loadStats();
  }, []);

  async function runAction(
    action: () => Promise<{ message: string }>,
    setState: (state: ActionState) => void
  ) {
    try {
      setState({ loading: true, message: "", error: "" });
      const response = await action();
      setState({ loading: false, message: response.message, error: "" });
    } catch (error) {
      setState({
        loading: false,
        message: "",
        error:
          error instanceof Error
            ? error.message
            : "Akcija nije uspela. Proveri backend konzolu.",
      });
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/80 bg-white/80 p-8 shadow-softer">
        <EyebrowLabel>Admin panel</EyebrowLabel>

        <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-display text-4xl font-semibold tracking-tight">
              Dobrodosla, {displayName}
            </h1>
            <p className="mt-3 max-w-2xl text-muted">
              Upravljaj sistemskim podacima, preporukama i kontrolnim akcijama
              za Salonify.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-muted">
            Prijavljena si kao{" "}
            <span className="font-semibold text-primary">Admin</span>
          </div>
        </div>
      </section>

      {statsLoading ? (
        <p className="text-muted">Učitavanje statistike...</p>
      ) : stats ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Korisnici" value={stats.totalUsers} />
            <StatCard title="Saloni" value={stats.totalSalons} />
            <StatCard title="Termini" value={stats.totalAppointments} />
            <StatCard title="Recenzije" value={stats.totalReviews} />
          </section>

          <section className="grid gap-5 lg:grid-cols-2">
            <article className="rounded-[1.5rem] border border-[var(--border)] bg-white p-6 shadow-softer">
              <h2 className="font-display text-2xl font-semibold">
                Termini po statusu
              </h2>

              <ul className="mt-4 space-y-3">
                {STATUS_ORDER.map((status) => (
                  <li
                    key={status}
                    className="flex items-center justify-between"
                  >
                    <StatusBadge status={status} />
                    <span className="font-display text-lg font-semibold">
                      {stats.appointmentsByStatus[status] ?? 0}
                    </span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-[1.5rem] border border-[var(--border)] bg-white p-6 shadow-softer">
              <h2 className="font-display text-2xl font-semibold">
                Top saloni
              </h2>

              {stats.topSalons.length === 0 ? (
                <p className="mt-4 text-sm text-muted">
                  Još nema salona sa recenzijama.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {stats.topSalons.map((salon) => (
                    <li
                      key={salon.salonId}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="font-medium truncate">{salon.name}</p>
                        <p className="text-xs text-muted">{salon.city}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Rating value={salon.averageRating} showValue />
                        <span className="text-xs text-muted">
                          ({salon.reviewCount})
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          </section>
        </>
      ) : (
        <p className="text-muted">Statistika trenutno nije dostupna.</p>
      )}

      <section className="grid gap-5 lg:grid-cols-2">
        <AdminActionCard
          title="Osvezi vektore salona"
          text="Ponovo racuna FeatureVector za sve salone na osnovu njihovih usluga."
          state={featureVectors}
          buttonText="Osvezi salone"
          onRun={() => runAction(refreshSalonFeatureVectors, setFeatureVectors)}
        />

        <AdminActionCard
          title="Normalizuj korisnicke vektore"
          text="Sređuje PreferenceVector za sve korisnike tako da vrednosti ostanu izmedju 0 i 1."
          state={preferenceVectors}
          buttonText="Normalizuj korisnike"
          onRun={() =>
            runAction(normalizeUserPreferenceVectors, setPreferenceVectors)
          }
        />
      </section>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <article className="rounded-[1.5rem] border border-[var(--border)] bg-white p-6 shadow-softer">
      <p className="text-sm text-muted">{title}</p>
      <p className="mt-2 font-display text-4xl font-semibold tracking-tight">
        {value}
      </p>
    </article>
  );
}

function AdminActionCard({
  title,
  text,
  state,
  buttonText,
  onRun,
}: {
  title: string;
  text: string;
  state: ActionState;
  buttonText: string;
  onRun: () => void;
}) {
  return (
    <article className="rounded-[1.5rem] border border-[var(--border)] bg-white p-6 shadow-softer">
      <h2 className="font-display text-2xl font-semibold">{title}</h2>
      <p className="mt-2 min-h-12 text-sm leading-6 text-muted">{text}</p>

      <Button
        type="button"
        className="mt-5"
        onClick={onRun}
        disabled={state.loading}
      >
        {state.loading ? "Izvrsavanje..." : buttonText}
      </Button>

      {state.message && (
        <p className="mt-4 rounded-2xl border border-[var(--success)]/30 bg-success-soft px-4 py-3 text-sm text-[#2f6a51]">
          {state.message}
        </p>
      )}

      {state.error && (
        <p className="mt-4 rounded-2xl border border-[var(--danger)]/30 bg-danger-soft px-4 py-3 text-sm text-[#8a3948]">
          {state.error}
        </p>
      )}
    </article>
  );
}
