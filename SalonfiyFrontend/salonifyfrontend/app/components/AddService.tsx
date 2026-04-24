"use client";

import { useState } from "react";
import { addSalonService } from "../../services/salonService";

const serviceTypes = [
  "Haircut",
  "Coloring",
  "Styling",
  "Manicure",
  "Pedicure",
  "Makeup",
  "Massage",
  "Facial",
  "Waxing",
  "SpaTreatment",
  "NailArt",
  "Other",
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

      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Greška pri dodavanju usluge.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm grid place-items-center px-4">
      <div className="w-full max-w-xl rounded-3xl bg-white p-7 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-semibold">
            Nova usluga
          </h2>

          <button
            onClick={onClose}
            className="size-9 rounded-full bg-[var(--background-soft)] hover:bg-primary-soft"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <input
            placeholder="Naziv usluge"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-2xl border px-4 py-3 outline-none"
          />

          <textarea
            placeholder="Opis usluge"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-2xl border px-4 py-3 outline-none min-h-[100px]"
          />

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

          <select
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            className="w-full rounded-2xl border px-4 py-3 outline-none"
          >
            {serviceTypes.map((type, index) => (
              <option key={index} value={index}>
                {type}
              </option>
            ))}
          </select>

          <input
            type="file"
            onChange={(e) =>
              setImage(e.target.files ? e.target.files[0] : null)
            }
            className="w-full rounded-2xl border px-4 py-3"
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-2xl bg-[var(--background-soft)]"
          >
            Otkaži
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-3 rounded-2xl bg-primary text-white"
          >
            {loading ? "Dodavanje..." : "Dodaj uslugu"}
          </button>
        </div>
      </div>
    </div>
  );
}