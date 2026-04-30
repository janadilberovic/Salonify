"use client";

import { Suspense } from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Button,
  Input,
  Textarea,
  Label,
  EyebrowLabel,
} from "../../components/ui";

import {
  PhoneIcon,
  MapPinIcon,
  SparkleIcon,
  XIcon,
} from "../../components/Icons";

import { useMySalon } from "@/hooks/salon/UseMySalon";
import {
  updateSalonProfile,
  updateSalonImage,
  addSalonGalleryImage,
} from "@/services/salon";
import { TrashIcon } from "lucide-react";

function ProfilePageContent() {
  const { salon, loading, error } = useMySalon();
  const searchParams = useSearchParams();
  const welcome = searchParams.get("welcome");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    phone: "",
  });

  useEffect(() => {
    if (!salon) return;

    setForm({
      name: salon.name || "",
      description: salon.description || "",
      address: salon.address || "",
      city: salon.city || "",
      phone: salon.phone || "",
    });
  }, [salon]);
  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingGallery(true);

      await addSalonGalleryImage(file);

      window.location.reload();
    } catch {
      alert("Greška pri dodavanju slike.");
    } finally {
      setUploadingGallery(false);
    }
  }

  async function handleSaveProfile() {
    try {
      setSaving(true);

      await updateSalonProfile({
        name: form.name,
        description: form.description,
        address: form.address,
        city: form.city,
        phone: form.phone,
      });

      alert("Profil je uspešno sačuvan.");
    } catch {
      alert("Greška pri čuvanju profila.");
    } finally {
      setSaving(false);
    }
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);

      await updateSalonImage(file);

      window.location.reload();
    } catch {
      alert("Greška pri promeni slike.");
    } finally {
      setUploadingImage(false);
    }
  }

  if (loading) return <p>Učitavanje...</p>;
  if (error) return <p>{error}</p>;
  if (!salon) return <p>Nema podataka.</p>;

  return (
    <div className="space-y-6">
      {welcome && (
        <div className="mb-6 rounded-3xl border border-primary/20 bg-primary-soft p-6">
          <p className="text-sm font-semibold text-primary uppercase tracking-wide">
            Dobrodošli u Salonify
          </p>

          <h2 className="mt-2 text-2xl font-semibold">
            Unesite osnovne informacije o salonu
          </h2>

          <p className="mt-2 text-muted">
            Dodajte naziv, opis, adresu, broj telefona i fotografije kako bi
            korisnici mogli da pronađu vaš salon i zakažu termin.
          </p>
        </div>
      )}
      <div>
        <EyebrowLabel>Profil salona</EyebrowLabel>

        <h1 className="font-display mt-3 text-4xl font-semibold">
          Podaci o salonu
        </h1>

        <p className="text-muted mt-2">
          Uredi informacije koje klijenti vide na profilu salona.
        </p>
      </div>

      {/* COVER IMAGE */}
      <div className="relative rounded-3xl overflow-hidden shadow-softer">
        <div className="relative aspect-[3/1]">
          <Image
            src={salon.cover || "/images/salon-placeholder.jpg"}
            alt={salon.name || "Salon"}
            fill
            sizes="100vw"
            className="object-cover"
            unoptimized
            priority
            loading="eager"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg"
          hidden
          onChange={handleImageChange}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-4 right-4 bg-white/90 backdrop-blur text-sm font-medium px-4 h-10 rounded-full hover:bg-white"
        >
          {uploadingImage ? "Otpremanje..." : "Promeni sliku"}
        </button>
      </div>

      {/* FORME */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-[var(--border)] shadow-softer p-6 space-y-4">
          <h3 className="font-display text-xl font-semibold">Osnovni podaci</h3>

          <div>
            <Label>Naziv salona</Label>

            <Input
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
            />
          </div>

          <div>
            <Label>Opis salona</Label>

            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-[var(--border)] shadow-softer p-6 space-y-4">
          <h3 className="font-display text-xl font-semibold">Kontakt</h3>

          <div>
            <Label>
              <span className="inline-flex items-center gap-1.5">
                <MapPinIcon width={12} height={12} /> Adresa
              </span>
            </Label>

            <Input
              value={form.address}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  address: e.target.value,
                }))
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Grad</Label>

              <Input
                value={form.city}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    city: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <Label>
                <span className="inline-flex items-center gap-1.5">
                  <PhoneIcon width={12} height={12} /> Telefon
                </span>
              </Label>

              <Input
                value={form.phone}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div>
            <Label>Kategorije</Label>

            <div className="flex flex-wrap gap-2">
              {salon.categories.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full bg-primary-soft/70 text-[#5b3e8a]"
                >
                  {c}
                </span>
              ))}

              <Link
                href="/dashboard/services"
                className="text-xs font-medium px-3 py-1.5 rounded-full border border-dashed border-[var(--border-strong)] text-muted hover:border-primary hover:text-primary transition"
              >
                + Dodaj uslugu
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* SAVE */}
      <div className="flex justify-end">
        <Button onClick={handleSaveProfile} disabled={saving}>
          {saving ? "Čuvanje..." : "Sačuvaj izmene"}
        </Button>
      </div>

      {/* GALERIJA */}
      <div className="bg-white rounded-3xl border border-[var(--border)] shadow-softer p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl font-semibold">Galerija</h3>

          <>
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/png,image/jpeg"
              hidden
              onChange={handleGalleryUpload}
            />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => galleryInputRef.current?.click()}
              disabled={uploadingGallery}
            >
              {uploadingGallery ? "Otpremanje..." : "Dodaj slike"}
            </Button>
          </>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {salon.gallery.map((g, i) => (
            <div
              key={i}
              className="relative aspect-square rounded-2xl overflow-hidden"
            >
              <Image
                src={g}
                alt={`Slika ${i + 1}`}
                fill
                sizes="200px"
                className="object-cover"
                unoptimized
              />
            </div>
          ))}

          <button className="aspect-square rounded-2xl border border-dashed border-[var(--border-strong)] text-muted hover:text-primary hover:border-primary grid place-items-center transition">
            <SparkleIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<p>Učitavanje...</p>}>
      <ProfilePageContent />
    </Suspense>
  );
}
