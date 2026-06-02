"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Candidature, CandidatureInsert, Status } from "@/types";

export function useCandidatures() {
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("candidatures")
      .select("*")
      .order("date", { ascending: false });

    if (error) setError(error.message);
    else setCandidatures(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const create = async (payload: CandidatureInsert) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Non authentifié");
    const cleaned = Object.fromEntries(
      Object.entries({ ...payload, user_id: user.id }).map(([k, v]) => [
        k,
        v === "" ? null : v,
      ])
    );
    const { data, error } = await supabase
      .from("candidatures")
      .insert(cleaned)
      .select()
      .single();
    if (error) throw new Error(error.message + " [" + error.code + "]");
    setCandidatures((prev) => [data, ...prev]);
    return data;
  };

  const update = async (id: string, payload: Partial<CandidatureInsert>) => {
    const { data, error } = await supabase
      .from("candidatures")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    setCandidatures((prev) => prev.map((c) => (c.id === id ? data : c)));
    return data;
  };

  const remove = async (id: string) => {
    const { error } = await supabase
      .from("candidatures")
      .delete()
      .eq("id", id);
    if (error) throw error;
    setCandidatures((prev) => prev.filter((c) => c.id !== id));
  };

  return { candidatures, loading, error, create, update, remove, refresh: fetch };
}

export function useStats(candidatures: Candidature[]) {
  const total = candidatures.length;
  const entretiens = candidatures.filter((c) =>
    ["Entretien RH", "Entretien Manager 1", "Entretien Manager 2", "Entretien Directeur"].includes(c.statut)
  ).length;
  const offres = candidatures.filter((c) =>
    ["Offre reçue", "Offre acceptée"].includes(c.statut)
  ).length;
  const tauxSucces =
    total > 0 ? Math.round((offres / total) * 100) : 0;
  return { total, entretiens, offres, tauxSucces };
}
