"use client";

import { useEffect, useState } from "react";
import { Button, Input, EyebrowLabel } from "../../components/ui";
import {
  getMySalonWorkingDays,
  updateSalonWorkingDays,
} from "@/services/salon";
import { WorkingDayApi } from "@/types/Salon";


const dayNames = [
  "Nedelja",
  "Ponedeljak",
  "Utorak",
  "Sreda",
  "Četvrtak",
  "Petak",
  "Subota",
];

export default function HoursPage() {
  const [hours, setHours] = useState<WorkingDayApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadWorkingDays();
  }, []);

  async function loadWorkingDays() {
    try {
      const data = await getMySalonWorkingDays();
      setHours(data);
    } catch (error) {
      console.error("Greška pri učitavanju radnog vremena:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);

      const normalizedHours = hours.map((h) => ({
        ...h,
        startTime: h.isClosed ? null : normalizeTime(h.startTime || ""),
        endTime: h.isClosed ? null : normalizeTime(h.endTime  || ""),
      }));

      await updateSalonWorkingDays(normalizedHours );

      alert("Radno vreme je uspešno sačuvano.");
    } catch (error) {
      console.error("Greška pri čuvanju radnog vremena:", error);
      alert("Došlo je do greške pri čuvanju.");
    } finally {
      setSaving(false);
    }
  }

  function updateField(
    index: number,
    field: "startTime" | "endTime",
    value: string
  ) {
    setHours((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  }

  function toggleOpen(index: number) {
    setHours((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              isClosed: !item.isClosed,
              startTime: item.isClosed ? "10:00" : null,
              endTime: item.isClosed ? "20:00" : null,
            }
          : item
      )
    );
  }

  function normalizeTime(value: string | null) {
    if (!value) return null;

    if (value.length === 5) {
      return `${value}:00`;
    }

    return value;
  }

  function displayTime(value: string | null) {
    if (!value) return "";

    return value.slice(0, 5);
  }

  if (loading) {
    return <p>Učitavanje radnog vremena...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <EyebrowLabel>Radno vreme</EyebrowLabel>

        <h1 className="font-display mt-3 text-4xl font-semibold">
          Nedeljni raspored
        </h1>

        <p className="text-muted mt-2">Unesite radne dane i sate.</p>
      </div>

      <div className="bg-white rounded-3xl border border-[var(--border)] shadow-softer p-6 lg:p-8">
        <div className="space-y-3">
          {hours.map((h, i) => (
            <div
              key={h.day}
              className="grid grid-cols-[100px_1fr_auto] gap-4 items-center p-4 rounded-2xl border border-[var(--border)]"
            >
              <p className="font-semibold">{dayNames[h.day]}</p>

              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  value={displayTime(h.startTime)}
                  disabled={h.isClosed}
                  onChange={(e) =>
                    updateField(i, "startTime", e.target.value)
                  }
                  className="!h-10 text-sm"
                />

                <span className="text-muted text-sm">do</span>

                <Input
                  type="time"
                  value={displayTime(h.endTime)}
                  disabled={h.isClosed}
                  onChange={(e) =>
                    updateField(i, "endTime", e.target.value)
                  }
                  className="!h-10 text-sm"
                />
              </div>

              <label className="inline-flex items-center gap-2 text-xs font-medium text-muted cursor-pointer">
                <input
                  type="checkbox"
                  className="size-4 accent-[var(--primary)]"
                  checked={!h.isClosed}
                  onChange={() => toggleOpen(i)}
                />
                Otvoren
              </label>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={loadWorkingDays}>
            Otkaži
          </Button>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Čuvanje..." : "Sačuvaj izmene"}
          </Button>
        </div>
      </div>
    </div>
  );
}