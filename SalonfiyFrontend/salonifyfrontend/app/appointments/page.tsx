"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  StatusBadge,
  EyebrowLabel,
  LinkButton,
  Button,
  Avatar,
} from "../components/ui";
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  ArrowRightIcon,
  XIcon,
  SparkleIcon,
  HeartIcon,
} from "../components/Icons";
import { USER_APPOINTMENTS, SALONS } from "../lib/data";
import type { Appointment } from "../lib/data";
import type { AppointmentStatus } from "../components/ui";

const TABS: ("All" | AppointmentStatus)[] = [
  "All",
  "Pending",
  "Approved",
  "Completed",
  "Cancelled",
  "Rejected",
];

export default function AppointmentsPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");
  const [appts, setAppts] = useState<Appointment[]>(USER_APPOINTMENTS);

  const filtered = appts.filter((a) =>
    tab === "All" ? true : a.status === tab,
  );

  const cancel = (id: string) =>
    setAppts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "Cancelled" } : a)),
    );

  const counts = {
    upcoming: appts.filter((a) =>
      ["Pending", "Approved"].includes(a.status),
    ).length,
    completed: appts.filter((a) => a.status === "Completed").length,
    cancelled: appts.filter(
      (a) => a.status === "Cancelled" || a.status === "Rejected",
    ).length,
  };

  return (
    <>
      <Navbar />

      {/* HEADER */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 pt-10 lg:pt-14">
        <div className="grid lg:grid-cols-[1.3fr_1fr] gap-8 items-end">
          <div>
            <EyebrowLabel>Your appointments</EyebrowLabel>
            <h1 className="font-display mt-4 text-4xl sm:text-5xl font-semibold tracking-tight">
              Hello, Mila ✿
            </h1>
            <p className="mt-3 text-muted max-w-xl">
              Every ritual you&rsquo;ve booked, tidy and in order. Review past
              visits, confirm upcoming ones or quickly rebook a favorite.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Stat n={counts.upcoming} l="Upcoming" tint="bg-primary-soft text-[#5b3e8a]" />
            <Stat n={counts.completed} l="Completed" tint="bg-info-soft text-[#3e4a72]" />
            <Stat n={counts.cancelled} l="Cancelled" tint="bg-danger-soft text-[#8a3948]" />
          </div>
        </div>
      </section>

      {/* TABS */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 mt-10">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-sm font-medium px-4 py-2 rounded-full border transition shrink-0 ${
                tab === t
                  ? "bg-primary text-white border-primary shadow-soft"
                  : "bg-white border-[var(--border)] hover:border-primary hover:text-primary"
              }`}
            >
              {t}
              <span className="ml-2 text-[11px] opacity-80">
                {t === "All"
                  ? appts.length
                  : appts.filter((a) => a.status === t).length}
              </span>
            </button>
          ))}
        </div>

        {/* LIST */}
        <div className="mt-6 space-y-4">
          {filtered.length === 0 && <Empty />}
          {filtered.map((a) => (
            <AppointmentRow key={a.id} a={a} onCancel={cancel} />
          ))}
        </div>
      </section>

      {/* REBOOK */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 mt-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <EyebrowLabel>Rebook a favorite</EyebrowLabel>
            <h2 className="font-display mt-3 text-3xl font-semibold">
              Your go-to salons
            </h2>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SALONS.slice(0, 3).map((s) => (
            <Link
              key={s.id}
              href={`/salons/${s.slug}`}
              className="bg-white rounded-3xl border border-[var(--border)] shadow-softer p-5 flex items-center gap-4 hover-lift"
            >
              <div className="relative size-16 rounded-2xl overflow-hidden shrink-0">
                <Image
                  src={s.cover}
                  alt={s.name}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{s.name}</p>
                <p className="text-xs text-muted truncate">{s.city}</p>
              </div>
              <span className="size-8 rounded-full bg-primary-soft text-primary grid place-items-center">
                <ArrowRightIcon width={14} height={14} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}

function Stat({ n, l, tint }: { n: number; l: string; tint: string }) {
  return (
    <div className="bg-white rounded-2xl border border-[var(--border)] p-4 text-center shadow-softer">
      <span
        className={`inline-flex items-center justify-center size-10 rounded-xl ${tint} font-display text-lg font-semibold`}
      >
        {n}
      </span>
      <p className="text-xs mt-2 uppercase tracking-[0.15em] text-muted">{l}</p>
    </div>
  );
}

function AppointmentRow({
  a,
  onCancel,
}: {
  a: Appointment;
  onCancel: (id: string) => void;
}) {
  const cancellable = a.status === "Pending" || a.status === "Approved";
  return (
    <div className="bg-white rounded-3xl border border-[var(--border)] shadow-softer overflow-hidden hover-lift">
      <div className="grid md:grid-cols-[200px_1fr_auto] gap-0">
        <div className="relative aspect-[5/3] md:aspect-auto md:min-h-full">
          <Image
            src={a.salonCover}
            alt={a.salonName}
            fill
            sizes="(max-width: 768px) 100vw, 200px"
            className="object-cover"
          />
        </div>
        <div className="p-5 md:p-6 flex flex-col justify-center gap-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
                {a.salonName}
              </p>
              <h3 className="font-display mt-1 text-xl font-semibold">
                {a.service}
              </h3>
            </div>
            <StatusBadge status={a.status} />
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="inline-flex items-center gap-1.5 text-foreground/80">
              <CalendarIcon width={14} height={14} className="text-primary" />
              {a.date}
            </span>
            <span className="inline-flex items-center gap-1.5 text-foreground/80">
              <ClockIcon width={14} height={14} className="text-primary" />
              {a.time} · {a.duration} min
            </span>
            <span className="inline-flex items-center gap-1.5 text-foreground/80">
              <MapPinIcon width={14} height={14} className="text-primary" />
              {SALONS.find((s) => s.id === a.salonId)?.city}
            </span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-primary">
              €{a.price}
            </span>
          </div>
          {a.note && (
            <p className="text-sm text-muted bg-[var(--background-soft)] rounded-2xl px-4 py-2.5 mt-1">
              <span className="font-medium text-foreground/80">Note: </span>
              {a.note}
            </p>
          )}
        </div>
        <div className="p-5 md:p-6 md:pl-0 flex md:flex-col gap-2 md:justify-center md:min-w-[180px]">
          <LinkButton
            href={`/salons/${SALONS.find((s) => s.id === a.salonId)?.slug}`}
            variant="outline"
            size="sm"
          >
            View salon
          </LinkButton>
          {cancellable ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCancel(a.id)}
              className="!text-[#8a3948] hover:!bg-danger-soft"
            >
              <XIcon width={14} height={14} />
              Cancel
            </Button>
          ) : a.status === "Completed" ? (
            <Button variant="soft" size="sm">
              <SparkleIcon width={14} height={14} />
              Leave review
            </Button>
          ) : (
            <Button variant="soft" size="sm">
              <HeartIcon width={14} height={14} />
              Rebook
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Empty() {
  return (
    <div className="bg-white rounded-3xl border border-[var(--border)] shadow-softer p-14 text-center">
      <Avatar name="✿" size={56} />
      <h3 className="font-display mt-5 text-2xl font-semibold">
        Nothing here yet
      </h3>
      <p className="mt-2 text-sm text-muted max-w-md mx-auto">
        When you book an appointment it&rsquo;ll show up here. Ready to find
        your next ritual?
      </p>
      <LinkButton href="/salons" className="mt-6" size="sm">
        Discover salons <ArrowRightIcon width={14} height={14} />
      </LinkButton>
    </div>
  );
}
