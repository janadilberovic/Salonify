"use client";

import { useMemo, useState } from "react";

type Props = {
  value: string;
  onChange: (time: string) => void;
};

function generateTimeSlots() {
  const slots: string[] = [];

  for (let hour = 8; hour <= 21; hour++) {
    for (const minute of [0, 30]) {
      if (hour === 21 && minute === 30) continue;

      const h = String(hour).padStart(2, "0");
      const m = String(minute).padStart(2, "0");

      slots.push(`${h}:${m}`);
    }
  }

  return slots;
}

export default function PrettyTimePicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const slots = useMemo(() => generateTimeSlots(), []);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full h-12 rounded-2xl border border-[var(--border)] bg-white px-4 text-sm font-medium text-foreground shadow-sm flex items-center justify-between hover:border-primary transition"
      >
        <span className="inline-flex items-center gap-2">
          <span className="inline-flex size-7 items-center justify-center rounded-full bg-primary-soft text-primary">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
          </span>

          {value || "Izaberi vreme"}
        </span>

        <span className="text-xs text-muted">Promeni</span>
      </button>

      {open && (
        <div className="absolute left-0 z-50 mt-3 w-[320px] max-w-[calc(100vw-2rem)] rounded-3xl border border-[var(--border)] bg-white p-4 shadow-lift">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-xl font-semibold text-foreground">
              Izaberi vreme
            </h3>

            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
                className="text-xs font-semibold text-muted hover:text-primary transition"
              >
                Obriši
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
            {slots.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => {
                  onChange(slot);
                  setOpen(false);
                }}
                className={`h-10 rounded-full border text-sm font-medium transition ${
                  value === slot
                    ? "bg-primary text-white border-primary shadow-soft"
                    : "bg-white border-[var(--border)] text-foreground hover:border-primary hover:bg-primary-soft hover:text-primary"
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}