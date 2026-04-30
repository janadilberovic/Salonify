"use client"
import Link from "next/link";
import Image from "next/image";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SalonCard from "./components/SalonCard";
import { LinkButton, EyebrowLabel, Rating, Avatar } from "./components/ui";
import { getAllSalons } from "@/services/salon";

import {
  SearchIcon,
  SparkleIcon,
  CalendarIcon,
  HeartIcon,
  StarIcon,
  ArrowRightIcon,
  FlowerIcon,
  CheckIcon,
} from "./components/Icons";
import { SALONS, REVIEWS } from "./lib/data";
import { useEffect, useState } from "react";
import { Review } from "@/types/Review";

export default function Home() {
   const [loading, setLoading] = useState(true);
   const[averageRating,setAverageRating]=useState<number | null>(null);
    const[ratings,setRatings]=useState<Review[] | null>(null);
    const [salons, setSalons] = useState<any[]>([]);
   useEffect(() => {
      loadSalons();
    }, []);
  
    async function loadSalons() {
      try {
        setLoading(true);
        const data = await getAllSalons();
        console.log("saloni", data);
        setSalons(data);
      } catch (error) {
        console.error("Greška pri učitavanju salona:", error);
      } finally {
        setLoading(false);
      }
    }
  const featured = salons.slice(0, 3);

  return (
    <>
      <Navbar />

      {/* -------- HERO -------- */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-14 lg:pt-20 pb-10">
          <div className="grid lg:grid-cols-[1.05fr_1fr] gap-12 items-center">
            <div className="relative">
              <EyebrowLabel>Lepota zakazana jednostavno</EyebrowLabel>
              <h1 className="font-display mt-5 text-5xl sm:text-6xl lg:text-7xl leading-[1.02] font-semibold tracking-tight">
                Vaši omiljeni saloni,{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 italic text-primary">
                    na jedan klik 
                  </span>
                  <span className="absolute -bottom-1 left-0 right-0 h-3 bg-primary-soft rounded-full -z-0" />
                </span>{" "}
                od Vas.
              </h1>
              <p className="mt-6 text-lg text-muted max-w-xl leading-relaxed">
               Pronađi salone lepote u svom gradu, pogledaj usluge, slobodne
                termine i zakaži tretman brzo i jednostavno — bez poziva i
                poruka.
              </p>

              <div className="mt-8 bg-white rounded-full border border-[var(--border-strong)] shadow-soft p-2 pl-5 flex items-center gap-2">
                <SearchIcon className="text-primary shrink-0" />
                <input
                  placeholder="Search salons, services, or a city…"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-soft"
                />
                <LinkButton href="/salons" size="sm">
                  Pretraži
                  <ArrowRightIcon width={14} height={14} />
                </LinkButton>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted">Popular:</span>
                {["Balayage", "Facials", "Gel manicure", "Lash extensions"].map(
                  (t) => (
                    <Link
                      key={t}
                      href="/salons"
                      className="text-xs font-medium px-3 py-1.5 rounded-full bg-white border border-[var(--border)] hover:border-primary hover:text-primary transition"
                    >
                      {t}
                    </Link>
                  ),
                )}
              </div>

              <div className="mt-10 flex items-center gap-6">
                <div className="flex -space-x-3">
                  <Avatar name="Mila J" size={40} />
                  <Avatar name="Ana P" size={40} />
                  <Avatar name="Nina S" size={40} />
                  <Avatar name="Teodora M" size={40} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <Rating value={4.9} size={14} />
                    <span className="text-sm font-semibold">4.9</span>
                  </div>
                  <p className="text-xs text-muted">
                    12k+ zadovoljnih klijenata
                  </p>
                </div>
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative h-[520px] lg:h-[580px]">
              <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-[#f8dfee] via-[#f3e0f6] to-[#ecd9f5] overflow-hidden">
                <div className="absolute -top-12 -left-12 size-64 rounded-full bg-white/40 blur-3xl" />
                <div className="absolute -bottom-16 -right-16 size-72 rounded-full bg-primary-soft blur-3xl" />
              </div>

              <div className="absolute top-8 right-8 w-[60%] h-[60%] rounded-[2rem] overflow-hidden shadow-lift floaty-slow">
                <Image
                  src="/feniranje.jpg"
                  alt="Salon interior"
                  fill
                  sizes="500px"   
                  className="object-cover"
                  priority
                  unoptimized
                />
              </div>

              <div className="absolute bottom-10 left-6 w-[52%] h-[46%] rounded-[2rem] overflow-hidden shadow-lift floaty">
                <Image
                  src="/salon.jpg"
                  alt="Beauty treatment"
                  fill
                  sizes="400px"
                  className="object-cover"
                />
              </div>

              <div className="absolute top-12 left-6 bg-white rounded-2xl shadow-lift p-4 w-56 floaty">
                <div className="flex items-center gap-3">
                  <span className="size-10 rounded-xl bg-success-soft text-[#2f6a51] grid place-items-center">
                    <CheckIcon />
                  </span>
                  <div>
                    <p className="text-xs text-muted">Termin potvrđen</p>
                    <p className="text-sm font-semibold">Balayage · 11:00</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-8 right-4 bg-white rounded-2xl shadow-lift p-4 w-64 floaty-slow">
                <div className="flex items-center gap-3">
                  <Avatar name="Rose Petal" size={40} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">
                      Rose Petal Atelier
                    </p>
                    <div className="flex items-center gap-1">
                      <StarIcon
                        width={12}
                        height={12}
                        className="text-[var(--gold)]"
                      />
                      <span className="text-xs font-medium">
                        4.9 · 214 recenzija
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <span className="absolute top-1/2 left-2 text-primary floaty">
                <SparkleIcon width={28} height={28} />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* -------- STATS STRIP -------- */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { n: "680+", l: "Salona" },
            { n: "4.9★", l: "Srednja ocena" },
            { n: "12k", l: "Mesečnih rezervacija" },
            { n: "< 60s", l: "Da zakažete Vaš termin" },
          ].map((s) => (
            <div
              key={s.l}
              className="bg-white/80 rounded-3xl border border-white/80 p-5 text-center shadow-softer"
            >
              <p className="font-display text-3xl font-semibold text-primary">
                {s.n}
              </p>
              <p className="text-xs mt-1 uppercase tracking-[0.15em] text-muted">
                {s.l}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* -------- HOW IT WORKS -------- */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 mt-24">
        <div className="text-center max-w-2xl mx-auto">
          <EyebrowLabel>Kako Salonify radi</EyebrowLabel>
          <h2 className="font-display mt-4 text-4xl sm:text-5xl font-semibold tracking-tight">
            Jednostavniji način da{" "}
            <span className="italic text-primary">zakažeš tretman</span>.
          </h2>
          <p className="mt-4 text-muted">
            Tri laka koraka. Bez stresa, čekanja i nepotrebnih poruka.
          </p>
        </div>

        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {[
            {
              icon: SearchIcon,
              title: "Pronađi salon",
              body: "Pretraži salone po gradu, usluzi, ceni ili slobodnim terminima.",
            },
            {
              icon: CalendarIcon,
              title: "Zakaži termin",
              body: "Izaberi uslugu, datum i vreme koje ti odgovara i pošalji zahtev za rezervaciju.",
            },
            {
              icon: HeartIcon,
              title: "Uživaj u tretmanu",
              body: "Nakon termina možeš ostaviti recenziju i pomoći drugim korisnicima pri izboru.",
            },
          ].map((s, i) => {
            const Icon = s.icon;

            return (
              <div
                key={s.title}
                className="relative bg-white rounded-3xl border border-[var(--border)] p-8 shadow-softer hover-lift"
              >
                <span className="absolute -top-3 right-6 text-xs font-semibold px-3 h-7 inline-flex items-center rounded-full bg-primary text-white shadow-soft">
                  Korak {i + 1}
                </span>

                <span className="inline-flex items-center justify-center size-14 rounded-2xl bg-gradient-to-br from-primary-soft to-accent-soft text-primary">
                  <Icon width={26} height={26} />
                </span>

                <h3 className="font-display mt-6 text-2xl font-semibold">
                  {s.title}
                </h3>

                <p className="mt-3 text-sm text-muted leading-relaxed">
                  {s.body}
                </p>
              </div>
            );
          })}
        </div>
      </section>


      {/* -------- FEATURED SALONS -------- */}
        {/* -------- FEATURED SALONS -------- */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 mt-28">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <EyebrowLabel>Izdvojeni saloni</EyebrowLabel>
            <h2 className="font-display mt-4 text-4xl sm:text-5xl font-semibold tracking-tight">
              Saloni koje izdvajamo
            </h2>
          </div>

          <Link
            href="/salons"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all"
          >
            Pogledaj sve salone
            <ArrowRightIcon width={14} height={14} />
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((s, i) => (
              <SalonCard key={s.id} salon={s} featured={i === 0} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-[var(--border)] p-8 text-center shadow-softer">
            <p className="text-muted">Trenutno nema salona za prikaz.</p>
          </div>
        )}
      </section>

      {/* -------- CATEGORIES RIBBON -------- */}
       <section className="mx-auto max-w-7xl px-6 lg:px-10 mt-28">
        <div className="bg-white/70 rounded-[2.5rem] p-8 lg:p-12 border border-white/80 shadow-softer">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <EyebrowLabel>Pretraga po usluzi</EyebrowLabel>
              <h3 className="font-display mt-3 text-3xl font-semibold">
                Izaberi tretman, mi ćemo pronaći salon
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { name: "Kosa", tint: "from-[#f6dce9] to-[#f3cfe0]" },
              { name: "Nokti", tint: "from-[#ecdff7] to-[#ddc8ee]" },
              { name: "Lice", tint: "from-[#f5e2d7] to-[#f0ccbf]" },
              { name: "Šminka", tint: "from-[#f8d6e5] to-[#f2bcd2]" },
              { name: "Masaža", tint: "from-[#e3dbf6] to-[#cdc2ea]" },
              { name: "Spa", tint: "from-[#e4dff1] to-[#d2cde7]" },
            ].map((c) => (
              <Link
                key={c.name}
                href="/salons"
                className={`group relative aspect-[4/5] rounded-2xl p-4 overflow-hidden bg-gradient-to-br ${c.tint} hover-lift`}
              >
                <div className="absolute -right-6 -bottom-6 size-24 rounded-full bg-white/40 blur-xl" />

                <span className="relative text-[11px] uppercase tracking-[0.18em] font-semibold text-foreground/70">
                  Usluga
                </span>

                <p className="relative font-display text-xl font-semibold mt-2">
                  {c.name}
                </p>

                <span className="absolute bottom-3 right-3 size-8 rounded-full bg-white/90 grid place-items-center text-primary group-hover:scale-110 transition">
                  <ArrowRightIcon width={14} height={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* -------- TESTIMONIALS -------- */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 mt-28">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <EyebrowLabel>Utisci korisnika</EyebrowLabel>
          <h2 className="font-display mt-4 text-4xl sm:text-5xl font-semibold tracking-tight">
            Korisnici nas <span className="italic text-primary">preporučuju</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {REVIEWS.slice(0, 3).map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-3xl border border-[var(--border)] shadow-softer p-7 hover-lift"
            >
              <Rating value={r.rating} size={14} />

              <p className="mt-4 text-[15px] leading-relaxed text-foreground/85">
                &ldquo;{r.body}&rdquo;
              </p>

              <div className="mt-6 pt-5 border-t border-[var(--border)] flex items-center gap-3">
                <Avatar name={r.author} size={40} />
                <div>
                  <p className="text-sm font-semibold">{r.author}</p>
                  <p className="text-xs text-muted">{r.service}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* -------- FOR SALONS CTA -------- */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 mt-28">
        <div className="relative rounded-[2.5rem] overflow-hidden p-8 sm:p-12 lg:p-16 bg-gradient-to-br from-primary via-[#b093e0] to-[#d7a2ec] text-white">
          <div className="absolute -top-16 -right-24 size-80 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 size-72 rounded-full bg-white/10 blur-3xl" />

          <div className="relative grid lg:grid-cols-[1.2fr_1fr] gap-10 items-center">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] bg-white/15 backdrop-blur px-3 h-7 rounded-full">
                <FlowerIcon width={14} height={14} />
                Za vlasnike salona
              </span>

              <h2 className="font-display mt-5 text-4xl sm:text-5xl font-semibold leading-tight">
                Popuni svoj kalendar bez haosa.
              </h2>

              <p className="mt-4 text-white/85 max-w-xl">
                Salonify omogućava salonima da upravljaju rezervacijama,
                uslugama, radnim vremenom i zahtevima klijenata kroz jednostavan
                dashboard.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <LinkButton href="/register" variant="secondary" size="lg">
                  Registruj salon
                  <ArrowRightIcon />
                </LinkButton>

                <LinkButton
                  href="/dashboard"
                  variant="ghost"
                  size="lg"
                  className="!bg-white/10 hover:!bg-white/20 !text-white"
                >
                  Pogledaj dashboard
                </LinkButton>
              </div>
            </div>

            <ul className="space-y-3">
              {[
                "Pregled dostupnih termina bez duplih rezervacija",
                "Odobravanje ili odbijanje zahteva za termin",
                "Usluge, cene i radno vreme na jednom mestu",
                "Recenzije korisnika i bolja vidljivost salona",
              ].map((l) => (
                <li
                  key={l}
                  className="flex items-start gap-3 bg-white/12 backdrop-blur rounded-2xl px-4 py-3 border border-white/15"
                >
                  <span className="size-7 rounded-full bg-white text-primary grid place-items-center shrink-0">
                    <CheckIcon width={14} height={14} />
                  </span>
                  <span className="text-sm">{l}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </> 
  );
}
