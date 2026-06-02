"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Pencil,
  Trash2,
  MapPin,
  Calendar,
  Banknote,
  User,
  Phone,
  MessageSquare,
  Globe,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { STATUS_OPTIONS, STATUS_COLORS, type Candidature, type Status } from "@/types";
import { Button } from "./ui/Button";

interface Props {
  candidatures: Candidature[];
  onEdit: (c: Candidature) => void;
  onDelete: (c: Candidature) => void;
  onStatusChange: (id: string, statut: Status) => Promise<void>;
}

const CONTRAT_COLORS: Record<string, string> = {
  CDI: "bg-blue-50 text-blue-700 border-blue-100",
  CDD: "bg-purple-50 text-purple-700 border-purple-100",
  Freelance: "bg-orange-50 text-orange-700 border-orange-100",
  Stage: "bg-green-50 text-green-700 border-green-100",
  Alternance: "bg-yellow-50 text-yellow-700 border-yellow-100",
};

const RYTHME_COLORS: Record<string, string> = {
  Présentiel: "bg-gray-100 text-gray-600 border-gray-200",
  Hybride: "bg-teal-50 text-teal-700 border-teal-100",
  "100% Télétravail": "bg-indigo-50 text-indigo-700 border-indigo-100",
};

function MiniTag({ label, colorClass }: { label: string; colorClass: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border",
        colorClass
      )}
    >
      {label}
    </span>
  );
}

function Row({ c, onEdit, onDelete, onStatusChange }: {
  c: Candidature;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (id: string, statut: Status) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleStatus = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    setUpdating(true);
    await onStatusChange(c.id, e.target.value as Status);
    setUpdating(false);
  };

  return (
    <>
      {/* Ligne principale */}
      <tr
        className={cn(
          "group border-b border-gray-100 transition-colors cursor-pointer",
          expanded ? "bg-orange-50/40" : "hover:bg-gray-50"
        )}
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Expand icon */}
        <td className="pl-4 pr-2 py-3 w-8">
          <span className="text-gray-300 group-hover:text-gray-500 transition-colors">
            {expanded ? (
              <ChevronDown size={15} />
            ) : (
              <ChevronRight size={15} />
            )}
          </span>
        </td>

        {/* Entreprise + Poste */}
        <td className="py-3 pr-4 min-w-[180px]">
          <p className="font-semibold text-gray-900 text-sm leading-tight">{c.entreprise}</p>
          {c.intitule_poste && (
            <p className="text-xs text-gray-400 mt-0.5 leading-tight">{c.intitule_poste}</p>
          )}
        </td>

        {/* Badges */}
        <td className="py-3 pr-4">
          <div className="flex items-center gap-1.5 flex-wrap">
            {c.type_contrat && (
              <MiniTag
                label={c.type_contrat}
                colorClass={CONTRAT_COLORS[c.type_contrat] ?? "bg-gray-100 text-gray-600 border-gray-200"}
              />
            )}
            {c.rythme_travail && (
              <MiniTag
                label={c.rythme_travail}
                colorClass={RYTHME_COLORS[c.rythme_travail] ?? "bg-gray-100 text-gray-600 border-gray-200"}
              />
            )}
          </div>
        </td>

        {/* Localisation */}
        <td className="py-3 pr-4 hidden md:table-cell">
          {c.localisation ? (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin size={11} className="shrink-0" />
              {c.localisation}
            </span>
          ) : (
            <span className="text-gray-300 text-xs">—</span>
          )}
        </td>

        {/* Date prochaine action */}
        <td className="py-3 pr-4 hidden lg:table-cell">
          {c.date_prochaine_action ? (
            <span className="flex items-center gap-1 text-xs font-medium text-brand">
              <Calendar size={11} className="shrink-0" />
              {formatDate(c.date_prochaine_action)}
            </span>
          ) : (
            <span className="text-gray-300 text-xs">—</span>
          )}
        </td>

        {/* Statut inline */}
        <td className="py-3 pr-4" onClick={(e) => e.stopPropagation()}>
          <div className="relative inline-block">
            <select
              value={c.statut}
              onChange={handleStatus}
              disabled={updating}
              className={cn(
                "appearance-none pl-2.5 pr-6 py-1 rounded-lg text-xs font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand/30 transition disabled:opacity-60",
                STATUS_COLORS[c.statut]
              )}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <ChevronDown
              size={10}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50"
            />
          </div>
        </td>

        {/* Actions */}
        <td className="py-3 pr-4" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {c.lien_offre && (
              <a
                href={c.lien_offre}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-md text-gray-400 hover:text-brand hover:bg-orange-50 transition"
                title="Voir l'annonce"
              >
                <ExternalLink size={13} />
              </a>
            )}
            <button
              onClick={onEdit}
              className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              title="Modifier"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
              title="Supprimer"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </td>
      </tr>

      {/* Ligne dépliée */}
      {expanded && (
        <tr className="border-b border-gray-100 bg-orange-50/20">
          <td colSpan={7} className="px-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* Rémunération */}
              {c.remuneration && (
                <DetailItem
                  icon={<Banknote size={13} />}
                  label="Rémunération"
                  value={c.remuneration}
                />
              )}

              {/* Source */}
              {c.source && (
                <DetailItem
                  icon={<Globe size={13} />}
                  label="Source"
                  value={c.source}
                />
              )}

              {/* Contact recruteur */}
              {c.contact_recruteur && (
                <DetailItem
                  icon={<User size={13} />}
                  label="Contact"
                  value={c.contact_recruteur}
                />
              )}

              {/* Coordonnées */}
              {c.contact_coordonnees && (
                <DetailItem
                  icon={<Phone size={13} />}
                  label="Email / Tél"
                  value={c.contact_coordonnees}
                />
              )}

              {/* Date candidature */}
              <DetailItem
                icon={<Calendar size={13} />}
                label="Date de candidature"
                value={formatDate(c.date)}
              />

              {/* Lien offre */}
              {c.lien_offre && (
                <div>
                  <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                    <ExternalLink size={13} />
                    Annonce
                  </p>
                  <a
                    href={c.lien_offre}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-brand hover:underline truncate block max-w-[200px]"
                  >
                    Voir l'offre →
                  </a>
                </div>
              )}

              {/* Commentaires (pleine largeur) */}
              {c.commentaires && (
                <div className="sm:col-span-2 lg:col-span-4">
                  <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                    <MessageSquare size={13} />
                    Notes
                  </p>
                  <p className="text-sm text-gray-700 bg-white border border-gray-100 rounded-lg px-3 py-2 leading-relaxed">
                    {c.commentaires}
                  </p>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
        {icon}
        {label}
      </p>
      <p className="text-sm text-gray-800 font-medium">{value}</p>
    </div>
  );
}

export function CandidatureTable({ candidatures, onEdit, onDelete, onStatusChange }: Props) {
  if (candidatures.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-lg font-medium">Aucune candidature trouvée</p>
        <p className="text-sm mt-1">
          Modifiez vos filtres ou ajoutez une nouvelle candidature.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/70">
            <th className="pl-4 pr-2 py-3 w-8" />
            <th className="py-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Entreprise / Poste
            </th>
            <th className="py-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Contrat
            </th>
            <th className="py-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
              Localisation
            </th>
            <th className="py-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
              Prochaine action
            </th>
            <th className="py-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Statut
            </th>
            <th className="py-3 pr-4 w-24" />
          </tr>
        </thead>
        <tbody>
          {candidatures.map((c) => (
            <Row
              key={c.id}
              c={c}
              onEdit={() => onEdit(c)}
              onDelete={() => onDelete(c)}
              onStatusChange={onStatusChange}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
