"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LinkButton } from "./ui";
import { BellIcon, FlowerIcon, MenuIcon, XIcon } from "./Icons";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<string | null>(null);
 const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    setRole(localStorage.getItem("role"));
      setName(localStorage.getItem("Name"));
  }, []);

  const isLoggedIn = !!role;
  const isSalon = role === "Salon";
  const isUser = role === "User";
  const isAdmin = role === "Admin";

 const NAV = [
  { href: "/salons", label: "Saloni", show: true },

  { href: "/appointments", label: "Moji termini", show: isUser },

  { href: "/dashboard", label: "Salon dashboard", show: isSalon || isAdmin },

  { href: "/reviews", label: "Recenzije", show: true },
].filter((item) => item.show);
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");

    setRole(null);
    setName(null);
    setOpen(false);

    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40">
      <div className="glass border-b border-white/40">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 h-18 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="inline-flex items-center justify-center size-9 rounded-2xl bg-gradient-to-br from-primary to-[#d7a2ec] text-white shadow-soft group-hover:scale-105 transition">
              <FlowerIcon width={20} height={20} />
            </span>

            <span className="font-display text-2xl font-semibold tracking-tight">
              Salonify
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 bg-white/70 rounded-full p-1 border border-white/80 shadow-softer">
            {NAV.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/" && pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    active
                      ? "bg-primary text-white shadow-soft"
                      : "text-foreground/80 hover:text-primary hover:bg-primary-soft/60"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn && (
              <button
                aria-label="Obaveštenja"
                className="relative size-10 rounded-full bg-white border border-[var(--border)] hover:border-primary hover:text-primary grid place-items-center transition"
              >
                <BellIcon width={18} height={18} />
                <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-accent" />
              </button>
            )}

            {isLoggedIn ? (
              <>
                <span className="text-sm font-medium text-foreground/80">
                  {name}
                </span>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-sm font-medium text-foreground/80 hover:text-primary transition px-2"
                >
                  Odjavi se
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-foreground/80 hover:text-primary transition px-2"
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
            className="md:hidden size-10 rounded-full bg-white border border-[var(--border)] grid place-items-center"
            onClick={() => setOpen((v) => !v)}
            aria-label="Meni"
          >
            {open ? <XIcon /> : <MenuIcon />}
          </button>
        </div>

        {open && (
          <div className="md:hidden px-6 pb-5 space-y-1 bg-white/80">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-3 rounded-2xl text-sm font-medium hover:bg-primary-soft/60"
              >
                {item.label}
              </Link>
            ))}

            <div className="flex gap-2 pt-2">
              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex-1 text-center h-11 rounded-full bg-primary text-white text-sm font-medium"
                >
                  Odjavi se
                </button>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="flex-1 text-center h-11 leading-[2.75rem] rounded-full bg-white border border-[var(--border-strong)] text-sm font-medium"
                  >
                    Prijavi se
                  </Link>

                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="flex-1 text-center h-11 leading-[2.75rem] rounded-full bg-primary text-white text-sm font-medium"
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