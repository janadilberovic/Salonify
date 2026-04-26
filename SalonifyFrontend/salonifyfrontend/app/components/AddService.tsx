"use client";

import { useState } from "react";
import { addSalonService } from "../../services/salonService";
import { Console } from "console";

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

          <label className="block">
            <span className="text-sm font-medium text-[#4b3758]">
              Kategorija usluge
            </span>

            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="mt-2 w-full rounded-2xl border px-4 py-3 outline-none"
            >
              {serviceTypes.map((type, index) => (
                <option key={index} value={index}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setImage(e.target.files ? e.target.files[0] : null)
            }
            className="w-full rounded-2xl border px-4 py-3"
          />
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