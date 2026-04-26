"use client";

import Link from "next/link";
import { useState } from "react";
import AuthShell from "../components/AuthShell";
import { Button, Input, Label } from "../components/ui";
import {
  ArrowRightIcon,
  UserIcon,
  ScissorsIcon,
  CheckIcon,
} from "../components/Icons";
import { useRegister } from "@/hooks/useRegister";

export default function RegisterPage() {
  const [role, setRole] = useState<"user" | "salon">("user");

  const [firstName, setFirstName] = useState("");
  const [lastOrSalonName, setLastOrSalonName] = useState("");
  const [salonDescription, setSalonDescription] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordError, setPasswordError] = useState("");

  const { register, loading, error } = useRegister();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setPasswordError("Lozinke se ne poklapaju.");
      return;
    }

    setPasswordError("");

    const displayName =
      role === "salon"
        ? lastOrSalonName
        : `${firstName} ${lastOrSalonName}`.trim();

    await register({
      email,
      password,
      displayName,
      role: role === "user" ? 0 : 1,
      phone: phoneNumber ? phoneNumber : "string",
      salonDescription: role === "salon" ? salonDescription : undefined,
    });
  };

  return (
    <AuthShell
      title="Kreiraj nalog"
      subtitle="Pridruži se Salonify aplikaciji brzo i jednostavno."
      footer={
        <>
          Već imaš nalog?{" "}
          <Link
            href="/login"
            className="text-primary font-semibold hover:underline"
          >
            Prijavi se
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Label>Registrujem se kao</Label>

          <div className="grid grid-cols-2 gap-3">
            <RoleTile
              active={role === "user"}
              onClick={() => setRole("user")}
              icon={<UserIcon />}
              title="Klijent"
              subtitle="Zakazujem termine"
            />

            <RoleTile
              active={role === "salon"}
              onClick={() => setRole("salon")}
              icon={<ScissorsIcon />}
              title="Salon"
              subtitle="Upravljam poslovanjem"
            />
          </div>
        </div>

        {role === "salon" ? (
          <div className="space-y-3">
            <div>
              <Label htmlFor="last">Naziv salona</Label>
              <Input
                id="last"
                placeholder="Beauty Studio"
                value={lastOrSalonName}
                onChange={(e) => setLastOrSalonName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="description">Opis salona</Label>
              <Input
                id="description"
                placeholder="Profesionalne usluge nege, frizure, nokti..."
                value={salonDescription}
                onChange={(e) => setSalonDescription(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first">Ime</Label>
              <Input
                id="first"
                placeholder="Mila"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="last">Prezime</Label>
              <Input
                id="last"
                placeholder="Jovanović"
                value={lastOrSalonName}
                onChange={(e) => setLastOrSalonName(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
        )}
        <div>
          <Label htmlFor="phone">Broj telefona</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="0612345678"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={loading}
          />
        </div>
        <div>
          <Label htmlFor="email">Email adresa</Label>
          <Input
            id="email"
            type="email"
            placeholder="ime@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <Label htmlFor="password">Lozinka</Label>
          <Input
            id="password"
            type="password"
            placeholder="Unesite lozinku"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <Label htmlFor="confirmPassword">Ponovite lozinku</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Ponovite lozinku"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        {passwordError && (
          <p className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {passwordError}
          </p>
        )}

        {error && (
          <p className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <label className="flex items-start gap-2.5 text-sm text-foreground/80">
          <input
            type="checkbox"
            defaultChecked
            className="mt-0.5 size-4 accent-[var(--primary)] rounded"
          />

          <span>
            Prihvatam{" "}
            <Link href="#" className="text-primary hover:underline">
              uslove korišćenja
            </Link>{" "}
            i{" "}
            <Link href="#" className="text-primary hover:underline">
              politiku privatnosti
            </Link>
            .
          </span>
        </label>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Kreiranje naloga..." : "Kreiraj nalog"}

          {!loading && <ArrowRightIcon width={16} height={16} />}
        </Button>
      </form>
    </AuthShell>
  );
}

function RoleTile({
  active,
  onClick,
  icon,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative text-left p-5 rounded-2xl border-2 transition cursor-pointer ${
        active
          ? "border-primary bg-primary-soft/50"
          : "border-[var(--border-strong)] bg-white hover:border-primary/60"
      }`}
    >
      <span
        className={`inline-flex items-center justify-center size-10 rounded-xl ${
          active ? "bg-primary text-white" : "bg-primary-soft text-primary"
        }`}
      >
        {icon}
      </span>

      <p className="mt-3 text-sm font-semibold">{title}</p>
      <p className="text-xs text-muted mt-0.5">{subtitle}</p>

      {active && (
        <span className="absolute top-3 right-3 size-6 rounded-full bg-primary text-white grid place-items-center">
          <CheckIcon width={12} height={12} />
        </span>
      )}
    </button>
  );
}
