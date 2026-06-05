"use client";

import { useState } from "react";
import { addSalonService } from "../../services/salonService";
import { showToast } from "./Toast";
import { CheckIcon, SparkleIcon, XIcon } from "./Icons";

const serviceTypes = [
  { value: "0", label: "Sisanje", description: "Kratko, dugo, feniranje i oblikovanje" },
  { value: "1", label: "Farbanje", description: "Boja, pramenovi i toniranje" },
  { value: "2", label: "Stilizovanje", description: "Frizure i zavrsni styling" },
  { value: "3", label: "Manikir", description: "Nega i uredjivanje noktiju" },
  { value: "4", label: "Pedikir", description: "Nega stopala i noktiju" },
  { value: "5", label: "Sminkanje", description: "Dnevna, vecernja i svecana sminka" },
  { value: "6", label: "Masaza", description: "Relaks i terapeutski tretmani" },
  { value: "7", label: "Tretman lica", description: "Nega, ciscenje i hidratacija" },
  { value: "8", label: "Depilacija", description: "Uklanjanje dlacica" },
  { value: "9", label: "Spa tretman", description: "Rituali opustanja i nege" },
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

  const selectedServiceType =
    serviceTypes.find((type) => type.value === serviceType) ?? serviceTypes[0];
  const canSubmit =
    name.trim() &&
    description.trim() &&
    price.trim() &&
    durationMinutes.trim();

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setDurationMinutes("");
    setServiceType("0");
    setImage(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!canSubmit || loading) return;

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("Name", name.trim());
      formData.append("Description", description.trim());
      formData.append("Price", price.trim());
      formData.append("DurationMinutes", durationMinutes.trim());
      formData.append("ServiceType", serviceType);

      if (image) {
        formData.append("Image", image);
      }

      await addSalonService(formData);

      resetForm();
      onSuccess();
      onClose();
      showToast("Usluga je uspesno dodata.");
    } catch (error) {
      console.error(error);
      showToast("Greska pri dodavanju usluge.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/40 px-4 py-6 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-[32px] border border-white/80 bg-white shadow-2xl">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[var(--border)] bg-gradient-to-br from-white via-[#fdf7fb] to-primary-soft/40 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary text-white shadow-soft">
              <SparkleIcon width={19} height={19} />
            </span>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                Usluge salona
              </p>
              <h2 className="font-display text-2xl font-semibold leading-tight">
                Nova usluga
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="grid size-9 shrink-0 place-items-center rounded-full bg-white/90 text-foreground shadow-softer transition hover:bg-primary-soft hover:text-primary"
            aria-label="Zatvori dodavanje usluge"
          >
            <XIcon width={17} height={17} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-semibold text-[#4b3758]">
                  Naziv usluge
                </span>

                <input
                  placeholder="npr. Luxury Balayage"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 h-12 w-full rounded-2xl border border-[var(--border-strong)] bg-white px-4 text-sm outline-none transition placeholder:text-muted-soft focus:border-primary focus:ring-4 focus:ring-primary-soft/60"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-[#4b3758]">
                  Opis usluge
                </span>

                <textarea
                  placeholder="Unesi kratak opis usluge..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-2 min-h-[116px] w-full resize-none rounded-2xl border border-[var(--border-strong)] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-muted-soft focus:border-primary focus:ring-4 focus:ring-primary-soft/60"
                />
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-[#4b3758]">
                    Cena
                  </span>
                  <input
                    placeholder="RSD"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="mt-2 h-12 w-full rounded-2xl border border-[var(--border-strong)] bg-white px-4 text-sm outline-none transition placeholder:text-muted-soft focus:border-primary focus:ring-4 focus:ring-primary-soft/60"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-[#4b3758]">
                    Trajanje
                  </span>
                  <input
                    placeholder="min"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    className="mt-2 h-12 w-full rounded-2xl border border-[var(--border-strong)] bg-white px-4 text-sm outline-none transition placeholder:text-muted-soft focus:border-primary focus:ring-4 focus:ring-primary-soft/60"
                  />
                </label>
              </div>

              <label className="block cursor-pointer rounded-3xl border border-dashed border-[var(--border-strong)] bg-[var(--background-soft)] px-4 py-4 transition hover:border-primary hover:bg-primary-soft/50">
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) =>
                    setImage(e.target.files ? e.target.files[0] : null)
                  }
                />

                <span className="flex items-center justify-between gap-4">
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-[#4b3758]">
                      Slika usluge
                    </span>
                    <span className="mt-1 block text-xs text-muted">
                      JPG ili PNG fotografija tretmana.
                    </span>
                    {image && (
                      <span className="mt-2 block truncate text-xs font-semibold text-primary">
                        {image.name}
                      </span>
                    )}
                  </span>

                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-xl font-semibold text-primary shadow-softer">
                    +
                  </span>
                </span>
              </label>
            </div>

            <div className="rounded-3xl border border-[var(--border)] bg-[var(--background-soft)] p-3">
              <div className="rounded-2xl bg-white px-4 py-3 shadow-softer">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                  Tip usluge
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {selectedServiceType.label}
                </p>
                <p className="mt-1 text-xs leading-5 text-muted">
                  {selectedServiceType.description}
                </p>
              </div>

              <div className="mt-3 max-h-[310px] overflow-y-auto pr-1">
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                  {serviceTypes.map((type) => {
                    const active = type.value === serviceType;

                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setServiceType(type.value)}
                        className={`flex min-h-16 w-full items-center justify-between gap-3 rounded-2xl border px-3 py-3 text-left transition ${
                          active
                            ? "border-primary bg-primary text-white shadow-soft"
                            : "border-transparent bg-white text-foreground hover:border-primary/30 hover:text-primary"
                        }`}
                      >
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold">
                            {type.label}
                          </span>
                          <span
                            className={`mt-0.5 block text-xs leading-4 ${
                              active ? "text-white/80" : "text-muted"
                            }`}
                          >
                            {type.description}
                          </span>
                        </span>

                        <span
                          className={`grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold ${
                            active
                              ? "bg-white text-primary"
                              : "bg-[var(--background-soft)] text-muted"
                          }`}
                        >
                          {active && <CheckIcon width={13} height={13} />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-3 border-t border-[var(--border)] bg-white px-6 py-4">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-2xl bg-[var(--background-soft)] px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-primary-soft hover:text-primary"
          >
            Otkazi
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
            className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Dodavanje..." : "Dodaj uslugu"}
          </button>
        </div>
      </div>
    </div>
  );
}
