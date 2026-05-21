"use client";

import { useMemo, useRef, useState } from "react";
import { MapPinIcon } from "./Icons";

type Props = {
  value: string | null;
  cities: string[];
  onChange: (city: string | null) => void;
};

export default function PrettyCitySelect({ value, cities, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const filteredCities = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return cities;

    return cities.filter((city) => city.toLowerCase().includes(q));
  }, [cities, search]);

  function openDropdown() {
    setOpen(true);
    setSearch("");

    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }

  function closeDropdown() {
    setOpen(false);
    setSearch("");
  }

  return (
    <div className="relative w-full">
      <div
        className={`w-full h-12 rounded-2xl px-4 text-sm font-medium flex items-center justify-between gap-3 transition ${
          open
            ? "bg-white border border-primary shadow-soft"
            : "bg-transparent border border-transparent hover:bg-white/70"
        }`}
      >
        <span className="inline-flex items-center gap-2 min-w-0 flex-1">
          <MapPinIcon className="text-primary shrink-0" />

          {open ? (
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pretraži grad..."
              className="w-full bg-transparent outline-none text-sm placeholder:text-muted-soft"
            />
          ) : (
            <button
              type="button"
              onClick={openDropdown}
              className={`truncate text-left w-full ${
                value ? "text-foreground" : "text-muted"
              }`}
            >
              {value || "Svi gradovi"}
            </button>
          )}
        </span>

        <button
          type="button"
          onClick={() => {
            if (open) {
              closeDropdown();
            } else {
              openDropdown();
            }
          }}
          className={`shrink-0 text-muted transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          ↓
        </button>
      </div>

      {open && (
        <div className="absolute left-0 right-0 z-[9999] mt-3 w-full rounded-3xl border border-[var(--border)] bg-white p-3 shadow-lift">
          <div className="max-h-64 overflow-y-auto pr-1 space-y-1">
            <button
              type="button"
              onClick={() => {
                onChange(null);
                closeDropdown();
              }}
              className={`w-full h-11 rounded-2xl px-4 text-left text-sm font-medium transition flex items-center justify-between ${
                !value
                  ? "bg-primary text-white shadow-soft"
                  : "text-foreground hover:bg-primary-soft hover:text-primary"
              }`}
            >
              <span>Svi gradovi</span>
              {!value && <span>✓</span>}
            </button>

            {filteredCities.map((city) => {
              const selected = value === city;

              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => {
                    onChange(city);
                    closeDropdown();
                  }}
                  className={`w-full h-11 rounded-2xl px-4 text-left text-sm font-medium transition flex items-center justify-between ${
                    selected
                      ? "bg-primary text-white shadow-soft"
                      : "text-foreground hover:bg-primary-soft hover:text-primary"
                  }`}
                >
                  <span className="truncate">{city}</span>
                  {selected && <span>✓</span>}
                </button>
              );
            })}

            {filteredCities.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-sm font-medium text-foreground">
                  Nema pronađenih gradova.
                </p>
                <p className="mt-1 text-xs text-muted">
                  Pokušaj drugi naziv grada.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}