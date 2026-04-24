import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  Rating,
  EyebrowLabel,
  LinkButton,
} from "../../components/ui";
import {
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  HeartIcon,
  ArrowRightIcon,
  SparkleIcon,
  CheckIcon,
} from "../../components/Icons";
import { getSalon, reviewsForSalon, SALONS } from "../../lib/data";
import BookingPanel from "./BookingPanel";
import ReviewBlock from "./ReviewBlock";

export default async function SalonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const salon = getSalon(slug);
  if (!salon) notFound();

  const reviews = reviewsForSalon(salon.id);
  const related = SALONS.filter(
    (s) => s.id !== salon.id && s.categories.some((c) => salon.categories.includes(c)),
  ).slice(0, 3);

  return (
    <>
      <Navbar />

      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-8 text-xs text-muted">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>{" "}
        /{" "}
        <Link href="/salons" className="hover:text-primary">
          Salons
        </Link>{" "}
        / <span className="text-foreground">{salon.name}</span>
      </div>

      {/* HEADER */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 mt-6">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-4 lg:gap-6">
          <div className="relative aspect-[5/4] lg:aspect-[6/5] rounded-[2rem] overflow-hidden shadow-soft">
            <Image
              src={salon.cover}
              alt={salon.name}
              fill
              sizes="(max-width: 1024px) 100vw, 720px"
              className="object-cover"
              priority
            />
            <div className="absolute inset-x-0 top-0 p-5 flex items-start justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/90 backdrop-blur px-3 h-8 rounded-full shadow-softer">
                <SparkleIcon width={14} height={14} className="text-primary" />
                Verified salon
              </span>
              <button className="size-10 rounded-full bg-white/90 backdrop-blur grid place-items-center hover:text-accent transition shadow-softer">
                <HeartIcon width={18} height={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 grid-rows-2 gap-4">
            {salon.gallery.slice(0, 4).map((g, i) => (
              <div
                key={i}
                className="relative rounded-[1.5rem] overflow-hidden shadow-softer"
              >
                <Image
                  src={g}
                  alt={`${salon.name} ${i + 1}`}
                  fill
                  sizes="(max-width: 1024px) 50vw, 300px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Meta row */}
        <div className="mt-8 grid lg:grid-cols-[1.5fr_1fr] gap-8 items-start">
          <div>
            <EyebrowLabel>{salon.categories.join(" · ")}</EyebrowLabel>
            <h1 className="font-display mt-3 text-4xl sm:text-5xl font-semibold tracking-tight">
              {salon.name}
            </h1>
            <p className="mt-3 text-lg text-muted">{salon.tagline}</p>

            <div className="mt-5 flex flex-wrap items-center gap-5 text-sm">
              <span className="inline-flex items-center gap-1.5">
                <Rating value={salon.rating} size={16} showValue />
                <span className="text-muted">({salon.reviewCount})</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-foreground/80">
                <MapPinIcon width={15} height={15} className="text-primary" />
                {salon.address}, {salon.city}
              </span>
              <span className="inline-flex items-center gap-1.5 text-foreground/80">
                <PhoneIcon width={15} height={15} className="text-primary" />
                {salon.phone}
              </span>
            </div>

            <p className="mt-6 text-foreground/80 leading-relaxed max-w-2xl">
              {salon.description}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {[
                "Non-toxic products",
                "Sterilised tools",
                "Walk-friendly",
                "Card & cash",
                "Gender-free",
              ].map((p) => (
                <span
                  key={p}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-white border border-[var(--border)]"
                >
                  <CheckIcon width={12} height={12} className="text-primary" />
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* Hours card */}
          <div className="bg-white rounded-3xl border border-[var(--border)] shadow-softer p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-2 text-sm font-semibold">
                <ClockIcon width={16} height={16} className="text-primary" />
                Opening hours
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#2f6a51] bg-success-soft px-2.5 h-6 rounded-full">
                <span className="size-1.5 rounded-full bg-[#2f6a51]" />
                Open now
              </span>
            </div>
            <ul className="divide-y divide-[var(--border)]">
              {salon.openingHours.map((h) => (
                <li
                  key={h.day}
                  className="flex items-center justify-between py-2.5 text-sm"
                >
                  <span className="text-foreground/80">{h.day}</span>
                  <span
                    className={`${h.closed ? "text-muted-soft" : "font-medium"}`}
                  >
                    {h.hours}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* SERVICES + BOOKING */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 mt-16">
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 items-start">
          <div>
            <EyebrowLabel>Services</EyebrowLabel>
            <h2 className="font-display mt-3 text-3xl sm:text-4xl font-semibold tracking-tight">
              Every treatment, priced and explained.
            </h2>

            <div className="mt-8 space-y-4">
              {salon.services.map((s) => (
                <div
                  key={s.id}
                  className="bg-white rounded-3xl border border-[var(--border)] shadow-softer p-4 flex gap-5 hover-lift"
                >
                  <div className="relative w-28 sm:w-36 aspect-square rounded-2xl overflow-hidden shrink-0">
                    <Image
                      src={s.image}
                      alt={s.name}
                      fill
                      sizes="150px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-display text-lg sm:text-xl font-semibold">
                          {s.name}
                        </h3>
                        <span className="font-display text-xl font-semibold text-primary whitespace-nowrap">
                          €{s.price}
                        </span>
                      </div>
                      <p className="text-sm text-muted mt-1 line-clamp-2">
                        {s.description}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                        <ClockIcon width={12} height={12} />
                        {s.duration} min
                      </span>
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary-soft/70 text-[#5b3e8a]">
                        {s.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:sticky lg:top-24">
            <BookingPanel services={salon.services} />
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 mt-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <EyebrowLabel>Client stories</EyebrowLabel>
            <h2 className="font-display mt-3 text-3xl sm:text-4xl font-semibold tracking-tight">
              What people are saying
            </h2>
          </div>
        </div>
        <ReviewBlock
          reviews={reviews}
          rating={salon.rating}
          count={salon.reviewCount}
        />
      </section>

      {/* RELATED */}
      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 lg:px-10 mt-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <EyebrowLabel>You may also love</EyebrowLabel>
              <h2 className="font-display mt-3 text-3xl font-semibold">
                Similar salons
              </h2>
            </div>
            <LinkButton href="/salons" variant="ghost" size="sm">
              See all
              <ArrowRightIcon width={14} height={14} />
            </LinkButton>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map((s) => (
              <RelatedCard key={s.id} salon={s} />
            ))}
          </div>
        </section>
      )}

      <Footer />
    </>
  );
}

import type { Salon } from "../../lib/data";
function RelatedCard({ salon }: { salon: Salon }) {
  return (
    <Link
      href={`/salons/${salon.slug}`}
      className="group bg-white rounded-3xl border border-[var(--border)] shadow-softer overflow-hidden hover-lift"
    >
      <div className="relative aspect-[16/10]">
        <Image
          src={salon.cover}
          alt={salon.name}
          fill
          sizes="(max-width: 1024px) 50vw, 320px"
          className="object-cover group-hover:scale-105 transition"
        />
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg font-semibold truncate">
          {salon.name}
        </h3>
        <p className="text-xs text-muted">{salon.city}</p>
        <div className="mt-3 flex items-center justify-between">
          <Rating value={salon.rating} size={13} showValue />
          <span className="text-xs text-muted">
            from €{Math.min(...salon.services.map((s) => s.price))}
          </span>
        </div>
      </div>
    </Link>
  );
}
