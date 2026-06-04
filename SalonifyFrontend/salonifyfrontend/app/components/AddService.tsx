"use client";

import { useState } from "react";
import { addSalonService } from "../../services/salonService";
import { showToast } from "./Toast";

const serviceTypes = [
  { value: "0", label: "Šišanje", description: "Kratko, dugo, feniranje i oblikovanje" },
  { value: "1", label: "Farbanje", description: "Boja, pramenovi i toniranje" },
  { value: "2", label: "Stilizovanje", description: "Frizure i završni styling" },
  { value: "3", label: "Manikir", description: "Nega i uređivanje noktiju" },
  { value: "4", label: "Pedikir", description: "Nega stopala i noktiju" },
  { value: "5", label: "Šminkanje", description: "Dnevna, večernja i svečana šminka" },
  { value: "6", label: "Masaža", description: "Relaks i terapeutski tretmani" },
  { value: "7", label: "Tretman lica", description: "Nega, čišćenje i hidratacija" },
  { value: "8", label: "Depilacija", description: "Uklanjanje dlačica" },
  { value: "9", label: "Spa tretman", description: "Rituali opuštanja i nege" },
  { value: "10", label: "Nail art", description: "Dekoracija i dizajn noktiju" },
  { value: "11", label: "Ostalo", description: "Druga usluga salona" },
];

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function AddServiceModal({
  open,
  onClose,
  onSuccess,
}: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [serviceType, setServiceType] = useState("0");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [serviceMenuOpen, setServiceMenuOpen] = useState(false);
  const selectedServiceType =
    serviceTypes.find((type) => type.value === serviceType) ?? serviceTypes[0];

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setDurationMinutes("");
    setServiceType("0");
    setImage(null);
    setServiceMenuOpen(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!open) return null;

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("Name", name);
      formData.append("Description", description);
      formData.append("Price", price);
      formData.append("DurationMinutes", durationMinutes);
      formData.append("ServiceType", serviceType);

      if (image) {
        formData.append("Image", image);
      }
    
      await addSalonService(formData);

      resetForm();
      onSuccess();
      onClose();
      showToast("Usluga je uspešno dodata.");
    } catch (error) {
      console.error(error);
      showToast("Greška pri dodavanju usluge.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/40 px-4 py-6 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-7 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-semibold">
            Nova usluga
          </h2>

          <button
            onClick={handleClose}
            className="size-9 rounded-full bg-[var(--background-soft)] hover:bg-primary-soft"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-[#4b3758]">
              Naziv usluge
            </span>

            <input
              placeholder="npr. Luxury Balayage"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-2xl border px-4 py-3 outline-none"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-[#4b3758]">
              Opis usluge
            </span>

            <textarea
              placeholder="Unesi kratak opis usluge..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-2 w-full rounded-2xl border px-4 py-3 outline-none min-h-[100px]"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <input
              placeholder="Cena (€)"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-2xl border px-4 py-3 outline-none"
            />

            <input
              placeholder="Trajanje (min)"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              className="w-full rounded-2xl border px-4 py-3 outline-none"
            />
          </div>

          <div className="relative">
            <span className="text-sm font-medium text-[#4b3758]">
              Kategorija usluge
            </span>

            <button
              type="button"
              onClick={() => setServiceMenuOpen((prev) => !prev)}
              className={`mt-2 flex w-full items-center justify-between gap-4 rounded-2xl border bg-white px-4 py-3 text-left outline-none transition ${
                serviceMenuOpen
                  ? "border-primary shadow-soft"
                  : "border-[var(--border)] hover:border-primary"
              }`}
            >
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-foreground">
                  {selectedServiceType.label}
                </span>
                <span className="mt-0.5 block truncate text-xs text-muted">
                  {selectedServiceType.description}
                </span>
              </span>

              <span
                className={`grid size-8 shrink-0 place-items-center rounded-full bg-primary-soft text-primary transition ${
                  serviceMenuOpen ? "rotate-180" : ""
                }`}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 7.5L10 12.5L15 7.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>

            {serviceMenuOpen && (
              <div className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-3xl border border-white/80 bg-white shadow-lift">
                <div className="border-b border-[var(--border)] bg-gradient-to-br from-white via-[#fdf7fb] to-primary-soft/50 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                    Tip usluge
                  </p>
                </div>

                <div className="max-h-56 overflow-y-auto p-2">
                  {serviceTypes.map((type) => {
                    const active = type.value === serviceType;

                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => {
                          setServiceType(type.value);
                          setServiceMenuOpen(false);
                        }}
                        className={`flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-3 text-left transition ${
                          active
                            ? "bg-primary text-white shadow-soft"
                            : "text-foreground hover:bg-[var(--background-soft)]"
                        }`}
                      >
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold">
                            {type.label}
                          </span>
                          <span
                            className={`mt-0.5 block truncate text-xs ${
                              active ? "text-white/80" : "text-muted"
                            }`}
                          >
                            {type.description}
                          </span>
                        </span>

                        {active && (
                          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white/20 text-xs font-bold">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <label className="block cursor-pointer rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--background-soft)] px-4 py-4 transition hover:border-primary hover:bg-primary-soft/50">
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) =>
                setImage(e.target.files ? e.target.files[0] : null)
              }
            />

            <span className="flex items-center justify-between gap-4">
              <span>
                <span className="block text-sm font-semibold text-[#4b3758]">
                  Dodaj sliku usluge
                </span>
                <span className="mt-1 block text-xs text-muted">
                  Klikni ovde da izabereš fotografiju za ovu uslugu.
                </span>
                {image && (
                  <span className="mt-2 block truncate text-xs font-semibold text-primary">
                    Izabrano: {image.name}
                  </span>
                )}
              </span>

              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-primary shadow-softer">
                +
              </span>
            </span>
          </label>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleClose}
            className="px-5 py-3 rounded-2xl bg-[var(--background-soft)]"
          >
            Otkaži
          </button>
           
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-3 rounded-2xl bg-primary text-white disabled:opacity-60"
          >
            {loading ? "Dodavanje..." : "Dodaj uslugu"}
          </button>
        </div>
      </div>
    </div>
  );
}
