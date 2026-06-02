"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend
} from "recharts";
import { createClient } from "@/lib/supabase/client";
import { Briefcase, TrendingUp, Users, Clock } from "lucide-react";
import type { Candidature, Status } from "@/types";

// ─── Couleurs ──────────────────────────────────────────────────────────────
const ORANGE = "#F05A28";
const ORANGE_LIGHT = "#FF8C6A";
const ORANGE_PALE = "#FFD4C4";
const GRAY_DARK = "#374151";
const GRAY_MID = "#9CA3AF";
const GRAY_LIGHT = "#E5E7EB";

const PIE_COLORS = [ORANGE, "#374151", "#F97316", "#6B7280", "#FB923C", "#D1D5DB"];

const PIPELINE_STATUTS: Status[] = [
  "Envoyé", "Relancé", "Entretien RH",
  "Entretien Manager 1", "Entretien Manager 2",
  "Entretien Directeur", "Offre reçue", "Offre acceptée",
];

// ─── KPI Card ──────────────────────────────────────────────────────────────
function KpiCard({
  label, value, sub, icon: Icon, accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  accent?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${accent ? "bg-brand text-white" : "bg-orange-50 text-brand"}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500 leading-tight">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Section card ──────────────────────────────────────────────────────────
function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="mb-5">
        <h2 className="font-semibold text-gray-900">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// ─── Tooltip custom ────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name?: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-sm">
      {label && <p className="text-xs text-gray-500 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="font-semibold text-gray-900">{p.value} candidature{p.value > 1 ? "s" : ""}</p>
      ))}
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────
function getWeekLabel(date: Date) {
  const d = new Date(date);
  const day = d.getDay() === 0 ? 6 : d.getDay() - 1;
  d.setDate(d.getDate() - day);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

function getLast4Weeks() {
  const weeks: { label: string; start: Date; end: Date }[] = [];
  const now = new Date();
  for (let i = 3; i >= 0; i--) {
    const end = new Date(now);
    end.setDate(now.getDate() - i * 7);
    const start = new Date(end);
    start.setDate(end.getDate() - 6);
    weeks.push({ label: getWeekLabel(start), start, end });
  }
  return weeks;
}

// ─── Page principale ───────────────────────────────────────────────────────
export default function StatistiquesPage() {
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("candidatures").select("*");
      setCandidatures(data ?? []);
      setLoading(false);
    };
    load();
  }, []);

  // ── KPIs
  const kpis = useMemo(() => {
    const total = candidatures.length;
    const entretiens = candidatures.filter((c) =>
      ["Entretien RH", "Entretien Manager 1", "Entretien Manager 2", "Entretien Directeur"].includes(c.statut)
    ).length;
    const tauxConversion = total > 0 ? Math.round((entretiens / total) * 100) : 0;
    const enAttente = candidatures.filter((c) =>
      ["Envoyé", "Relancé"].includes(c.statut)
    ).length;
    return { total, entretiens, tauxConversion, enAttente };
  }, [candidatures]);

  // ── Activité par semaine
  const weekData = useMemo(() => {
    const weeks = getLast4Weeks();
    return weeks.map(({ label, start, end }) => ({
      label,
      count: candidatures.filter((c) => {
        const d = new Date(c.date);
        return d >= start && d <= end;
      }).length,
    }));
  }, [candidatures]);

  // ── Répartition par source
  const sourceData = useMemo(() => {
    const counts: Record<string, number> = {};
    candidatures.forEach((c) => {
      const src = c.source || "Non renseignée";
      counts[src] = (counts[src] ?? 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [candidatures]);

  // ── Pipeline par statut
  const pipelineData = useMemo(() => {
    return PIPELINE_STATUTS.map((statut) => ({
      statut: statut.replace("Entretien ", ""),
      count: candidatures.filter((c) => c.statut === statut).length,
    })).filter((d) => d.count > 0);
  }, [candidatures]);

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-40 bg-gray-200 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Statistiques</h1>
        <p className="text-gray-500 mt-1 text-sm">Analyse de votre recherche d'emploi</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Candidatures envoyées" value={kpis.total} icon={Briefcase} />
        <KpiCard label="Entretiens obtenus" value={kpis.entretiens} icon={Users} />
        <KpiCard label="Taux de conversion" value={`${kpis.tauxConversion}%`} icon={TrendingUp} accent />
        <KpiCard label="En attente de réponse" value={kpis.enAttente} sub="Envoyé ou Relancé" icon={Clock} />
      </div>

      {/* Activité par semaine */}
      <Section title="Activité sur les 4 dernières semaines" subtitle="Nombre de candidatures envoyées par semaine">
        {weekData.every((w) => w.count === 0) ? (
          <p className="text-center text-gray-400 text-sm py-10">Pas assez de données pour afficher ce graphique.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weekData} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRAY_LIGHT} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: GRAY_MID }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: GRAY_MID }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#FFF5F0" }} />
              <Bar dataKey="count" name="Candidatures" fill={ORANGE} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Section>

      {/* Bas : 2 graphiques côte à côte */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Donut Sources */}
        <Section title="Répartition par source" subtitle="D'où proviennent vos offres">
          {sourceData.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-10">Aucune donnée disponible.</p>
          ) : (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {sourceData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} candidature${Number(value) > 1 ? "s" : ""}`]}
                    contentStyle={{ borderRadius: "12px", border: "1px solid #E5E7EB", fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Légende custom */}
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
                {sourceData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs text-gray-600">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    {d.name} <span className="font-semibold text-gray-900">({d.value})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Section>

        {/* Pipeline horizontal */}
        <Section title="Entonnoir de conversion" subtitle="Volume par étape du processus">
          {pipelineData.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-10">Aucune donnée disponible.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={pipelineData}
                layout="vertical"
                barSize={20}
                margin={{ left: 20, right: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={GRAY_LIGHT} horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: GRAY_MID }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="statut"
                  tick={{ fontSize: 11, fill: GRAY_DARK }}
                  axisLine={false}
                  tickLine={false}
                  width={90}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "#FFF5F0" }} />
                <Bar dataKey="count" name="Candidatures" radius={[0, 6, 6, 0]}>
                  {pipelineData.map((_, i) => {
                    const ratio = 1 - i * (0.15);
                    const r = Math.round(240 * ratio);
                    const g = Math.round(90 * ratio);
                    const b = Math.round(40 * ratio);
                    return <Cell key={i} fill={`rgb(${r},${g},${b})`} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Section>
      </div>
    </div>
  );
}
