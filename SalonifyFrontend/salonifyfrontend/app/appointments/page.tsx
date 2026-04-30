"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
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

import { AppointmentStatus, UserAppointment } from "@/types/appointments";
import { cancelAppointment, getUserAppointments } from "@/services/appointment";
import { getImageUrl } from "../lib/imageUrl";

const TABS: ("All" | AppointmentStatus)[] = [
  "All",
  "Pending",
  "Approved",
  "Completed",
  "Cancelled",
  "Rejected",
];

const STATUS_MAP: Record<number, AppointmentStatus> = {
  0: "Pending",
  1: "Approved",
  2: "Rejected",
  3: "Cancelled",
  4: "Completed",
};

const SERVICE_TYPE_LABELS: Record<string, string> = {
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

  Haircut: "Šišanje",
  Coloring: "Farbanje",
  Styling: "Stilizovanje",
  Manicure: "Manikir",
  Pedicure: "Pedikir",
  Makeup: "Šminkanje",
  Massage: "Masaža",
  Facial: "Tretman lica",
  Waxing: "Depilacija",
  SpaTreatment: "Spa tretman",
  NailArt: "Nail art",
  Other: "Ostalo",
};

function normalizeStatus(status: AppointmentStatus | number): AppointmentStatus {
  if (typeof status === "number") {
    return STATUS_MAP[status] ?? "Pending";
  }

  return status;
}

function serviceLabel(serviceType: string | number) {
  return SERVICE_TYPE_LABELS[String(serviceType)] ?? String(serviceType);
}

function formatDate(date: string) {
  const datePart = date.includes("T") ? date.split("T")[0] : date;
  const [year, month, day] = datePart.split("-").map(Number);

  const months = [
    "januar",
    "februar",
    "mart",
    "april",
    "maj",
    "jun",
    "jul",
    "avgust",
    "septembar",
    "oktobar",
    "novembar",
    "decembar",
  ];

  return `${String(day).padStart(2, "0")}. ${months[month - 1]} ${year}.`;
}
function formatTime(time: string) {
  return time?.slice(0, 5);
}

function getDuration(startTime: string, endTime: string) {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);

  const start = sh * 60 + sm;
  const end = eh * 60 + em;

  return end - start;
}

export default function AppointmentsPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");
  const [appts, setAppts] = useState<UserAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const data = await getUserAppointments();

        const normalized = data.map((a) => ({
          ...a,
          status: normalizeStatus(a.status),
        }));

        setAppts(normalized);
      } catch (error) {
        console.error("Greška pri učitavanju termina:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, []);

  const filtered = useMemo(() => {
    return appts.filter((a) => (tab === "All" ? true : a.status === tab));
  }, [appts, tab]);

  const counts = {
    upcoming: appts.filter((a) => ["Pending", "Approved"].includes(a.status))
      .length,
    completed: appts.filter((a) => a.status === "Completed").length,
    cancelled: appts.filter(
      (a) => a.status === "Cancelled" || a.status === "Rejected",
    ).length,
  };

  const cancel = async (id: string) => {
    try {
      setCancelingId(id);

      await cancelAppointment(id);

      setAppts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "Cancelled" } : a)),
      );
    } catch (error) {
      console.error("Greška pri otkazivanju termina:", error);
    } finally {
      setCancelingId(null);
    }
  };

  return (
    <>
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 lg:px-10 pt-10 lg:pt-14">
        <div className="grid lg:grid-cols-[1.3fr_1fr] gap-8 items-end">
          <div>
            <EyebrowLabel>Moji termini</EyebrowLabel>

            <h1 className="font-display mt-4 text-4xl sm:text-5xl font-semibold tracking-tight">
              Tvoji beauty rituali ✿
            </h1>

            <p className="mt-3 text-muted max-w-xl">
              Ovde možeš da pratiš zakazane termine, vidiš istoriju poseta i
              otkažeš termin ako se planovi promene.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Stat
              n={counts.upcoming}
              l="Aktivni"
              tint="bg-primary-soft text-[#5b3e8a]"
            />
            <Stat
              n={counts.completed}
              l="Završeni"
              tint="bg-info-soft text-[#3e4a72]"
            />
            <Stat
              n={counts.cancelled}
              l="Otkazani"
              tint="bg-danger-soft text-[#8a3948]"
            />
          </div>
        </div>
      </section>

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
              {t === "All" ? "Svi" : t}

              <span className="ml-2 text-[11px] opacity-80">
                {t === "All"
                  ? appts.length
                  : appts.filter((a) => a.status === t).length}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          {loading ? (
            <LoadingState />
          ) : filtered.length === 0 ? (
            <Empty />
          ) : (
            filtered.map((a) => (
              <AppointmentRow
                key={a.id}
                a={a}
                onCancel={cancel}
                isCanceling={cancelingId === a.id}
              />
            ))
          )}
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
  isCanceling,
}: {
  a: UserAppointment;
  onCancel: (id: string) => void;
  isCanceling: boolean;
}) {
  const cancellable = a.status === "Pending" || a.status === "Approved";
  const duration = getDuration(a.startTime, a.endTime);

  return (
    <div className="bg-white rounded-3xl border border-[var(--border)] shadow-softer overflow-hidden hover-lift">
      <div className="grid md:grid-cols-[200px_1fr_auto] gap-0">
        <div className="relative aspect-[5/3] md:aspect-auto md:min-h-full">
          <Image
            src={getImageUrl(a.serviceImageUrl)}
            alt={String(a.serviceType || serviceLabel(a.serviceType))}
            fill
            sizes="(max-width: 768px) 100vw, 200px"
            className="object-cover"
            unoptimized
          />
        </div>

        <div className="p-5 md:p-6 flex flex-col justify-center gap-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
                {a.salonName || "Nepoznat salon"}
              </p>

              <h3 className="font-display mt-1 text-xl font-semibold">
                {serviceLabel(a.serviceType)}
              </h3>
            </div>

            <StatusBadge status={a.status} />
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="inline-flex items-center gap-1.5 text-foreground/80">
              <CalendarIcon width={14} height={14} className="text-primary" />
              {formatDate(a.appointmentDate)}
            </span>

            <span className="inline-flex items-center gap-1.5 text-foreground/80">
              <ClockIcon width={14} height={14} className="text-primary" />
              {formatTime(a.startTime)} - {formatTime(a.endTime)} · {duration}{" "}
              min
            </span>

            <span className="inline-flex items-center gap-1.5 text-foreground/80">
              <MapPinIcon width={14} height={14} className="text-primary" />
              Salonify
            </span>

            <span className="inline-flex items-center gap-1.5 font-semibold text-primary">
              {a.price} RSD
            </span>
          </div>

          {a.note && (
            <p className="text-sm text-muted bg-[var(--background-soft)] rounded-2xl px-4 py-2.5 mt-1">
              <span className="font-medium text-foreground/80">Napomena: </span>
              {a.note}
            </p>
          )}
        </div>

        <div className="p-5 md:p-6 md:pl-0 flex md:flex-col gap-2 md:justify-center md:min-w-[180px]">
          <LinkButton href={`/salons/${a.slug}`} variant="outline" size="sm">
            Vidi salon
          </LinkButton>

          {cancellable ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCancel(a.id)}
              disabled={isCanceling}
              className="!text-[#8a3948] hover:!bg-danger-soft"
            >
              <XIcon width={14} height={14} />
              {isCanceling ? "Otkazivanje..." : "Otkaži"}
            </Button>
          ) : a.status === "Completed" ? (
            <LinkButton
              href={`/salons/${a.slug}#reviews`}
              variant="soft"
              size="sm"
            >
              <SparkleIcon width={14} height={14} />
              Ostavi recenziju
            </LinkButton>
          ) : (
            <LinkButton href={`/salons/${a.salonId}`} variant="soft" size="sm">
              <HeartIcon width={14} height={14} />
              Zakaži opet
            </LinkButton>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="h-44 bg-white rounded-3xl border border-[var(--border)] shadow-softer animate-pulse"
        />
      ))}
    </div>
  );
}

function Empty() {
  return (
    <div className="bg-white rounded-3xl border border-[var(--border)] shadow-softer p-14 text-center">
      <Avatar name="✿" size={56} />

      <h3 className="font-display mt-5 text-2xl font-semibold">Nema termina</h3>

      <p className="mt-2 text-sm text-muted max-w-md mx-auto">
        Kada zakažeš termin, pojaviće se ovde. Spremna za sledeći beauty ritual?
      </p>

      <LinkButton href="/salons" className="mt-6" size="sm">
        Pronađi salone <ArrowRightIcon width={14} height={14} />
      </LinkButton>
    </div>
  );
}