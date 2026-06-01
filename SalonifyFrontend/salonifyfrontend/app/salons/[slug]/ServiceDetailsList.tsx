"use client";

import Image from "next/image";
import { useState } from "react";
import { ClockIcon, SparkleIcon, XIcon } from "../../components/Icons";
import { Button } from "../../components/ui";
import type { Service } from "../../lib/data";
import { trackServiceView } from "@/services/salonService";

type Props = {
  salonId: string;
  services: Service[];
};

export default function ServiceDetailsList({ salonId, services }: Props) {
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  async function openService(service: Service) {
    setSelectedService(service);

    try {
      await trackServiceView(salonId, getServiceTypeNumber(service));
    } catch {
      // Tracking je best-effort; detalji tretmana treba da rade i bez njega.
    }
  }

  return (
    <>
      <div className="mt-8 space-y-4">
        {services.map((service, index) => (
          <button
            key={`${service.id}-${service.name}-${index}`}
            type="button"
            onClick={() => openService(service)}
            className="w-full text-left bg-white rounded-3xl border border-[var(--border)] shadow-softer p-4 flex gap-5 hover-lift focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            <div className="relative w-28 sm:w-36 aspect-square rounded-2xl overflow-hidden shrink-0">
              <Image
                src={service.image}
                alt={service.name}
                fill
                sizes="150px"
                className="object-cover"
                unoptimized
              />
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-lg sm:text-xl font-semibold">
                    {service.name}
                  </h3>
                  <span className="font-display text-xl font-semibold text-primary whitespace-nowrap">
                    {service.price} RSD
                  </span>
                </div>

                <p className="text-sm text-muted mt-1 line-clamp-2">
                  {service.description}
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                  <ClockIcon width={12} height={12} />
                  {service.duration} min
                </span>

                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary-soft/70 text-[#5b3e8a]">
                  {service.category}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {selectedService && (
        <div
          className="fixed inset-0 z-50 bg-black/35 px-4 py-8 flex items-center justify-center"
          onClick={() => setSelectedService(null)}
        >
          <div
            className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-lift"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative aspect-[16/10]">
              <Image
                src={selectedService.image}
                alt={selectedService.name}
                fill
                sizes="600px"
                className="object-cover"
                unoptimized
              />

              <button
                type="button"
                onClick={() => setSelectedService(null)}
                className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-white/90 text-foreground shadow-softer hover:text-primary"
                aria-label="Zatvori detalje tretmana"
              >
                <XIcon width={18} height={18} />
              </button>
            </div>

            <div className="p-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft/70 px-3 py-1 text-xs font-semibold text-[#5b3e8a]">
                <SparkleIcon width={13} height={13} />
                {selectedService.category}
              </span>

              <div className="mt-4 flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-display text-3xl font-semibold leading-tight">
                    {selectedService.name}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {selectedService.description ||
                      "Salon nije dodao dodatni opis za ovaj tretman."}
                  </p>
                </div>

                <span className="shrink-0 font-display text-2xl font-semibold text-primary">
                  {selectedService.price} RSD
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-[var(--background-soft)] p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted">
                    Trajanje
                  </p>
                  <p className="mt-1 font-semibold">
                    {selectedService.duration} min
                  </p>
                </div>

                <div className="rounded-2xl bg-[var(--background-soft)] p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted">
                    Tip tretmana
                  </p>
                  <p className="mt-1 font-semibold">
                    {selectedService.category}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button onClick={() => setSelectedService(null)}>
                  Razumem
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function getServiceTypeNumber(service: Service) {
  if (typeof service.serviceType === "number") {
    return service.serviceType;
  }

  const parsed = Number(service.id);

  return Number.isNaN(parsed) ? 11 : parsed;
}
