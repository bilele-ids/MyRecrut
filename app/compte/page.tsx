"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User, Lock, Palette, AlertTriangle, LogOut,
  Save, Moon, Sun, KeyRound, Trash2
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useTheme } from "@/components/ThemeProvider";
import { CONTRAT_OPTIONS, RYTHME_OPTIONS } from "@/types";

interface Profile {
  full_name: string;
  default_localisation: string;
  default_type_contrat: string;
  default_rythme_travail: string;
}

function Card({
  icon,
  title,
  subtitle,
  children,
  danger,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div className={`bg-white dark:bg-gray-900 rounded-2xl border ${danger ? "border-red-200 dark:border-red-900" : "border-gray-200 dark:border-gray-800"} overflow-hidden`}>
      <div className={`px-6 py-4 border-b ${danger ? "border-red-100 dark:border-red-900 bg-red-50/50 dark:bg-red-950/30" : "border-gray-100 dark:border-gray-800"}`}>
        <div className="flex items-center gap-3">
          <span className={danger ? "text-red-500" : "text-brand"}>{icon}</span>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm">{title}</h2>
            {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 ${checked ? "bg-brand" : "bg-gray-200 dark:bg-gray-700"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  );
}

export default function ComptePage() {
  const router = useRouter();
  const supabase = createClient();
  const { theme, toggle } = useTheme();

  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<Profile>({
    full_name: "",
    default_localisation: "",
    default_type_contrat: "",
    default_rythme_travail: "",
  });
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [resetMsg, setResetMsg] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      setEmail(user.email ?? "");

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (data) {
        setProfile({
          full_name: data.full_name ?? "",
          default_localisation: data.default_localisation ?? "",
          default_type_contrat: data.default_type_contrat ?? "",
          default_rythme_travail: data.default_rythme_travail ?? "",
        });
      }
    };
    load();
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("profiles").upsert({
      id: user.id,
      ...profile,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    setSavedMsg("Enregistré !");
    setTimeout(() => setSavedMsg(""), 2500);
  };

  const resetPassword = async () => {
    await supabase.auth.resetPasswordForEmail(email);
    setResetMsg("Email de réinitialisation envoyé à " + email);
    setTimeout(() => setResetMsg(""), 4000);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const deleteAccount = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("candidatures").delete().eq("user_id", user.id);
    await supabase.from("profiles").delete().eq("id", user.id);
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mon compte</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Gérez votre profil et vos préférences.</p>
      </div>

      <div className="space-y-5">

        {/* Carte Profil */}
        <Card icon={<User size={18} />} title="Profil" subtitle="Vos informations personnelles">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Email</p>
              <p className="text-sm text-gray-900 dark:text-white font-medium bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                {email}
              </p>
            </div>
            <Input
              id="full_name"
              label="Prénom / Nom"
              placeholder="Marie Dupont"
              value={profile.full_name}
              onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
            />
            <div className="flex items-center gap-3 pt-1">
              <Button onClick={saveProfile} disabled={saving} className="gap-2">
                <Save size={14} />
                {saving ? "Enregistrement…" : "Enregistrer"}
              </Button>
              {savedMsg && <span className="text-sm text-green-600 font-medium">{savedMsg}</span>}
              <Button variant="ghost" onClick={signOut} className="gap-2 ml-auto text-gray-500">
                <LogOut size={14} />
                Déconnexion
              </Button>
            </div>
          </div>
        </Card>

        {/* Carte Préférences */}
        <Card
          icon={<Palette size={18} />}
          title="Préférences de candidature"
          subtitle="Valeurs pré-remplies lors de la création d'une candidature"
        >
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="default_localisation"
              label="Localisation par défaut"
              placeholder="Paris"
              value={profile.default_localisation}
              onChange={(e) => setProfile((p) => ({ ...p, default_localisation: e.target.value }))}
            />
            <Select
              id="default_type_contrat"
              label="Type de contrat favori"
              value={profile.default_type_contrat}
              onChange={(e) => setProfile((p) => ({ ...p, default_type_contrat: e.target.value }))}
            >
              <option value="">— Aucun —</option>
              {CONTRAT_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Select
              id="default_rythme"
              label="Rythme de travail favori"
              value={profile.default_rythme_travail}
              onChange={(e) => setProfile((p) => ({ ...p, default_rythme_travail: e.target.value }))}
            >
              <option value="">— Aucun —</option>
              {RYTHME_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </Select>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <Button onClick={saveProfile} disabled={saving} className="gap-2">
              <Save size={14} />
              {saving ? "Enregistrement…" : "Enregistrer"}
            </Button>
            {savedMsg && <span className="text-sm text-green-600 font-medium">{savedMsg}</span>}
          </div>
        </Card>

        {/* Carte Apparence */}
        <Card icon={<Palette size={18} />} title="Apparence" subtitle="Personnalisez l'interface">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === "dark" ? (
                <Moon size={18} className="text-indigo-500" />
              ) : (
                <Sun size={18} className="text-yellow-500" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Mode sombre</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {theme === "dark" ? "Activé" : "Désactivé"}
                </p>
              </div>
            </div>
            <Toggle checked={theme === "dark"} onChange={toggle} />
          </div>
        </Card>

        {/* Carte Sécurité */}
        <Card
          icon={<Lock size={18} />}
          title="Sécurité"
          subtitle="Gestion du mot de passe et du compte"
          danger
        >
          <div className="space-y-4">
            {/* Reset password */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Réinitialiser le mot de passe</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Un email vous sera envoyé avec un lien de réinitialisation.
                </p>
              </div>
              <Button variant="secondary" onClick={resetPassword} className="gap-2 shrink-0 ml-4">
                <KeyRound size={14} />
                Réinitialiser
              </Button>
            </div>
            {resetMsg && (
              <p className="text-xs text-green-600 font-medium">{resetMsg}</p>
            )}

            {/* Delete account */}
            <div className="flex items-start justify-between py-3">
              <div>
                <p className="text-sm font-medium text-red-600">Supprimer mon compte</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Supprime définitivement votre compte et toutes vos candidatures. Action irréversible.
                </p>
              </div>
              <div className="shrink-0 ml-4">
                {!deleteConfirm ? (
                  <Button variant="danger" onClick={() => setDeleteConfirm(true)} className="gap-2">
                    <Trash2 size={14} />
                    Supprimer
                  </Button>
                ) : (
                  <div className="flex flex-col gap-2 items-end">
                    <p className="text-xs text-red-600 font-medium">Êtes-vous sûr ?</p>
                    <div className="flex gap-2">
                      <Button variant="danger" onClick={deleteAccount} className="gap-1 text-xs">
                        <AlertTriangle size={12} />
                        Oui, supprimer
                      </Button>
                      <Button variant="secondary" onClick={() => setDeleteConfirm(false)} className="text-xs">
                        Annuler
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
