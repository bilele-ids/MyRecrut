"use client";

import { useState } from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import {
  STATUS_OPTIONS,
  SOURCE_OPTIONS,
  RYTHME_OPTIONS,
  CONTRAT_OPTIONS,
  type Candidature,
  type CandidatureInsert,
} from "@/types";

interface Props {
  initial?: Partial<Candidature>;
  onSubmit: (data: CandidatureInsert) => Promise<void>;
  onCancel: () => void;
}

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-2 pb-1 border-t border-gray-100 first:border-0 first:pt-0">
    {children}
  </h3>
);

export function CandidatureForm({ initial, onSubmit, onCancel }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<CandidatureInsert>({
    entreprise: initial?.entreprise ?? "",
    intitule_poste: initial?.intitule_poste ?? "",
    statut: initial?.statut ?? "Envoyé",
    lien_offre: initial?.lien_offre ?? "",
    source: initial?.source ?? "",
    localisation: initial?.localisation ?? "",
    rythme_travail: initial?.rythme_travail ?? "",
    type_contrat: initial?.type_contrat ?? "",
    remuneration: initial?.remuneration ?? "",
    contact_recruteur: initial?.contact_recruteur ?? "",
    contact_coordonnees: initial?.contact_coordonnees ?? "",
    date_prochaine_action: initial?.date_prochaine_action ?? "",
    commentaires: initial?.commentaires ?? "",
    date: initial?.date ?? new Date().toISOString().split("T")[0],
  });

  const set =
    (field: keyof CandidatureInsert) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.entreprise.trim()) {
      setError("Le nom de l'entreprise est requis.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSubmit(form);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Une erreur est survenue."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Section 1 */}
      <SectionTitle>Informations essentielles</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <Input
          id="entreprise"
          label="Entreprise *"
          placeholder="Google, Airbnb…"
          value={form.entreprise}
          onChange={set("entreprise")}
          required
        />
        <Input
          id="intitule_poste"
          label="Intitulé du poste"
          placeholder="Product Manager…"
          value={form.intitule_poste}
          onChange={set("intitule_poste")}
        />
        <div className="col-span-2">
          <Select
            id="statut"
            label="Statut"
            value={form.statut}
            onChange={set("statut")}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Section 2 */}
      <SectionTitle>Détails de l'annonce</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Input
            id="lien_offre"
            label="Lien de l'annonce"
            placeholder="https://…"
            type="url"
            value={form.lien_offre ?? ""}
            onChange={set("lien_offre")}
          />
        </div>
        <Select
          id="source"
          label="Source"
          value={form.source ?? ""}
          onChange={set("source")}
        >
          <option value="">— Sélectionner —</option>
          {SOURCE_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <Input
          id="localisation"
          label="Localisation"
          placeholder="Paris, Lyon…"
          value={form.localisation ?? ""}
          onChange={set("localisation")}
        />
        <Select
          id="rythme_travail"
          label="Rythme de travail"
          value={form.rythme_travail ?? ""}
          onChange={set("rythme_travail")}
        >
          <option value="">— Sélectionner —</option>
          {RYTHME_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </Select>
        <Select
          id="type_contrat"
          label="Type de contrat"
          value={form.type_contrat ?? ""}
          onChange={set("type_contrat")}
        >
          <option value="">— Sélectionner —</option>
          {CONTRAT_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <div className="col-span-2">
          <Input
            id="remuneration"
            label="Rémunération"
            placeholder="45 000 € / an"
            value={form.remuneration ?? ""}
            onChange={set("remuneration")}
          />
        </div>
      </div>

      {/* Section 3 */}
      <SectionTitle>Suivi et contacts</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <Input
          id="contact_recruteur"
          label="Contact recruteur"
          placeholder="Marie Dupont, RH"
          value={form.contact_recruteur ?? ""}
          onChange={set("contact_recruteur")}
        />
        <Input
          id="contact_coordonnees"
          label="Email / Téléphone"
          placeholder="marie@exemple.com"
          value={form.contact_coordonnees ?? ""}
          onChange={set("contact_coordonnees")}
        />
        <Input
          id="date"
          label="Date de candidature"
          type="date"
          value={form.date}
          onChange={set("date")}
        />
        <Input
          id="date_prochaine_action"
          label="Date prochaine action"
          type="date"
          value={form.date_prochaine_action ?? ""}
          onChange={set("date_prochaine_action")}
        />
        <div className="col-span-2">
          <label
            htmlFor="commentaires"
            className="text-sm font-medium text-gray-700 block mb-1"
          >
            Notes / Commentaires
          </label>
          <textarea
            id="commentaires"
            rows={3}
            placeholder="Impressions, prochaines étapes…"
            value={form.commentaires ?? ""}
            onChange={set("commentaires")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition resize-none"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading
            ? "Enregistrement…"
            : initial?.id
            ? "Modifier"
            : "Ajouter"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
