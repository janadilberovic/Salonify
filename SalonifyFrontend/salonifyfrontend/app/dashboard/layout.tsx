"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import {
  CalendarIcon,
  ClockIcon,
  DashboardIcon,
  ScissorsIcon,
  SettingsIcon,
  UserIcon,
} from "../components/Icons";

import { useMySalon } from "@/hooks/salon/UseMySalon";

const SECTIONS = [
  { href: "/dashboard", label: "Pregled", icon: DashboardIcon },
  { href: "/dashboard/appointments", label: "Termini", icon: CalendarIcon },
  { href: "/dashboard/services", label: "Usluge", icon: ScissorsIcon },
  { href: "/dashboard/hours", label: "Radno vreme", icon: ClockIcon },
  { href: "/dashboard/profile", label: "Profil salona", icon: UserIcon },

];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { salon, loading } = useMySalon();

  return (
    <>
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 lg:px-10 pt-10 pb-20">
        <div className="grid lg:grid-cols-[260px_1fr] gap-8">
          <aside className="lg:sticky lg:top-24 self-start">
            <div className="bg-white rounded-3xl border border-[var(--border)] shadow-softer p-5">
              {/* Header salona */}
              <div className="flex items-center gap-3 p-2">
                <div className="relative size-12 rounded-2xl overflow-hidden shrink-0 bg-primary-soft">
                  <Image
                    src={salon?.cover || "/images/salon-placeholder.jpg"}
                    alt={salon?.name || "Salon"}
                    fill
                    sizes="100vw"
                    className="object-cover"
                    unoptimized
                  />
                </div>

                <div className="min-w-0">
                  <p className="font-display text-base font-semibold truncate">
                    {loading ? "Učitavanje..." : salon?.name || "Moj salon"}
                  </p>

                  <p className="text-xs text-muted">Salon dashboard</p>
                </div>
              </div>

              {/* Navigacija */}
              <nav className="mt-5 space-y-1">
                {SECTIONS.map((item) => {
                  const Icon = item.icon;

                  const active =
                    pathname === item.href ||
                    (item.href !== "/dashboard" &&
                      pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition ${
                        active
                          ? "bg-primary text-white shadow-soft"
                          : "text-foreground/80 hover:bg-primary-soft/50 hover:text-primary"
                      }`}
                    >
                      <Icon width={16} height={16} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <main>{children}</main>
        </div>
      </section>

      <Footer />
    </>
  );
}
