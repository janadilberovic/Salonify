"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import {
  DashboardIcon,
  ScissorsIcon,
  StarIcon,
  UserIcon,
} from "../components/Icons";

const SECTIONS = [
  { href: "/admin", label: "Pregled", icon: DashboardIcon },
  { href: "/admin/users", label: "Korisnici", icon: UserIcon },
  { href: "/admin/salons", label: "Saloni", icon: ScissorsIcon },
  { href: "/admin/reviews", label: "Recenzije", icon: StarIcon },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [displayName] = useState(() => {
    if (typeof window === "undefined") {
      return "Admin";
    }

    return localStorage.getItem("displayName") || "Admin";
  });

  return (
    <>
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 lg:px-10 pt-10 pb-20">
        <div className="grid lg:grid-cols-[260px_1fr] gap-8">
          <aside className="lg:sticky lg:top-24 self-start">
            <div className="bg-white rounded-3xl border border-[var(--border)] shadow-softer p-5">
              <div className="flex items-center gap-3 p-2">
                <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary">
                  <DashboardIcon width={20} height={20} />
                </div>

                <div className="min-w-0">
                  <p className="font-display text-base font-semibold truncate">
                    {displayName}
                  </p>

                  <p className="text-xs text-muted">Admin panel</p>
                </div>
              </div>

              <nav className="mt-5 space-y-1">
                {SECTIONS.map((item) => {
                  const Icon = item.icon;

                  const active =
                    pathname === item.href ||
                    (item.href !== "/admin" && pathname.startsWith(item.href));

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

          <main>{children}</main>
        </div>
      </section>

      <Footer />
    </>
  );
}
