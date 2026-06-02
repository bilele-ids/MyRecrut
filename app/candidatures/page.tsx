"use client";

import { useMemo, useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { useCandidatures } from "@/hooks/useCandidatures";
import { CandidatureTable } from "@/components/CandidatureTable";
import { CandidatureForm } from "@/components/CandidatureForm";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { STATUS_OPTIONS, type Candidature, type CandidatureInsert, type Status } from "@/types";

export default function CandidaturesPage() {
  const { candidatures, loading, create, update, remove } = useCandidatures();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Candidature | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Candidature | null>(null);

  const filtered = useMemo(() => {
    return candidatures.filter((c) => {
      const matchSearch =
        !search ||
        c.entreprise.toLowerCase().includes(search.toLowerCase()) ||
        (c.intitule_poste ?? "").toLowerCase().includes(search.toLowerCase());
      const matchStatus = !filterStatus || c.statut === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [candidatures, search, filterStatus]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (c: Candidature) => {
    setEditing(c);
    setModalOpen(true);
  };

  const handleSubmit = async (data: CandidatureInsert) => {
    if (editing) {
      await update(editing.id, data);
    } else {
      await create(data);
    }
    setModalOpen(false);
    setEditing(null);
  };

  const handleStatusChange = async (id: string, statut: Status) => {
    await update(id, { statut });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await remove(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidatures</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {filtered.length} candidature{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus size={16} />
          Ajouter
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Rechercher une entreprise ou un poste…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand bg-white"
          />
        </div>
        <div className="relative">
          <Filter
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand appearance-none"
          >
            <option value="">Tous les statuts</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 border-b border-gray-100 animate-pulse bg-gray-50" />
          ))}
        </div>
      ) : (
        <CandidatureTable
          candidatures={filtered}
          onEdit={openEdit}
          onDelete={setDeleteTarget}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        title={editing ? "Modifier la candidature" : "Nouvelle candidature"}
        className="max-w-2xl"
      >
        <CandidatureForm
          initial={editing ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => { setModalOpen(false); setEditing(null); }}
        />
      </Modal>

      {/* Delete confirmation */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Supprimer la candidature"
        className="max-w-sm"
      >
        <p className="text-sm text-gray-600 mb-6">
          Voulez-vous vraiment supprimer la candidature chez{" "}
          <strong>{deleteTarget?.entreprise}</strong> ? Cette action est irréversible.
        </p>
        <div className="flex gap-3">
          <Button variant="danger" onClick={handleDelete} className="flex-1">
            Supprimer
          </Button>
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
            Annuler
          </Button>
        </div>
      </Modal>
    </div>
  );
}
