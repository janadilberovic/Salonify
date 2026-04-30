"use client";

import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { srLatn } from "date-fns/locale";
import "react-day-picker/dist/style.css";
import { CalendarIcon } from "./Icons";



type Props = {
  value: string;
  onChange: (date: string) => void;
};

export default function PrettyDatePicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const selectedDate = value ? new Date(value) : new Date();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full h-12 rounded-2xl border border-[var(--border)] bg-white px-4 text-sm font-medium text-foreground shadow-sm flex items-center justify-between hover:border-primary transition"
      >
        <span className="inline-flex items-center gap-2">
          <CalendarIcon width={16} height={16} className="text-primary" />
          {format(selectedDate, "dd. MMMM yyyy.", { locale: srLatn })}
        </span>

        <span className="text-xs text-muted">Promeni</span>
      </button>

    {open && (
  <div className="absolute left-0 z-50 mt-3 w-[360px] max-w-[calc(100vw-2rem)] rounded-3xl border border-[var(--border)] bg-white p-4 shadow-lift">
    <DayPicker
      mode="single"
      selected={selectedDate}
      onSelect={(date) => {
        if (!date) return;

        const localDate = format(date, "yyyy-MM-dd");
        onChange(localDate);
        setOpen(false);
      }}
      disabled={{ before: new Date() }}
      locale={srLatn}
      weekStartsOn={1}
      classNames={{
        months: "flex flex-col",
        month: "space-y-4",
        caption: "flex justify-between items-center px-1",
        caption_label: "font-display text-2xl font-semibold text-foreground",
        nav: "flex items-center gap-2",
        nav_button:
          "size-9 rounded-full grid place-items-center text-primary hover:bg-primary-soft transition",
        table: "w-full border-collapse",
        head_row: "grid grid-cols-7 mb-2",
        head_cell:
          "text-xs font-semibold text-muted uppercase tracking-[0.08em] text-center",
        row: "grid grid-cols-7 mt-1",
        cell: "text-center",
        day: "size-10 rounded-full text-sm font-medium text-foreground hover:bg-primary-soft hover:text-primary transition",
        day_selected:
          "bg-primary !text-white hover:bg-primary hover:!text-white shadow-soft",
        day_today:
          "border border-primary text-primary",
        day_disabled:
          "text-muted-soft opacity-40 cursor-not-allowed hover:bg-transparent hover:text-muted-soft",
        day_outside:
          "text-muted-soft opacity-40",
      }}
    />
  </div>
)}
    </div>
  );
}