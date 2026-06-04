"use client";

import { useEffect, useState } from "react";

type ToastType = "success" | "error" | "info";

type ToastPayload = {
  message: string;
  type?: ToastType;
};

type ToastItem = ToastPayload & {
  id: number;
  type: ToastType;
};

const TOAST_EVENT = "salonify:toast";

export function showToast(message: string, type: ToastType = "success") {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent<ToastPayload>(TOAST_EVENT, {
      detail: { message, type },
    })
  );
}

export default function ToastHost() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    function handleToast(event: Event) {
      const detail = (event as CustomEvent<ToastPayload>).detail;
      const id = Date.now();

      setToasts((prev) => [
        ...prev,
        {
          id,
          message: detail.message,
          type: detail.type ?? "success",
        },
      ]);

      window.setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 3200);
    }

    window.addEventListener(TOAST_EVENT, handleToast);

    return () => window.removeEventListener(TOAST_EVENT, handleToast);
  }, []);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={[
            "pointer-events-auto overflow-hidden rounded-2xl border bg-white px-4 py-3 shadow-lift",
            toast.type === "success"
              ? "border-[#bfe2cf]"
              : toast.type === "error"
              ? "border-[#ecc0c8]"
              : "border-[var(--border)]",
          ].join(" ")}
        >
          <div className="flex items-start gap-3">
            <span
              className={[
                "mt-1 size-2.5 shrink-0 rounded-full",
                toast.type === "success"
                  ? "bg-[#4f9b72]"
                  : toast.type === "error"
                  ? "bg-[#c75d70]"
                  : "bg-primary",
              ].join(" ")}
            />

            <p className="text-sm font-medium leading-5 text-foreground">
              {toast.message}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
