"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getAppointmentsForSalon,
  getUserAppointments,
} from "@/services/appointment";
import type { AppointmentApi, UserAppointment } from "@/types/appointments";
import { BellIcon, FlowerIcon, MenuIcon, XIcon } from "./Icons";
import { LinkButton } from "./ui";

type NotificationSummary = {
  count: number;
  pending: number;
  today: number;
  upcoming: number;
};

const emptyNotifications = (): NotificationSummary => ({
  count: 0,
  pending: 0,
  today: 0,
  upcoming: 0,
});

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [notificationSummary, setNotificationSummary] =
    useState<NotificationSummary>(emptyNotifications());
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");

    setRole(storedRole);
    setName(localStorage.getItem("displayName") || localStorage.getItem("Name"));

    if (storedRole === "Salon" || storedRole === "Admin") {
      getAppointmentsForSalon()
        .then((data) => setNotificationSummary(countSalonNotifications(data)))
        .catch(() => setNotificationSummary(emptyNotifications()));
      return;
    }

    if (storedRole === "User") {
      getUserAppointments()
        .then((data) => setNotificationSummary(countUserNotifications(data)))
        .catch(() => setNotificationSummary(emptyNotifications()));
      return;
    }

    setNotificationSummary(emptyNotifications());
  }, []);

  const isLoggedIn = !!role;
  const isSalon = role === "Salon";
  const isUser = role === "User";
  const isAdmin = role === "Admin";
  const notificationsHref =
    isSalon || isAdmin ? "/dashboard/appointments" : "/appointments";

  const NAV = [
    { href: "/salons", label: "Saloni", show: isSalon || isUser || isAdmin },
    { href: "/appointments", label: "Moji termini", show: isUser },
    { href: "/account", label: "Moj profil", show: isUser },
    { href: "/dashboard", label: "Dashboard", show: isSalon || isAdmin },
    { href: "/reviews", label: "Recenzije", show: isSalon || isAdmin },
    { href: "/recommended", label: "Preporuceno", show: isUser },
  ].filter((item) => item.show);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("displayName");
    localStorage.removeItem("Name");
    localStorage.removeItem("id");
    localStorage.removeItem("userId");

    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

    setRole(null);
    setName(null);
    setOpen(false);
    setNotificationsOpen(false);
    setNotificationSummary(emptyNotifications());

    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40">
      <div className="glass border-b border-white/40">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="inline-flex size-9 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[#d7a2ec] text-white shadow-soft transition group-hover:scale-105">
              <FlowerIcon width={20} height={20} />
            </span>

            <span className="font-display text-2xl font-semibold tracking-tight">
              Salonify
            </span>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-white/80 bg-white/70 p-1 shadow-softer md:flex">
            {NAV.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/" && pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-primary text-white shadow-soft"
                      : "text-foreground/80 hover:bg-primary-soft/60 hover:text-primary"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {isLoggedIn && (
              <div className="relative">
                <button
                  aria-label="Obavestenja"
                  className={`relative grid size-10 place-items-center rounded-full border bg-white transition ${
                    notificationsOpen
                      ? "border-primary text-primary shadow-soft"
                      : "border-[var(--border)] hover:border-primary hover:text-primary"
                  }`}
                  onClick={() => setNotificationsOpen((value) => !value)}
                >
                  <BellIcon width={18} height={18} />
                  {notificationSummary.count > 0 && (
                    <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-bold text-white">
                      {notificationSummary.count}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 top-full z-50 mt-3 w-80 overflow-hidden rounded-3xl border border-white/80 bg-white p-3 shadow-lift">
                    {notificationSummary.count > 0 ? (
                      <div className="space-y-2">
                        {(isSalon || isAdmin) &&
                          notificationSummary.pending > 0 && (
                            <NotificationRow
                              title={`${notificationSummary.pending} termina za prihvatanje`}
                              text="Novi zahtevi cekaju odgovor salona."
                            />
                          )}

                        {(isSalon || isAdmin) && notificationSummary.today > 0 && (
                          <NotificationRow
                            title={`${notificationSummary.today} termina danas`}
                            text="Pogledaj raspored za danasnji dan."
                          />
                        )}

                        {isUser && notificationSummary.upcoming > 0 && (
                          <NotificationRow
                            title={`${notificationSummary.upcoming} predstojecih termina`}
                            text="Tvoji aktivni i zakazani termini."
                          />
                        )}
                      </div>
                    ) : (
                      <div className="rounded-2xl bg-[var(--background-soft)] px-4 py-5 text-center">
                        <p className="text-sm font-semibold text-foreground">
                          Nema novih obavestenja
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          Novi termini ce se pojaviti ovde.
                        </p>
                      </div>
                    )}

                    <Link
                      href={notificationsHref}
                      onClick={() => setNotificationsOpen(false)}
                      className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover"
                    >
                      Pogledaj termine
                    </Link>
                  </div>
                )}
              </div>
            )}

            {isLoggedIn ? (
              <>
                <span className="text-sm font-medium text-foreground/80">
                  {name}
                </span>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-2 text-sm font-medium text-foreground/80 transition hover:text-primary"
                >
                  Odjavi se
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-2 text-sm font-medium text-foreground/80 transition hover:text-primary"
                >
                  Prijavi se
                </Link>

                <LinkButton href="/register" size="sm">
                  Registruj se
                </LinkButton>
              </>
            )}
          </div>

          <button
            className="grid size-10 place-items-center rounded-full border border-[var(--border)] bg-white md:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label="Meni"
          >
            {open ? <XIcon /> : <MenuIcon />}
          </button>
        </div>

        {open && (
          <div className="space-y-1 bg-white/80 px-6 pb-5 md:hidden">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block rounded-2xl px-4 py-3 text-sm font-medium hover:bg-primary-soft/60"
              >
                {item.label}
              </Link>
            ))}

            <div className="flex gap-2 pt-2">
              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="h-11 flex-1 rounded-full bg-primary text-center text-sm font-medium text-white"
                >
                  Odjavi se
                </button>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="h-11 flex-1 rounded-full border border-[var(--border-strong)] bg-white text-center text-sm font-medium leading-[2.75rem]"
                  >
                    Prijavi se
                  </Link>

                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="h-11 flex-1 rounded-full bg-primary text-center text-sm font-medium leading-[2.75rem] text-white"
                  >
                    Registruj se
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function NotificationRow({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--background-soft)] px-4 py-3">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted">{text}</p>
    </div>
  );
}

function countUserNotifications(
  appointments: UserAppointment[]
): NotificationSummary {
  const upcoming = appointments.filter(isUpcomingAppointment).length;

  return {
    count: upcoming,
    pending: 0,
    today: 0,
    upcoming,
  };
}

function countSalonNotifications(
  appointments: AppointmentApi[]
): NotificationSummary {
  const todayDate = getTodayDateKey();
  const pending = appointments.filter(
    (appointment) => normalizeStatus(appointment.status) === "Pending"
  ).length;
  const today = appointments.filter((appointment) => {
    const status = normalizeStatus(appointment.status);

    return (
      appointment.appointmentDate.slice(0, 10) === todayDate &&
      (status === "Pending" || status === "Approved")
    );
  }).length;

  return {
    count: pending + today,
    pending,
    today,
    upcoming: 0,
  };
}

function isUpcomingAppointment(appointment: UserAppointment) {
  const status = normalizeStatus(appointment.status);

  if (status !== "Pending" && status !== "Approved") {
    return false;
  }

  const appointmentDateTime = getAppointmentDateTime(
    appointment.appointmentDate,
    appointment.startTime
  );

  if (!appointmentDateTime) {
    return true;
  }

  return appointmentDateTime.getTime() >= Date.now();
}

function normalizeStatus(status: UserAppointment["status"]) {
  const normalized = String(status);

  if (normalized === "0") return "Pending";
  if (normalized === "1") return "Approved";
  if (normalized === "2") return "Rejected";
  if (normalized === "3") return "Cancelled";
  if (normalized === "4") return "Completed";

  return status;
}

function getAppointmentDateTime(date: string, time: string) {
  const datePart = String(date).slice(0, 10);
  const timePart = String(time || "00:00").slice(0, 5);
  const parsed = new Date(`${datePart}T${timePart}:00`);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getTodayDateKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
