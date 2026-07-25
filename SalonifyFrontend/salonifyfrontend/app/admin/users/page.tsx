"use client";

import { useEffect, useMemo, useState } from "react";
import { Avatar, EyebrowLabel, Input, Select } from "../../components/ui";
import ConfirmDialog from "../../components/ConfirmDialog";
import { showToast } from "../../components/Toast";
import { deleteUser, getAllUsers } from "@/services/admin";
import { AdminUser } from "@/types/admin";

const ROLE_LABELS: Record<string, string> = {
  User: "Korisnik",
  Salon: "Salon",
  Admin: "Admin",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getAllUsers();
        setUsers(data);
      } catch (error) {
        console.error("Greška pri učitavanju korisnika:", error);
        showToast("Greška pri učitavanju korisnika.", "error");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      if (roleFilter && user.role !== roleFilter) return false;

      if (!query) return true;

      return (
        user.displayName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    });
  }, [users, search, roleFilter]);

  async function handleDelete() {
    if (!userToDelete) return;

    try {
      setDeleting(true);
      await deleteUser(userToDelete.id);
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      showToast("Korisnik je obrisan.");
      setUserToDelete(null);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Greška pri brisanju korisnika.",
        "error"
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/80 bg-white/80 p-8 shadow-softer">
        <EyebrowLabel>Korisnici</EyebrowLabel>
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight">
          Upravljanje korisnicima
        </h1>
        <p className="mt-2 text-muted">
          Pregled svih naloga u sistemu. Brisanje Salon naloga briše i njegov
          salon sa terminima i recenzijama.
        </p>
      </section>

      <section className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Pretraži po imenu ili emailu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />

        <Select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="sm:max-w-45"
        >
          <option value="">Sve uloge</option>
          <option value="User">Korisnik</option>
          <option value="Salon">Salon</option>
          <option value="Admin">Admin</option>
        </Select>
      </section>

      {loading ? (
        <p className="text-muted">Učitavanje korisnika...</p>
      ) : filteredUsers.length === 0 ? (
        <p className="text-muted">Nema korisnika za zadate filtere.</p>
      ) : (
        <ul className="space-y-3">
          {filteredUsers.map((user) => (
            <li
              key={user.id}
              className="flex flex-col gap-3 rounded-[1.5rem] border border-[var(--border)] bg-white p-5 shadow-softer sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-4">
                <Avatar name={user.displayName || "?"} size={44} />

                <div className="min-w-0">
                  <p className="font-medium truncate">{user.displayName}</p>
                  <p className="text-sm text-muted truncate">{user.email}</p>
                  {user.phone && (
                    <p className="text-xs text-muted">{user.phone}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <span className="inline-flex h-7 items-center rounded-full bg-primary-soft px-3 text-xs font-medium text-primary">
                  {ROLE_LABELS[user.role] ?? user.role}
                </span>

                <span className="text-xs text-muted">
                  {new Date(user.createdAt).toLocaleDateString("sr-RS")}
                </span>

                {user.role !== "Admin" && (
                  <button
                    onClick={() => setUserToDelete(user)}
                    className="px-4 py-2 rounded-2xl bg-danger-soft text-[#8a3948] hover:bg-[var(--danger)] hover:text-white transition text-sm font-medium"
                  >
                    Obriši
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={userToDelete !== null}
        title="Brisanje korisnika"
        message={
          userToDelete?.role === "Salon"
            ? `Da li sigurno želiš da obrišeš nalog "${userToDelete?.displayName}"? Biće obrisan i njegov salon, zajedno sa svim terminima i recenzijama.`
            : `Da li sigurno želiš da obrišeš nalog "${userToDelete?.displayName}"? Biće obrisani i njegovi termini i recenzije.`
        }
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setUserToDelete(null)}
      />
    </div>
  );
}
