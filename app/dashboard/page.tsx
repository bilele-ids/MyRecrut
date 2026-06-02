import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Briefcase, Users, Trophy, TrendingUp } from "lucide-react";
import type { Candidature } from "@/types";
import { STATUS_COLORS } from "@/types";
import type { Status } from "@/types";
import { formatDate } from "@/lib/utils";

async function getStats(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("candidatures")
    .select("statut")
    .eq("user_id", userId);

  const all: { statut: Status }[] = data ?? [];
  const total = all.length;
  const entretiens = all.filter((c) =>
    ["Entretien RH", "Entretien Manager 1", "Entretien Manager 2", "Entretien Directeur"].includes(c.statut)
  ).length;
  const offres = all.filter((c) =>
    ["Offre reçue", "Offre acceptée"].includes(c.statut)
  ).length;
  const tauxSucces = total > 0 ? Math.round((offres / total) * 100) : 0;
  return { total, entretiens, offres, tauxSucces };
}

async function getRecent(userId: string): Promise<Candidature[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("candidatures")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .limit(5);
  return data ?? [];
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [stats, recent] = await Promise.all([
    getStats(user.id),
    getRecent(user.id),
  ]);

  const cards = [
    {
      label: "Total candidatures",
      value: stats.total,
      icon: Briefcase,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Entretiens",
      value: stats.entretiens,
      icon: Users,
      color: "text-orange-600 bg-orange-50",
    },
    {
      label: "Offres reçues",
      value: stats.offres,
      icon: Trophy,
      color: "text-green-600 bg-green-50",
    },
    {
      label: "Taux de succès",
      value: `${stats.tauxSucces}%`,
      icon: TrendingUp,
      color: "text-brand bg-orange-50",
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Bonjour {user.email} — voici un résumé de votre recherche d&apos;emploi.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
              <Icon size={22} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Candidatures récentes */}
      <div className="bg-white border border-gray-200 rounded-2xl">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Candidatures récentes</h2>
        </div>
        {recent.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">
            Aucune candidature pour l&apos;instant. Ajoutez-en une !
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {recent.map((c) => (
              <li key={c.id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">{c.entreprise}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400 flex-wrap">
                    {c.intitule_poste && <span>{c.intitule_poste}</span>}
                    {c.localisation && <span>· {c.localisation}</span>}
                    {c.type_contrat && <span>· {c.type_contrat}</span>}
                    <span>· {formatDate(c.date)}</span>
                  </div>
                </div>
                <span
                  className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[c.statut] ?? "bg-gray-100 text-gray-600"}`}
                >
                  {c.statut}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
