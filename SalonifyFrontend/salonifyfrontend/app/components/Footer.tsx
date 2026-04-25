import Link from "next/link";
import {
  FlowerIcon,
  InstagramIcon,
  GlobeIcon,
  HeartIcon,
} from "./Icons";

export default function Footer() {
  return (
    <footer className="relative mt-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="rounded-[2.5rem] bg-white/70 border border-white/80 shadow-softer p-10 lg:p-14 overflow-hidden relative">
          <div className="absolute -top-24 -right-24 size-64 rounded-full bg-gradient-to-br from-primary-soft to-[#fde7ef] blur-3xl opacity-70" />
          <div className="absolute -bottom-24 -left-24 size-64 rounded-full bg-gradient-to-br from-[#fde7ef] to-primary-soft blur-3xl opacity-60" />

          <div className="relative grid gap-12 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
            {/* BRAND */}
            <div>
              <Link href="/" className="flex items-center gap-2.5 mb-5">
                <span className="inline-flex items-center justify-center size-10 rounded-2xl bg-gradient-to-br from-primary to-[#d7a2ec] text-white shadow-soft">
                  <FlowerIcon width={22} height={22} />
                </span>

                <span className="font-display text-2xl font-semibold">
                  Salonify
                </span>
              </Link>

              <p className="text-sm text-muted leading-relaxed max-w-sm">
                Jednostavniji način da zakažeš beauty termin. Pronađi proverene
                salone, vidi slobodne termine i upravljaj zakazivanjima na
                jednom mestu.
              </p>

              <div className="mt-6 flex items-center gap-3">
                <a
                  href="#"
                  className="size-10 rounded-full bg-white border border-[var(--border)] grid place-items-center hover:text-primary hover:border-primary transition"
                  aria-label="Instagram"
                >
                  <InstagramIcon />
                </a>

                <a
                  href="#"
                  className="size-10 rounded-full bg-white border border-[var(--border)] grid place-items-center hover:text-primary hover:border-primary transition"
                  aria-label="Website"
                >
                  <GlobeIcon />
                </a>
              </div>
            </div>

            {/* COL 1 */}
            <FooterCol
              title="Istraži"
              links={[
                { href: "/salons", label: "Pregled salona" },
                { href: "/salons", label: "Popularne usluge" },
                { href: "/reviews", label: "Recenzije korisnika" },
              ]}
            />

            {/* COL 2 */}
            <FooterCol
              title="Za korisnike"
              links={[
                { href: "/appointments", label: "Moji termini" },
                { href: "/login", label: "Prijava" },
                { href: "/register", label: "Registracija" },
              ]}
            />

            {/* COL 3 */}
            <FooterCol
              title="Za salone"
              links={[
                { href: "/dashboard", label: "Salon dashboard" },
                { href: "/register", label: "Registruj salon" },
                { href: "/dashboard", label: "Upravljanje terminima" },
              ]}
            />
          </div>

          {/* BOTTOM */}
          <div className="relative mt-12 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted">
            <p>
              © {new Date().getFullYear()} Salonify. Sva prava zadržana.
            </p>

            <p className="inline-flex items-center gap-1.5">
              Napravljeno sa{" "}
              <HeartIcon
                width={14}
                height={14}
                className="text-accent"
              />{" "}
              za lepše iskustvo zakazivanja.
            </p>
          </div>
        </div>
      </div>

      <div className="h-16" />
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">
        {title}
      </h4>

      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="text-sm text-foreground/80 hover:text-primary transition"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}