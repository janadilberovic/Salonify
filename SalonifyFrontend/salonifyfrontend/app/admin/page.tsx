"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button, EyebrowLabel } from "../components/ui";
import {
  refreshSalonFeatureVectors,
  normalizeUserPreferenceVectors,
} from "@/services/admin";
import { DashboardIcon, StarIcon } from "../components/Icons";

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

export default function AdminPage() {
  const [displayName] = useState(() => {
    if (typeof window === "undefined") {
      return "Admin";
    }

    return localStorage.getItem("displayName") || "Admin";
  });
  const [featureVectors, setFeatureVectors] =
    useState<ActionState>(initialActionState);
  const [preferenceVectors, setPreferenceVectors] =
    useState<ActionState>(initialActionState);

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
    <>
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">
        <section className="rounded-[2rem] border border-white/80 bg-white/80 p-8 shadow-softer">
          <EyebrowLabel>Admin panel</EyebrowLabel>

          <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-display text-4xl font-semibold tracking-tight">
                Dobrodosla, {displayName}
              </h1>
              <p className="mt-3 max-w-2xl text-muted">
                Upravljaj sistemskim podacima, preporukama i kontrolnim
                akcijama za Salonify.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-muted">
              Prijavljena si kao <span className="font-semibold text-primary">Admin</span>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-2">
          <AdminActionCard
            title="Osvezi vektore salona"
            text="Ponovo racuna FeatureVector za sve salone na osnovu njihovih usluga."
            state={featureVectors}
            buttonText="Osvezi salone"
            onRun={() =>
              runAction(refreshSalonFeatureVectors, setFeatureVectors)
            }
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

        <section className="mt-8">
          <h2 className="font-display text-2xl font-semibold">
            Brzi pristup
          </h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <AdminLinkCard
              href="/reviews"
              icon={<StarIcon width={20} height={20} />}
              title="Recenzije"
              text="Pregled recenzija i moderatorske akcije."
            />
            <AdminLinkCard
              href="/salons"
              icon={<DashboardIcon width={20} height={20} />}
              title="Saloni"
              text="Pregled javnih salon profila."
            />
          </div>
        </section>
      </main>

      <Footer />
    </>
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

function AdminLinkCard({
  href,
  icon,
  title,
  text,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-[1.5rem] border border-[var(--border)] bg-white p-5 shadow-softer transition hover:-translate-y-0.5 hover:border-primary/40"
    >
      <span className="grid size-11 place-items-center rounded-2xl bg-primary-soft text-primary">
        {icon}
      </span>
      <h3 className="mt-4 font-display text-xl font-semibold">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-muted">{text}</p>
    </Link>
  );
}
