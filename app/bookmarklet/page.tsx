"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bookmark, CheckCircle2, Chrome, MousePointer, Zap } from "lucide-react";

import { BookmarkletButton } from "@/components/BookmarkletButton";

const BOOKMARKLET = "";

export default function BookmarkletPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(BOOKMARKLET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="MyRecrut" width={30} height={30} className="rounded-lg" />
            <span className="font-bold text-gray-900">MyRecrut</span>
          </Link>
          <Link href="/candidatures" className="text-sm text-brand font-medium hover:underline">
            ← Mes candidatures
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bookmark size={26} className="text-brand" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Bookmarklet MyRecrut</h1>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto">
            Ajoutez une offre à MyRecrut en un clic depuis LinkedIn, Indeed ou Welcome to the Jungle — les champs sont pré-remplis automatiquement.
          </p>
        </div>

        {/* Bouton à glisser */}
        <div className="bg-white border-2 border-dashed border-brand/40 rounded-2xl p-8 text-center mb-8">
          <p className="text-sm text-gray-500 mb-5 font-medium">
            Glissez ce bouton dans votre barre de favoris :
          </p>
          <BookmarkletButton />
          <p className="text-xs text-gray-400 mt-4">
            Maintenez cliqué et glissez vers votre barre de favoris ↑
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <Chrome size={18} className="text-brand" />
            Comment installer
          </h2>
          <div className="space-y-4">
            {[
              {
                icon: <Chrome size={16} />,
                title: "Affichez la barre de favoris",
                desc: 'Sur Chrome : Ctrl+Maj+B (Windows) ou Cmd+Maj+B (Mac). Sur Safari : Présentation → Afficher la barre des favoris.',
              },
              {
                icon: <MousePointer size={16} />,
                title: "Glissez le bouton orange",
                desc: "Maintenez cliqué sur le bouton « + Ajouter à MyRecrut » ci-dessus et faites-le glisser dans votre barre de favoris.",
              },
              {
                icon: <Zap size={16} />,
                title: "Utilisez-le sur n'importe quelle offre",
                desc: "Sur LinkedIn, Indeed, WTTJ… ouvrez une fiche de poste et cliquez sur le bookmarklet. MyRecrut s'ouvre avec les champs pré-remplis !",
              },
            ].map(({ icon, title, desc }, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center shrink-0 text-brand mt-0.5">
                  {icon}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{title}</p>
                  <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sites compatibles */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Sites compatibles</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {["LinkedIn", "Indeed", "Welcome to the Jungle", "Autres sites"].map((site) => (
              <div key={site} className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle2 size={15} className="text-green-500 shrink-0" />
                {site}
              </div>
            ))}
          </div>
        </div>

        {/* Alternative : copier le code */}
        <div className="bg-gray-900 rounded-2xl p-6">
          <p className="text-gray-400 text-sm mb-3">
            Le glisser-déposer ne fonctionne pas ? Copiez le code et créez un favori manuellement :
          </p>
          <div className="bg-black/30 rounded-xl p-3 mb-3 overflow-x-auto">
            <code className="text-xs text-green-400 break-all">{BOOKMARKLET.slice(0, 120)}…</code>
          </div>
          <button
            onClick={handleCopy}
            className={`inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition ${copied ? "bg-green-500 text-white" : "bg-white text-gray-900 hover:bg-gray-100"}`}
          >
            {copied ? <><CheckCircle2 size={14} /> Copié !</> : "Copier le code complet"}
          </button>
          <p className="text-gray-500 text-xs mt-3">
            Puis : Gestionnaire de favoris → Nouveau favori → collez dans le champ URL.
          </p>
        </div>
      </div>
    </div>
  );
}
