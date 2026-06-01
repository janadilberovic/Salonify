"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Avatar,
  Button,
  EyebrowLabel,
  Input,
  Label,
  StatusBadge,
} from "../components/ui";
import {
  ArrowRightIcon,
  CalendarIcon,
  HeartIcon,
  PhoneIcon,
  SparkleIcon,
} from "../components/Icons";
import { getUserAppointments } from "@/services/appointment";
import { getMyUserProfile, updateMyUserContact, UserProfile } from "@/services/user";
import { UserAppointment } from "@/types/appointments";

export default function AccountPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [appointments, setAppointments] = useState<UserAppointment[]>([]);
  const [form, setForm] = useState({ displayName: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAccount() {
      try {
        setLoading(true);
        const [profileData, appointmentData] = await Promise.all([
          getMyUserProfile(),
          getUserAppointments().catch(() => []),
        ]);

        setProfile(profileData);
        setAppointments(appointmentData);
        setForm({
          displayName: profileData.displayName || "",
          phone: profileData.phone || "",
        });
      } catch {
        setError("Nismo uspeli da ucitamo profil.");
      } finally {
        setLoading(false);
      }
    }

    loadAccount();
  }, []);

  const stats = useMemo(() => {
    const active = appointments.filter((item) =>
      ["Pending", "Approved", 0, 1].includes(item.status)
    ).length;
    const completed = appointments.filter((item) =>
      ["Completed", 4].includes(item.status)
    ).length;

    return {
      active,
      completed,
      total: appointments.length,
    };
  }, [appointments]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!form.displayName.trim()) {
      setError("Ime je obavezno.");
      return;
    }

    try {
      setSaving(true);
      const updated = await updateMyUserContact({
        displayName: form.displayName.trim(),
        phone: form.phone.trim(),
      });

      setProfile(updated);
      localStorage.setItem("displayName", updated.displayName);
      setMessage("Kontakt informacije su sacuvane.");
    } catch {
      setError("Cuvanje nije uspelo. Pokusajte ponovo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Navbar />

      <main className="bg-[linear-gradient(180deg,#fff_0%,#fff7fb_48%,#fff_100%)]">
        <section className="mx-auto max-w-7xl px-6 lg:px-10 pt-10 lg:pt-14">
          <div className="overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-soft">
            <div className="grid gap-8 bg-[linear-gradient(135deg,#fff_0%,#fbedf6_52%,#f4eefb_100%)] p-7 sm:p-9 lg:grid-cols-[1.15fr_0.85fr] lg:p-10">
              <div className="flex flex-col justify-between gap-8">
                <div>
                  <EyebrowLabel>Moj nalog</EyebrowLabel>

                  <h1 className="font-display mt-4 max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                    Tvoj prostor za termine i kontakt podatke.
                  </h1>

                  <p className="mt-4 max-w-xl text-sm leading-6 text-muted sm:text-base">
                    Proveri status termina, osvezi kontakt informacije i nastavi
                    ka salonima koji se uklapaju u tvoje navike.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <StatCard label="Aktivni termini" value={stats.active} />
                  <StatCard label="Zavrseni termini" value={stats.completed} />
                  <StatCard label="Ukupno termina" value={stats.total} />
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/80 bg-white/82 p-5 shadow-softer backdrop-blur">
                {loading ? (
                  <div className="h-48 animate-pulse rounded-[1.25rem] bg-[var(--background-soft)]" />
                ) : (
                  <div>
                    <div className="flex items-center gap-4">
                      <Avatar name={profile?.displayName || "Korisnik"} size={76} />

                      <div className="min-w-0">
                        <p className="font-display text-2xl font-semibold truncate">
                          {profile?.displayName || "Korisnik"}
                        </p>
                        <p className="mt-1 truncate text-sm text-muted">
                          {profile?.email}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-3">
                      <ProfileLine
                        label="Telefon"
                        value={profile?.phone || "Telefon nije unet"}
                        icon={<PhoneIcon width={16} height={16} />}
                      />
                      <ProfileLine
                        label="Sledeci korak"
                        value={
                          stats.active > 0
                            ? "Imas aktivan termin"
                            : "Pronadji novi salon"
                        }
                        icon={<CalendarIcon width={16} height={16} />}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-6 pb-20 pt-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-10">
          <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-6 shadow-soft sm:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                  <PhoneIcon width={20} height={20} />
                </span>
                <h2 className="font-display mt-4 text-2xl font-semibold">
                  Kontakt informacije
                </h2>
                <p className="mt-1 max-w-lg text-sm leading-6 text-muted">
                  Ovi podaci pomazu salonima da te lakse kontaktiraju oko
                  termina.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-7 grid gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="displayName">Ime i prezime</Label>
                  <Input
                    id="displayName"
                    value={form.displayName}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        displayName: e.target.value,
                      }))
                    }
                    disabled={loading || saving}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+381 6x xxx xxxx"
                    value={form.phone}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    disabled={loading || saving}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email adresa</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile?.email || ""}
                  disabled
                  className="bg-[var(--background-soft)] text-muted"
                />
              </div>

              {message && (
                <p className="rounded-2xl border border-[#bfe2cf] bg-success-soft px-4 py-3 text-sm text-[#2f6a51]">
                  {message}
                </p>
              )}

              {error && (
                <p className="rounded-2xl border border-[#ecc0c8] bg-danger-soft px-4 py-3 text-sm text-[#8a3948]">
                  {error}
                </p>
              )}

              <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-5 text-muted">
                  Email se koristi za prijavu i trenutno ga nije moguce izmeniti
                  ovde.
                </p>
                <Button type="submit" disabled={loading || saving}>
                  {saving ? "Cuvanje..." : "Sacuvaj izmene"}
                </Button>
              </div>
            </form>
          </div>

          <aside className="space-y-4">
            <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-5 shadow-soft">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                    Brze akcije
                  </p>
                  <h2 className="font-display mt-1 text-2xl font-semibold">
                    Nastavi dalje
                  </h2>
                </div>
                <SparkleIcon className="text-primary" />
              </div>

              <div className="mt-5 grid gap-3">
                <QuickLink
                  href="/appointments"
                  title="Moji termini"
                  text="Aktivni termini i istorija poseta."
                  icon={<CalendarIcon width={18} height={18} />}
                />
                <QuickLink
                  href="/recommended"
                  title="Preporuceni saloni"
                  text="Saloni prema tvojim aktivnostima."
                  icon={<HeartIcon width={18} height={18} />}
                />
                <QuickLink
                  href="/salons"
                  title="Zakazi novi termin"
                  text="Pronadji salon i izaberi uslugu."
                  icon={<SparkleIcon width={18} height={18} />}
                />
              </div>
            </div>

            <LatestAppointment appointments={appointments} />
          </aside>
        </section>
      </main>

      <Footer />
    </>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-softer backdrop-blur">
      <p className="font-display text-3xl font-semibold text-primary">
        {value}
      </p>
      <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-muted">
        {label}
      </p>
    </div>
  );
}

function ProfileLine({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--background-soft)]/70 p-3">
      <span className="grid size-9 place-items-center rounded-xl bg-white text-primary">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          {label}
        </p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function QuickLink({
  href,
  title,
  text,
  icon,
}: {
  href: string;
  title: string;
  text: string;
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-[var(--border)] bg-[var(--background-soft)]/60 p-4 transition hover:border-primary/60 hover:bg-white"
    >
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white text-primary shadow-softer">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-semibold">{title}</h3>
          <p className="mt-0.5 text-sm text-muted">{text}</p>
        </div>
        <ArrowRightIcon
          width={16}
          height={16}
          className="shrink-0 text-muted transition group-hover:translate-x-1 group-hover:text-primary"
        />
      </div>
    </Link>
  );
}

function LatestAppointment({
  appointments,
}: {
  appointments: UserAppointment[];
}) {
  const latest = appointments[0];

  return (
    <div className="rounded-[1.5rem] border border-[var(--border)] bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Pregled
          </p>
          <h2 className="font-display mt-1 text-2xl font-semibold">
            Poslednji termin
          </h2>
        </div>
        <CalendarIcon className="text-primary" />
      </div>

      {latest ? (
        <div className="mt-5 rounded-2xl bg-[var(--background-soft)]/70 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-semibold">{latest.salonName}</p>
              <p className="mt-1 text-sm text-muted">
                {latest.appointmentDate} u {String(latest.startTime).slice(0, 5)}
              </p>
            </div>
            <StatusBadge status={latest.status} />
          </div>

          <Link
            href="/appointments"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary"
          >
            Vidi sve termine
            <ArrowRightIcon width={15} height={15} />
          </Link>
        </div>
      ) : (
        <div className="mt-5 rounded-2xl bg-[var(--background-soft)]/70 p-4">
          <p className="text-sm font-medium">Jos nema termina.</p>
          <p className="mt-1 text-sm text-muted">
            Kada zakazes termin, ovde ce se pojaviti kratak pregled.
          </p>
        </div>
      )}
    </div>
  );
}
