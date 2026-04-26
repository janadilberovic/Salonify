import Link from "next/link";
import type { ReactNode } from "react";
import { FlowerIcon, StarIcon } from "./Icons";
import { Avatar } from "./ui";

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      {/* Left side */}
      <aside className="relative hidden lg:block overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f3dff0] via-[#ecd9f5] to-[#e4cef0]" />
        <div className="absolute -top-20 -left-16 size-80 rounded-full bg-white/40 blur-3xl" />
        <div className="absolute -bottom-24 -right-10 size-80 rounded-full bg-primary/25 blur-3xl" />

        <div className="relative h-full p-14 flex flex-col justify-between">
          <Link href="/" className="inline-flex items-center gap-2.5 w-fit">
            <span className="inline-flex items-center justify-center size-10 rounded-2xl bg-gradient-to-br from-primary to-[#d7a2ec] text-white shadow-soft">
              <FlowerIcon width={22} height={22} />
            </span>

            <span className="font-display text-2xl font-semibold">
              Salonify
            </span>
          </Link>

          <div className="max-w-md">
            <p className="text-sm uppercase tracking-[0.25em] text-primary font-medium">
              Kreiraj nalog
            </p>

            <h2 className="mt-4 font-display text-5xl leading-tight font-semibold text-foreground">
              Lepota počinje{" "}
              <span className="italic text-primary">
                jednim klikom
              </span>
              .
            </h2>

            <p className="mt-5 text-foreground/70 leading-relaxed text-lg">
              Registruj se kao korisnik ili salon i zakazuj,
              upravljaj terminima i razvijaj svoj beauty biznis
              jednostavno i elegantno.
            </p>

            <div className="mt-10 bg-white/80 backdrop-blur rounded-3xl p-6 border border-white/80 shadow-soft max-w-sm">
              <div className="flex items-center gap-1 text-[var(--gold)]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon key={i} width={16} height={16} />
                ))}
              </div>

              <p className="mt-3 text-sm leading-relaxed text-foreground/85">
                &ldquo;Salonify mi je olakšao zakazivanje termina.
                Sve je pregledno, brzo i lepo organizovano.&rdquo;
              </p>

              <div className="mt-4 flex items-center gap-3">
                <Avatar name="Mila Jovanović" size={36} />

                <div>
                  <p className="text-sm font-semibold">
                    Mila Jovanović
                  </p>
                  <p className="text-xs text-muted">
                    Korisnik od 2023.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted">
            © {new Date().getFullYear()} Salonify — kreirano sa stilom.
          </p>
        </div>
      </aside>

      {/* Right side */}
      <section className="relative flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="lg:hidden inline-flex items-center gap-2.5 mb-10"
          >
            <span className="inline-flex items-center justify-center size-9 rounded-2xl bg-gradient-to-br from-primary to-[#d7a2ec] text-white shadow-soft">
              <FlowerIcon width={20} height={20} />
            </span>

            <span className="font-display text-2xl font-semibold">
              Salonify
            </span>
          </Link>

          <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight">
            {title}
          </h1>

          <p className="mt-3 text-muted">{subtitle}</p>

          <div className="mt-10">{children}</div>

          {footer && (
            <div className="mt-8 text-center text-sm text-muted">
              {footer}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}