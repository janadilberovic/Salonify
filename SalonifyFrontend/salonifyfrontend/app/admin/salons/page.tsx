"use client";

import { useEffect, useMemo, useState } from "react";
import { EyebrowLabel, Input, Rating, SalonCover } from "../../components/ui";
import ConfirmDialog from "../../components/ConfirmDialog";
import { showToast } from "../../components/Toast";
import { deleteSalonAdmin, getAllSalonsAdmin } from "@/services/admin";
import { AdminSalon } from "@/types/admin";
import { getImageUrl } from "../../lib/imageUrl";

export default function AdminSalonsPage() {
  const [salons, setSalons] = useState<AdminSalon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [salonToDelete, setSalonToDelete] = useState<AdminSalon | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getAllSalonsAdmin();
        setSalons(data);
      } catch (error) {
        console.error("Greška pri učitavanju salona:", error);
        showToast("Greška pri učitavanju salona.", "error");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const filteredSalons = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return salons;

    return salons.filter(
      (salon) =>
        salon.name.toLowerCase().includes(query) ||
        salon.city.toLowerCase().includes(query)
    );
  }, [salons, search]);

  async function handleDelete() {
    if (!salonToDelete) return;

    try {
      setDeleting(true);
      await deleteSalonAdmin(salonToDelete.id);
      setSalons((prev) => prev.filter((s) => s.id !== salonToDelete.id));
      showToast("Salon je obrisan.");
      setSalonToDelete(null);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Greška pri brisanju salona.",
        "error"
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/80 bg-white/80 p-8 shadow-softer">
        <EyebrowLabel>Saloni</EyebrowLabel>
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight">
          Upravljanje salonima
        </h1>
        <p className="mt-2 text-muted">
          Pregled svih salona. Brisanje salona uklanja i sve njegove termine i
          recenzije; vlasnički nalog ostaje.
        </p>
      </section>

      <Input
        placeholder="Pretraži po imenu ili gradu..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="sm:max-w-xs"
      />

      {loading ? (
        <p className="text-muted">Učitavanje salona...</p>
      ) : filteredSalons.length === 0 ? (
        <p className="text-muted">Nema salona za zadatu pretragu.</p>
      ) : (
        <ul className="space-y-3">
          {filteredSalons.map((salon) => (
            <li
              key={salon.id}
              className="flex flex-col gap-3 rounded-[1.5rem] border border-[var(--border)] bg-white p-5 shadow-softer sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-4">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-2xl bg-primary-soft">
                  <SalonCover
                    name={salon.name}
                    src={salon.imageUrl ? getImageUrl(salon.imageUrl) : undefined}
                    sizes="48px"
                    initialsClassName="text-lg"
                  />
                </div>

                <div className="min-w-0">
                  <p className="font-medium truncate">{salon.name}</p>
                  <p className="text-sm text-muted truncate">
                    {salon.city}
                    {salon.address ? ` · ${salon.address}` : ""}
                  </p>
                  <p className="text-xs text-muted">
                    Broj usluga: {salon.servicesCount}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="flex items-center gap-2">
                  <Rating value={salon.averageRating} showValue />
                  <span className="text-xs text-muted">
                    ({salon.reviewCount})
                  </span>
                </div>

                <button
                  onClick={() => setSalonToDelete(salon)}
                  className="px-4 py-2 rounded-2xl bg-danger-soft text-[#8a3948] hover:bg-[var(--danger)] hover:text-white transition text-sm font-medium"
                >
                  Obriši
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={salonToDelete !== null}
        title="Brisanje salona"
        message={`Da li sigurno želiš da obrišeš salon "${salonToDelete?.name}"? Biće obrisani i svi njegovi termini i recenzije.`}
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setSalonToDelete(null)}
      />
    </div>
  );
}
