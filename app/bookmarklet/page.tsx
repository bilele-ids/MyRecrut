"use client";

import Link from "next/link";
import Image from "next/image";
import { Chrome, CheckCircle2, Download, Puzzle, ArrowRight } from "lucide-react";

export default function BookmarkletPage() {
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

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Puzzle size={26} className="text-brand" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Extension Chrome</h1>
          <p className="mt-3 text-gray-500 max-w-md mx-auto">
            Un bouton orange apparaît sur chaque offre LinkedIn, Indeed ou WTTJ. Cliquez dessus — MyRecrut s&apos;ouvre avec tout pré-rempli.
          </p>
        </div>

        {/* Téléchargement */}
        <div className="bg-white rounded-2xl border-2 border-brand/30 p-8 text-center mb-6 shadow-sm">
          <p className="text-sm text-gray-500 mb-6">Cliquez pour télécharger l&apos;extension :</p>
          <a
            href="/myrecrut-extension.zip"
            download="myrecrut-extension.zip"
            className="inline-flex items-center gap-3 bg-brand hover:bg-brand-dark text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-orange-200 transition text-base"
          >
            <Download size={20} />
            Télécharger l&apos;extension (.zip)
          </a>
          <p className="text-xs text-gray-400 mt-4">Gratuit · Fonctionne sur Chrome et Edge</p>
        </div>

        {/* Installation */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <Chrome size={18} className="text-brand" />
            Installation en 3 étapes
          </h2>
          <div className="space-y-5">
            {[
              {
                num: "1",
                title: "Décompressez le fichier",
                desc: "Double-cliquez sur myrecrut-extension.zip pour extraire le dossier.",
              },
              {
                num: "2",
                title: "Ouvrez les extensions Chrome",
                desc: 'Dans Chrome, allez sur chrome://extensions — activez le "Mode développeur" en haut à droite.',
              },
              {
                num: "3",
                title: "Chargez l\'extension",
                desc: 'Cliquez "Charger l\'extension non empaquetée" → sélectionnez le dossier myrecrut-extension.',
              },
            ].map(({ num, title, desc }) => (
              <div key={num} className="flex gap-4">
                <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center shrink-0 text-white font-bold text-sm">
                  {num}
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
          <div className="grid grid-cols-2 gap-3">
            {["LinkedIn", "Indeed", "Welcome to the Jungle", "HelloWork"].map((site) => (
              <div key={site} className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle2 size={15} className="text-green-500 shrink-0" />
                {site}
              </div>
            ))}
          </div>
        </div>

        {/* Partager */}
        <div className="bg-gray-900 rounded-2xl p-6 text-center">
          <p className="text-gray-300 font-medium mb-2">Partager à un ami</p>
          <p className="text-gray-500 text-sm mb-4">Envoyez-lui ce lien — il peut télécharger et installer en 2 minutes.</p>
          <div className="bg-black/30 rounded-xl px-4 py-3 text-green-400 text-sm font-mono mb-4 break-all">
            https://myrecrut.vercel.app/bookmarklet
          </div>
          <Link
            href="/candidatures"
            className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition"
          >
            Mes candidatures <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
