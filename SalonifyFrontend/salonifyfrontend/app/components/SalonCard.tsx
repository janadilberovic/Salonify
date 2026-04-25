import Link from "next/link";
import Image from "next/image";
import { Rating } from "./ui";
import { MapPinIcon, ArrowRightIcon } from "./Icons";
import type { Salon } from "../lib/data";

export default function SalonCard({
  salon,
  featured = false,
}: {
  salon: Salon;
  featured?: boolean;
}) {
  return (
    <Link
      href={`/salons/${salon.slug}`}
      className="group block bg-white rounded-3xl border border-[var(--border)] shadow-softer hover-lift overflow-hidden"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={salon.cover}
          alt={salon.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
          className="object-cover group-hover:scale-105 transition duration-500"
        />
        <div className="absolute inset-x-0 top-0 p-4 flex items-start justify-between">
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 h-7 rounded-full bg-white/90 backdrop-blur text-foreground shadow-softer">
            {"·".repeat(salon.priceLevel).split("").map((d, i) => (
              <span key={i}>€</span>
            ))}
          </span>
          {featured && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 h-7 rounded-full bg-primary text-white shadow-soft">
              Editor&rsquo;s pick
            </span>
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4">
          <span className="inline-flex items-center gap-1.5 px-3 h-7 rounded-full bg-white/90 backdrop-blur text-xs font-medium text-foreground">
            <MapPinIcon width={12} height={12} />
            {salon.city}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-xl font-semibold leading-tight truncate">
              {salon.name}
            </h3>
            <p className="text-sm text-muted mt-1 truncate">{salon.tagline}</p>
          </div>
          <div className="text-right shrink-0">
            <Rating value={salon.rating} size={13} />
            <p className="text-[11px] text-muted mt-1">
              {salon.reviewCount} reviews
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {salon.categories.slice(0, 3).map((c) => (
            <span
              key={c}
              className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-primary-soft/70 text-[#5b3e8a]"
            >
              {c}
            </span>
          ))}
        </div>

        <div className="mt-5 pt-4 border-t border-[var(--border)] flex items-center justify-between">
          <span className="text-xs text-muted">
            from €{Math.min(...salon.services.map((s) => s.price))}
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-2.5 transition-all">
            Book
            <ArrowRightIcon width={14} height={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}
