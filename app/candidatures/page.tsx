"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Search, Filter, Link2 } from "lucide-react";
import { useCandidatures } from "@/hooks/useCandidatures";
import { CandidatureTable } from "@/components/CandidatureTable";
import { CandidatureForm } from "@/components/CandidatureForm";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { STATUS_OPTIONS, type Candidature, type CandidatureInsert, type Status } from "@/types";

// Détecte la source depuis une URL
function detectSource(url: string): string {
  if (url.includes("linkedin.com")) return "LinkedIn";
  if (url.includes("indeed.")) return "Indeed";
  if (url.includes("welcometothejungle.com")) return "Welcome to the Jungle";
  if (url.includes("hellowork.com")) return "Autre";
  return "Autre";
}

function CandidaturesInner() {
  const { candidatures, loading, create, update, remove } = useCandidatures();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Candidature | null>(null);
  const [prefillData, setPrefillData] = useState<Partial<CandidatureInsert> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Candidature | null>(null);

  // Modal "Coller un lien"
  const [urlModalOpen, setUrlModalOpen] = useState(false);
  const [pastedUrl, setPastedUrl] = useState("");
  const [scraping, setScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState("");

  // Pré-remplissage depuis extension/bookmarklet (URL params)
  const prefillFromParams = useMemo(() => {
    const lien = searchParams.get("lien");
    if (!lien) return null;
    return {
      entreprise: searchParams.get("entreprise") ?? "",
      intitule_poste: searchParams.get("poste") ?? "",
      source: searchParams.get("source") ?? "",
      lien_offre: lien,
      localisation: searchParams.get("localisation") ?? "",
    };
  }, [searchParams]);

  useEffect(() => {
    if (prefillFromParams) {
      setPrefillData(prefillFromParams);
      setEditing(null);
      setModalOpen(true);
    }
  }, [prefillFromParams]);

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
    setPrefillData(null);
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (c: Candidature) => {
    setPrefillData(null);
    setEditing(c);
    setModalOpen(true);
  };

  // Scraper l'URL et ouvrir le formulaire pré-rempli
  const handleUrlSubmit = async () => {
    const url = pastedUrl.trim();
    if (!url) return;
    setScraping(true);
    setScrapeError("");
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      setPrefillData({
        lien_offre: data.lien_offre || url,
        source: data.source || detectSource(url),
        entreprise: data.entreprise || "",
        intitule_poste: data.intitule_poste || "",
        localisation: data.localisation || "",
        remuneration: data.remuneration || "",
        type_contrat: data.type_contrat || "",
        commentaires: data.commentaires || "",
      });
      setEditing(null);
      setUrlModalOpen(false);
      setPastedUrl("");
      setModalOpen(true);
    } catch {
      setScrapeError("Impossible de récupérer les infos. Le lien et la source seront pré-remplis.");
      setPrefillData({ lien_offre: url, source: detectSource(url), entreprise: "", intitule_poste: "" });
      setUrlModalOpen(false);
      setPastedUrl("");
      setModalOpen(true);
    } finally {
      setScraping(false);
    }
  };

  const handleSubmit = async (data: CandidatureInsert) => {
    if (editing) {
      await update(editing.id, data);
    } else {
      await create(data);
    }
    setModalOpen(false);
    setEditing(null);
    setPrefillData(null);
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
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setUrlModalOpen(true)} className="gap-2">
            <Link2 size={15} />
            Depuis un lien
          </Button>
          <Button onClick={openCreate} className="gap-2">
            <Plus size={16} />
            Ajouter
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Rechercher une entreprise ou un poste…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand bg-white"
          />
        </div>
        <div className="relative">
          <Filter size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
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

      {/* Modal "Depuis un lien" */}
      <Modal
        isOpen={urlModalOpen}
        onClose={() => { setUrlModalOpen(false); setPastedUrl(""); }}
        title="Ajouter depuis un lien"
        className="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Collez l&apos;URL d&apos;une offre LinkedIn, Indeed, WTTJ ou autre. La source sera détectée automatiquement.
          </p>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">URL de l&apos;offre</label>
            <input
              type="url"
              placeholder="https://www.linkedin.com/jobs/view/..."
              value={pastedUrl}
              onChange={(e) => setPastedUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
              autoFocus
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          {pastedUrl && (
            <p className="text-xs text-brand font-medium">
              Source détectée : {detectSource(pastedUrl)}
            </p>
          )}
          {scrapeError && <p className="text-xs text-red-500">{scrapeError}</p>}
          <div className="flex gap-3 pt-1">
            <Button onClick={handleUrlSubmit} disabled={!pastedUrl.trim() || scraping} className="flex-1 gap-2">
              <Link2 size={14} />
              {scraping ? "Analyse en cours…" : "Importer l'offre"}
            </Button>
            <Button variant="secondary" onClick={() => { setUrlModalOpen(false); setPastedUrl(""); setScrapeError(""); }}>
              Annuler
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); setPrefillData(null); }}
        title={editing ? "Modifier la candidature" : "Nouvelle candidature"}
        className="max-w-2xl"
      >
        <CandidatureForm
          initial={editing ?? prefillData ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => { setModalOpen(false); setEditing(null); setPrefillData(null); }}
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
          <Button variant="danger" onClick={handleDelete} className="flex-1">Supprimer</Button>
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Annuler</Button>
        </div>
      </Modal>
    </div>
  );
}

export default function CandidaturesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-400">Chargement…</div>}>
      <CandidaturesInner />
    </Suspense>
  );
}
