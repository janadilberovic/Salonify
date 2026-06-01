"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Avatar,
  Button,
  Card,
  EyebrowLabel,
  Input,
  Label,
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

      <main className="mx-auto max-w-7xl px-6 lg:px-10 py-10 lg:py-14">
        <section className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
          <div>
            <EyebrowLabel>Moj nalog</EyebrowLabel>

            <h1 className="font-display mt-4 text-4xl sm:text-5xl font-semibold tracking-tight">
              Mini dashboard
            </h1>

            <p className="mt-3 text-muted max-w-xl">
              Uredi kontakt informacije i brzo nastavi ka terminima,
              preporukama ili novom zakazivanju.
            </p>
          </div>

          <Card className="p-6">
            {loading ? (
              <div className="h-28 animate-pulse rounded-2xl bg-[var(--background-soft)]" />
            ) : (
              <div className="flex items-center gap-4">
                <Avatar name={profile?.displayName || "Korisnik"} size={64} />

                <div className="min-w-0">
                  <p className="font-display text-2xl font-semibold truncate">
                    {profile?.displayName || "Korisnik"}
                  </p>
                  <p className="text-sm text-muted truncate">{profile?.email}</p>
                  <p className="mt-1 text-sm text-foreground/80">
                    {profile?.phone || "Telefon nije unet"}
                  </p>
                </div>
              </div>
            )}
          </Card>
        </section>

        <section className="mt-8 grid md:grid-cols-3 gap-4">
          <StatCard label="Aktivni termini" value={stats.active} />
          <StatCard label="Zavrseni termini" value={stats.completed} />
          <StatCard label="Ukupno termina" value={stats.total} />
        </section>

        <section className="mt-8 grid lg:grid-cols-[1fr_0.8fr] gap-6">
          <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-semibold">
                  Kontakt informacije
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Ovi podaci pomazu salonima da te lakse kontaktiraju oko
                  termina.
                </p>
              </div>

              <PhoneIcon width={22} height={22} className="text-primary" />
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
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

              <div className="flex justify-end">
                <Button type="submit" disabled={loading || saving}>
                  {saving ? "Cuvanje..." : "Sacuvaj izmene"}
                </Button>
              </div>
            </form>
          </Card>

          <div className="space-y-4">
            <QuickLink
              href="/appointments"
              title="Moji termini"
              text="Pogledaj aktivne termine i istoriju poseta."
              icon={<CalendarIcon width={18} height={18} />}
            />
            <QuickLink
              href="/recommended"
              title="Preporuceni saloni"
              text="Vidi salone izabrane prema tvojim aktivnostima."
              icon={<HeartIcon width={18} height={18} />}
            />
            <QuickLink
              href="/salons"
              title="Zakazi novi termin"
              text="Pronadji salon i izaberi uslugu."
              icon={<SparkleIcon width={18} height={18} />}
            />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-5">
      <p className="font-display text-3xl font-semibold text-primary">{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </Card>
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
      className="group block rounded-3xl border border-[var(--border)] bg-white p-5 shadow-softer hover-lift"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="grid size-10 place-items-center rounded-2xl bg-primary-soft text-primary">
          {icon}
        </span>
        <ArrowRightIcon
          width={16}
          height={16}
          className="text-muted transition group-hover:translate-x-1 group-hover:text-primary"
        />
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted">{text}</p>
    </Link>
  );
}
