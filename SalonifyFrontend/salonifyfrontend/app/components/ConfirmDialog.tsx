"use client";

import { Button } from "./ui";

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmText = "Obriši",
  loading = false,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#2b1b3a]/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-[2rem] bg-white border border-white/70 shadow-2xl p-7">
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-display text-2xl font-semibold text-[#2d1836]">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="size-10 rounded-full bg-[var(--background-soft)] hover:bg-primary-soft transition grid place-items-center text-muted hover:text-primary"
          >
            ✕
          </button>
        </div>

        <p className="mt-3 text-sm leading-6 text-muted">{message}</p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-3 rounded-2xl bg-[var(--background-soft)] text-foreground/80 hover:bg-primary-soft transition font-medium text-sm"
          >
            Odustani
          </button>

          <Button type="button" onClick={onConfirm} disabled={loading}>
            {loading ? "Brisanje..." : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
