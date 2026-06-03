import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  BarChart2,
  Bell,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">

      {/* ── HEADER ──────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="MyRecrut" width={36} height={36} className="rounded-xl" />
            <span className="text-xl font-bold text-gray-900 tracking-tight">MyRecrut</span>
          </Link>

          {/* Nav */}
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition px-3 py-2"
            >
              Se connecter
            </Link>
            <Link
              href="/auth/register"
              className="text-sm font-semibold bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-lg transition shadow-sm shadow-orange-200"
            >
              S&apos;inscrire
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-20 pb-16">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-brand text-xs font-semibold px-4 py-1.5 rounded-full mb-8">
          <CheckCircle2 size={13} />
          100% gratuit · Aucune carte requise
        </div>

        {/* H1 */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight max-w-3xl">
          Pilotez votre recherche{" "}
          <span className="text-brand">d&apos;emploi</span>{" "}
          comme un pro
        </h1>

        {/* H2 */}
        <p className="mt-6 text-lg sm:text-xl text-gray-500 max-w-xl leading-relaxed">
          MyRecrut centralise toutes vos candidatures, suit chaque étape et vous aide à ne jamais rater une relance.
        </p>

        {/* CTA */}
        <Link
          href="/auth/register"
          className="mt-10 inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold text-base px-8 py-4 rounded-xl shadow-lg shadow-orange-200 transition"
        >
          Commencer gratuitement
          <ArrowRight size={18} />
        </Link>

        {/* App preview placeholder */}
        <div className="mt-14 w-full max-w-4xl mx-auto bg-gray-100 rounded-2xl border border-gray-200 aspect-video flex items-center justify-center shadow-xl shadow-gray-200">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <Image src="/logo.png" alt="MyRecrut" width={40} height={40} className="opacity-40" />
            </div>
            <p className="text-gray-400 text-sm font-medium">Aperçu de l&apos;application</p>
            <p className="text-gray-300 text-xs mt-1">Capture d&apos;écran à venir</p>
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────── */}
      <section className="bg-gray-50 border-t border-gray-100 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Tout ce dont vous avez besoin
            </h2>
            <p className="mt-3 text-gray-500 text-base max-w-xl mx-auto">
              Des outils pensés pour les candidats sérieux qui veulent décrocher le bon poste.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: <LayoutDashboard size={24} className="text-brand" />,
                title: "Tableau de bord intelligent",
                desc: "Visualisez d'un coup d'œil toutes vos candidatures, leur statut et les prochaines actions à mener.",
              },
              {
                icon: <BarChart2 size={24} className="text-brand" />,
                title: "Statistiques & Analytics",
                desc: "Suivez votre taux de conversion, l'évolution de vos candidatures et identifiez les sources les plus efficaces.",
              },
              {
                icon: <Bell size={24} className="text-brand" />,
                title: "Gestion des relances",
                desc: "Ne laissez plus passer une opportunité. Planifiez vos relances et gardez le contrôle à chaque étape.",
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="bg-white rounded-2xl border border-gray-200 p-7 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-5">
                  {icon}
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ────────────────────────────────────── */}
      <section className="py-14 px-6 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-10 text-center">
          {[
            { value: "100%", label: "Gratuit pour toujours" },
            { value: "10+", label: "Champs par candidature" },
            { value: "∞", label: "Candidatures stockées" },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-4xl font-extrabold text-brand">{value}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ───────────────────────────────────────── */}
      <section className="py-20 px-6 bg-gradient-to-br from-orange-50 via-white to-orange-50 border-t border-orange-100">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
            Prêt à décrocher votre{" "}
            <span className="text-brand">prochain emploi ?</span>
          </h2>
          <p className="mt-4 text-gray-500 text-base">
            Rejoignez des candidats qui ont repris le contrôle de leur recherche d&apos;emploi.
          </p>
          <Link
            href="/auth/register"
            className="mt-8 inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold text-base px-8 py-4 rounded-xl shadow-lg shadow-orange-200 transition"
          >
            Créer mon compte gratuitement
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="MyRecrut" width={24} height={24} className="rounded-lg opacity-80" />
            <span className="text-sm font-medium text-gray-300">MyRecrut</span>
          </div>
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} MyRecrut. Tous droits réservés.
          </p>
          <div className="flex items-center gap-5 text-xs">
            <Link href="/auth/login" className="hover:text-white transition">Se connecter</Link>
            <Link href="/auth/register" className="hover:text-white transition">S&apos;inscrire</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
