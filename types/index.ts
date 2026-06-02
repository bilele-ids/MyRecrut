export type Status =
  | "Envoyé"
  | "Relancé"
  | "Entretien RH"
  | "Entretien Manager 1"
  | "Entretien Manager 2"
  | "Entretien Directeur"
  | "Offre reçue"
  | "Offre acceptée"
  | "Offre refusée"
  | "Refusé";

export type Source =
  | "LinkedIn"
  | "Welcome to the Jungle"
  | "Indeed"
  | "Candidature spontanée"
  | "Réseau"
  | "Autre";

export type RythmeTravail = "Présentiel" | "Hybride" | "100% Télétravail";
export type TypeContrat = "CDI" | "CDD" | "Freelance" | "Stage" | "Alternance";

export interface Candidature {
  id: string;
  user_id: string;
  entreprise: string;
  intitule_poste: string;
  statut: Status;
  lien_offre: string | null;
  source: string | null;
  localisation: string | null;
  rythme_travail: string | null;
  type_contrat: string | null;
  remuneration: string | null;
  contact_recruteur: string | null;
  contact_coordonnees: string | null;
  date_prochaine_action: string | null;
  commentaires: string | null;
  date: string;
  created_at: string;
  updated_at: string;
}

export type CandidatureInsert = Omit<
  Candidature,
  "id" | "user_id" | "created_at" | "updated_at"
>;

export interface Stats {
  total: number;
  entretiens: number;
  offres: number;
  tauxSucces: number;
}

export const STATUS_OPTIONS: Status[] = [
  "Envoyé",
  "Relancé",
  "Entretien RH",
  "Entretien Manager 1",
  "Entretien Manager 2",
  "Entretien Directeur",
  "Offre reçue",
  "Offre acceptée",
  "Offre refusée",
  "Refusé",
];

export const SOURCE_OPTIONS: Source[] = [
  "LinkedIn",
  "Welcome to the Jungle",
  "Indeed",
  "Candidature spontanée",
  "Réseau",
  "Autre",
];

export const RYTHME_OPTIONS: RythmeTravail[] = [
  "Présentiel",
  "Hybride",
  "100% Télétravail",
];

export const CONTRAT_OPTIONS: TypeContrat[] = [
  "CDI",
  "CDD",
  "Freelance",
  "Stage",
  "Alternance",
];

export const STATUS_COLORS: Record<Status, string> = {
  Envoyé: "bg-blue-100 text-blue-700",
  Relancé: "bg-yellow-100 text-yellow-700",
  "Entretien RH": "bg-orange-100 text-orange-700",
  "Entretien Manager 1": "bg-orange-100 text-orange-700",
  "Entretien Manager 2": "bg-orange-200 text-orange-800",
  "Entretien Directeur": "bg-purple-100 text-purple-700",
  "Offre reçue": "bg-emerald-100 text-emerald-700",
  "Offre acceptée": "bg-green-100 text-green-700",
  "Offre refusée": "bg-red-100 text-red-700",
  Refusé: "bg-gray-100 text-gray-600",
};
