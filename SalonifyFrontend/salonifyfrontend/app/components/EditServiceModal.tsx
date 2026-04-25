"use client";

import { useEffect, useState } from "react";
import {
  updateSalonService,
  removeSalonService,
} from "@/services/salonService";

export default function EditServiceModal({
  open,
  onClose,
  service,
  onSuccess,
}: any) {
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => {
    if (service) {
      setPrice(String(service.price ?? ""));
      setDescription(service.description ?? "");
      setDurationMinutes(String(service.durationMinutes ?? ""));
      setImage(null);
      setPreview(null);
    }
  }, [service]);

  if (!open || !service) return null;

  const handleUpdate = async () => {
    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("ServiceType", String(service.serviceType));
      formData.append("Name", service.name);
      formData.append("Description", description);
      formData.append("Price", price);
      formData.append("DurationMinutes", durationMinutes);
      if (image) {
        formData.append("Image", image);
      }

      await updateSalonService(formData);

      await onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Greška pri izmeni usluge.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Da li sigurno želiš da obrišeš ovu uslugu?")) return;

    try {
      setLoading(true);

      await removeSalonService(service.serviceType);

      await onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Greška pri brisanju usluge.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#2b1b3a]/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-xl rounded-[2rem] bg-white border border-white/70 shadow-2xl p-7">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold">
              Izmena usluge
            </p>

            <h2 className="font-display text-3xl font-semibold mt-2 text-[#2d1836]">
              {service.name}
            </h2>

            <p className="text-sm text-muted mt-1">
              Izmeni podatke o usluzi ili je ukloni iz ponude salona.
            </p>
          </div>

          <button
            onClick={onClose}
            className="size-10 rounded-full bg-[var(--background-soft)] hover:bg-primary-soft transition grid place-items-center text-muted hover:text-primary"
          >
            ✕
          </button>
        </div>
        <label className="block">
  <span className="text-sm font-medium text-[#4b3758]">
    Slika usluge
  </span>

  <div className="mt-2 flex items-center gap-4">
    <div className="relative size-24 rounded-2xl overflow-hidden bg-[#fff8fc] border border-[var(--border)]">
      <img
        src={
          preview
            ? preview
            : service.imageUrl
            ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${service.imageUrl}`
            : "/images/service-placeholder.jpg"
        }
        alt={service.name}
        className="h-full w-full object-cover"
      />
    </div>

    <label className="cursor-pointer px-5 py-3 rounded-2xl bg-primary-soft text-primary hover:bg-primary hover:text-white transition font-medium">
      Promeni sliku
      <input
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];

          if (!file) return;

          setImage(file);
          setPreview(URL.createObjectURL(file));
        }}
      />
    </label>
  </div>
</label>
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-[#4b3758]">
              Opis usluge
            </span>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Unesi kratak opis usluge..."
              className="mt-2 w-full min-h-[110px] resize-none rounded-2xl border border-[var(--border)] bg-[#fff8fc] px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary-soft/70 transition"
            />
          </label>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-[#4b3758]">Cena</span>

              <div className="mt-2 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
                  €
                </span>

                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="50"
                  className="w-full rounded-2xl border border-[var(--border)] bg-[#fff8fc] pl-8 pr-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary-soft/70 transition"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-[#4b3758]">
                Trajanje
              </span>

              <div className="mt-2 relative">
                <input
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  placeholder="60"
                  className="w-full rounded-2xl border border-[var(--border)] bg-[#fff8fc] px-4 pr-12 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary-soft/70 transition"
                />

                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted text-sm">
                  min
                </span>
              </div>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 mt-7 pt-5 border-t border-[var(--border)]">
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-5 py-3 rounded-2xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition font-medium disabled:opacity-60"
          >
            Obriši
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-5 py-3 rounded-2xl bg-[var(--background-soft)] text-muted hover:text-[#2d1836] transition font-medium disabled:opacity-60"
            >
              Otkaži
            </button>

            <button
              onClick={handleUpdate}
              disabled={loading}
              className="px-6 py-3 rounded-2xl bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary/90 transition font-medium disabled:opacity-60"
            >
              {loading ? "Čuvanje..." : "Sačuvaj izmene"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
