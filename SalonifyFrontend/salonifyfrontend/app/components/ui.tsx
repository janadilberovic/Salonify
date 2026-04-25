import type { ComponentPropsWithoutRef, ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";

/* ---------- Button ---------- */

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "soft";
type ButtonSize = "sm" | "md" | "lg";

const buttonBase =
  "inline-flex items-center justify-center gap-2 font-medium rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-hover shadow-[0_8px_24px_-8px_rgba(169,139,218,0.6)] hover:shadow-[0_10px_30px_-8px_rgba(169,139,218,0.8)]",
  secondary: "bg-accent text-[var(--accent-foreground)] hover:bg-[#f0b6ca]",
  ghost: "bg-transparent text-foreground hover:bg-primary-soft/60",
  outline:
    "bg-white text-foreground border border-[var(--border-strong)] hover:border-primary hover:text-primary",
  soft: "bg-primary-soft text-[#5a3e8a] hover:bg-[#dfcaf4]",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-13 px-8 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: ComponentPropsWithoutRef<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return (
    <button
      className={`${buttonBase} ${buttonVariants[variant]} ${buttonSizes[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className = "",
  children,
}: {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`${buttonBase} ${buttonVariants[variant]} ${buttonSizes[size]} ${className}`}
    >
      {children}
    </Link>
  );
}

/* ---------- Card ---------- */

export function Card({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`bg-white rounded-3xl border border-[var(--border)] shadow-soft ${className}`}
    >
      {children}
    </div>
  );
}

/* ---------- Input ---------- */

export function Input({
  className = "",
  ...rest
}: ComponentPropsWithoutRef<"input">) {
  return (
    <input
      className={`h-12 w-full rounded-2xl border border-[var(--border-strong)] bg-white/80 px-4 text-sm text-foreground placeholder:text-muted-soft focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary-soft/70 transition ${className}`}
      {...rest}
    />
  );
}

export function Textarea({
  className = "",
  ...rest
}: ComponentPropsWithoutRef<"textarea">) {
  return (
    <textarea
      className={`min-h-28 w-full rounded-2xl border border-[var(--border-strong)] bg-white/80 p-4 text-sm text-foreground placeholder:text-muted-soft focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary-soft/70 transition ${className}`}
      {...rest}
    />
  );
}

export function Select({
  className = "",
  children,
  ...rest
}: ComponentPropsWithoutRef<"select">) {
  return (
    <select
      className={`h-12 w-full rounded-2xl border border-[var(--border-strong)] bg-white/80 px-4 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary-soft/70 transition ${className}`}
      {...rest}
    >
      {children}
    </select>
  );
}

export function Label({
  children,
  htmlFor,
  className = "",
}: {
  children: ReactNode;
  htmlFor?: string;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-xs font-medium uppercase tracking-[0.12em] text-muted mb-2 ${className}`}
    >
      {children}
    </label>
  );
}

/* ---------- Status Badge ---------- */

export type AppointmentStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Cancelled"
  | "Completed"
  | 0
  | 1
  | 2
  | 3
  | 4;

const normalizeStatus = (status: AppointmentStatus) => {
  if (status === 0) return "Pending";
  if (status === 1) return "Approved";
  if (status === 2) return "Rejected";
  if (status === 3) return "Cancelled";
  if (status === 4) return "Completed";

  return status;
};

const statusStyles: Record<string, string> = {
  Pending: "bg-warning-soft text-[#8a5f24] border-[#f1d9a6]",
  Approved: "bg-success-soft text-[#2f6a51] border-[#bfe2cf]",
  Rejected: "bg-danger-soft text-[#8a3948] border-[#ecc0c8]",
  Cancelled: "bg-[#f1eef4] text-[#6d5f7c] border-[#dbd3e3]",
  Completed: "bg-info-soft text-[#3e4a72] border-[#c8d2ec]",
};

const statusLabels: Record<string, string> = {
  Pending: "Na čekanju",
  Approved: "Odobren",
  Rejected: "Odbijen",
  Cancelled: "Otkazan",
  Completed: "Završen",
};

export function StatusBadge({
  status,
  className = "",
}: {
  status: AppointmentStatus;
  className?: string;
}) {
  const normalized = normalizeStatus(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-xs font-medium border ${
        statusStyles[normalized] ?? "bg-gray-100 text-gray-600 border-gray-200"
      } ${className}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {statusLabels[normalized] ?? normalized}
    </span>
  );
}
/* ---------- Rating ---------- */

import { StarIcon, StarOutlineIcon } from "./Icons";

export function Rating({
  value,
  size = 16,
  showValue = false,
}: {
  value: number;
  size?: number;
  showValue?: boolean;
}) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <span className="inline-flex items-center gap-1 text-[var(--gold)]">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i + 1 <= rounded;
        const half = !filled && i + 0.5 <= rounded;
        return (
          <span key={i} className="relative inline-flex">
            {filled ? (
              <StarIcon width={size} height={size} />
            ) : half ? (
              <span className="relative inline-flex">
                <StarOutlineIcon width={size} height={size} />
                <span
                  className="absolute left-0 top-0 overflow-hidden"
                  style={{ width: size / 2 }}
                >
                  <StarIcon width={size} height={size} />
                </span>
              </span>
            ) : (
              <StarOutlineIcon
                width={size}
                height={size}
                className="text-[#e6d6bb]"
              />
            )}
          </span>
        );
      })}
      {showValue && (
        <span className="ml-1.5 text-xs font-semibold text-foreground">
          {value.toFixed(1)}
        </span>
      )}
    </span>
  );
}

/* ---------- Section heading ---------- */

export function EyebrowLabel({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
      <span className="h-px w-6 bg-primary/50" />
      {children}
    </span>
  );
}

/* ---------- Avatar ---------- */

export function Avatar({
  name,
  src,
  size = 40,
}: {
  name: string;
  src?: string;
  size?: number;
}) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (src) {
    return (
      <span
        className="relative inline-block rounded-full overflow-hidden border border-[var(--border)]"
        style={{ width: size, height: size }}
      >
        <Image
          src={src}
          alt={name}
          fill
          sizes={`${size}px`}
          className="object-cover"
        />
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center justify-center rounded-full bg-gradient-to-br from-[#efdff9] to-[#f9d3e3] text-[#6e4c9a] font-semibold"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials}
    </span>
  );
}
