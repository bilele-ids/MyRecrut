"use client";

import { ExternalLink, Pencil, Trash2, MapPin, Calendar, ChevronDown } from "lucide-react";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { formatDate } from "@/lib/utils";
import { STATUS_OPTIONS, STATUS_COLORS, type Candidature, type Status } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  candidature: Candidature;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (id: string, statut: Status) => Promise<void>;
}

export function CandidatureRow({ candidature: c, onEdit, onDelete, onStatusChange }: Props) {
  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    await onStatusChange(c.id, e.target.value as Status);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-shadow">
      {/* Info principale */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-gray-900 text-sm">{c.entreprise}</span>
          {c.intitule_poste && (
            <span className="text-sm text-gray-500">· {c.intitule_poste}</span>
          )}
          {c.type_contrat && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {c.type_contrat}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 flex-wrap">
          {c.localisation && (
            <span className="flex items-center gap-1">
              <MapPin size={11} />
              {c.localisation}
            </span>
          )}
          {c.rythme_travail && <span>{c.rythme_travail}</span>}
          {c.remuneration && <span>{c.remuneration}</span>}
          {c.source && <span>{c.source}</span>}
          <span className="flex items-center gap-1">
            <Calendar size={11} />
            {formatDate(c.date)}
          </span>
          {c.date_prochaine_action && (
            <span className="flex items-center gap-1 text-brand font-medium">
              <Calendar size={11} />
              Prochain : {formatDate(c.date_prochaine_action)}
            </span>
          )}
        </div>
        {c.commentaires && (
          <p className="mt-1.5 text-xs text-gray-400 line-clamp-1">{c.commentaires}</p>
        )}
      </div>

      {/* Statut inline */}
      <div className="relative shrink-0">
        <select
          value={c.statut}
          onChange={handleStatusChange}
          className={cn(
            "appearance-none pl-3 pr-7 py-1.5 rounded-full text-xs font-medium border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-brand transition",
            STATUS_COLORS[c.statut]
          )}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <ChevronDown
          size={11}
          className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {c.lien_offre && (
          <a
            href={c.lien_offre}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-lg text-gray-400 hover:text-brand hover:bg-orange-50 transition"
            title="Voir l'annonce"
          >
            <ExternalLink size={15} />
          </a>
        )}
        <Button variant="ghost" size="sm" onClick={onEdit} className="p-1.5">
          <Pencil size={15} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50"
        >
          <Trash2 size={15} />
        </Button>
      </div>
    </div>
  );
}
