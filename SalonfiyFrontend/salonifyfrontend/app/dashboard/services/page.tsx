"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button, EyebrowLabel } from "../../components/ui";
import { SettingsIcon, SparkleIcon } from "../../components/Icons";
import { getMyServices, getServicesFromSalon } from "@/services/salonService";
import { SalonService } from "@/types/SalonService";
import AddServiceModal from "@/app/components/AddService";
import EditServiceModal from "@/app/components/EditServiceModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ServicesPage() {
  const [services, setServices] = useState<SalonService[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [selectedService, setSelectedService] = useState<SalonService | null>(
    null,
  );
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await getMyServices();
      setServices(data);
    } catch (error) {
      console.error("Greška pri učitavanju usluga:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-none space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <EyebrowLabel>Usluge</EyebrowLabel>
          <h1 className="font-display mt-3 text-4xl font-semibold">
            Usluge salona
          </h1>
          <p className="text-muted mt-2">
            Dodaj, izmeni ili ukloni usluge koje salon nudi.
          </p>
        </div>

        <Button onClick={() => setOpenModal(true)}>
          <SparkleIcon /> Nova usluga
        </Button>
        <AddServiceModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          onSuccess={fetchServices}
        />
      </div>

      {loading && <p className="text-muted">Učitavanje usluga...</p>}

      {!loading && services.length === 0 && (
        <div className="bg-white rounded-3xl border border-[var(--border)] shadow-softer p-8 text-center">
          <p className="font-display text-xl font-semibold">
            Još nema dodatih usluga
          </p>
          <p className="text-muted mt-2">
            Klikni na “Nova usluga” i dodaj prvu uslugu salona.
          </p>
        </div>
      )}

      {!loading && services.length > 0 && (
        <div className=" grid grid-cols-1 xl:grid-cols-2 gap-4 w-full">
          {services.map((s) => (
            <div
              key={`${s.serviceType}-${s.name}-${s.description}`}
              className="bg-white rounded-3xl border border-[var(--border)] shadow-softer p-4 flex gap-4 hover-lift"
            >
              <div className="relative w-28 aspect-square rounded-2xl overflow-hidden shrink-0 bg-primary-soft/40">
                <Image
                  unoptimized
                  src={
                    s.imageUrl
                      ? `${"http://localhost:5199"}${s.imageUrl}`
                      : "/images/service-placeholder.jpg"
                  }
                  alt={s.name}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-display text-lg font-semibold">
                      {s.name}
                    </p>

                    <span className="font-display text-lg font-semibold text-primary">
                      {s.price} rsd
                    </span>
                  </div>

                  <p className="text-xs text-muted mt-1 line-clamp-2">
                    {s.description || "Nema opisa usluge."}
                  </p>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-primary-soft/70 text-[#5b3e8a]">
                    {s.name}
                  </span>

                  <span className="text-xs text-muted">
                    · {s.durationMinutes} min
                  </span>

                  <div className="ml-auto flex gap-1">
                    <button className="size-8 cursor-pointer rounded-full bg-[var(--background-soft)] hover:bg-primary-soft transition grid place-items-center text-muted hover:text-primary">
                      <SettingsIcon
                        onClick={() => {
                          setSelectedService(s);
                          setEditOpen(true);
                        }}
                        width={14}
                        height={14}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {selectedService && (
            <EditServiceModal
              open={editOpen}
              service={selectedService}
              onClose={() => setEditOpen(false)}
              onSuccess={fetchServices}
            />
          )}
        </div>
      )}
    </div>
  );
}
