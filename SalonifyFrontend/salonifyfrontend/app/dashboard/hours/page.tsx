"use client";

import { useEffect, useState } from "react";
import { Button, EyebrowLabel } from "../../components/ui";
import {
  getMySalonWorkingDays,
  updateSalonWorkingDays,
} from "@/services/salon";
import { WorkingDayApi } from "@/types/Salon";
import PrettyTimePicker from "../../components/PrettyTimePicker";
import { showToast } from "../../components/Toast";


const dayNames = [
  "Nedelja",
  "Ponedeljak",
  "Utorak",
  "Sreda",
  "Četvrtak",
  "Petak",
  "Subota",
];

const defaultWorkingDays: WorkingDayApi[] = [
  { day: 1, startTime: "10:00:00", endTime: "20:00:00", isClosed: false },
  { day: 2, startTime: "10:00:00", endTime: "20:00:00", isClosed: false },
  { day: 3, startTime: "10:00:00", endTime: "20:00:00", isClosed: false },
  { day: 4, startTime: "10:00:00", endTime: "20:00:00", isClosed: false },
  { day: 5, startTime: "10:00:00", endTime: "20:00:00", isClosed: false },
  { day: 6, startTime: "10:00:00", endTime: "18:00:00", isClosed: false },
  { day: 0, startTime: null, endTime: null, isClosed: true },
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
       if (!data || data.length === 0) {
        setHours(defaultWorkingDays);
        return;
      }

      const mergedDays = defaultWorkingDays.map((defaultDay) => {
        const existingDay = data.find((d) => d.day === defaultDay.day);
        return existingDay ?? defaultDay;
      });

      setHours(mergedDays);
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

      showToast("Radno vreme je uspešno sačuvano.");
    } catch (error) {
      console.error("Greška pri čuvanju radnog vremena:", error);
      showToast("Došlo je do greške pri čuvanju.", "error");
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

  function getDayIndex(day: number | string) {
    if (typeof day === "number") return day;

    const parsed = Number(day);
    if (!Number.isNaN(parsed)) return parsed;

    const dayMap: Record<string, number> = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
      nedelja: 0,
      ponedeljak: 1,
      utorak: 2,
      sreda: 3,
      cetvrtak: 4,
      petak: 5,
      subota: 6,
    };

    return dayMap[String(day).trim().toLowerCase()] ?? 0;
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
              className="grid grid-cols-1 gap-4 rounded-2xl border border-[var(--border)] p-4 sm:grid-cols-[120px_1fr_auto] sm:items-center sm:gap-5"
            >
              <p className="font-semibold">{dayNames[getDayIndex(h.day)]}</p>

              {h.isClosed ? (
                <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--background-soft)] px-4 py-3 text-sm font-medium text-muted">
                  Neradni dan
                </div>
              ) : (
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <PrettyTimePicker
                    value={displayTime(h.startTime)}
                    onChange={(value) => updateField(i, "startTime", value)}
                  />

                  <span className="rounded-full bg-[var(--background-soft)] px-3 py-1 text-xs font-semibold text-muted">
                    do
                  </span>

                  <PrettyTimePicker
                    value={displayTime(h.endTime)}
                    onChange={(value) => updateField(i, "endTime", value)}
                  />
                </div>
              )}

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
