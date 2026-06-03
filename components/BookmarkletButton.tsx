"use client";

import { Bookmark } from "lucide-react";

// Version simple et fiable : title + URL, détection source automatique
const RAW = `(function(){
var h=location.hostname;
var src=h.includes("linkedin")?"LinkedIn":h.includes("indeed")?"Indeed":h.includes("welcometothejungle")?"Welcome to the Jungle":"Autre";
var titre=document.title.split("|")[0].split("-")[0].split("•")[0].trim();
var url="https://myrecrut.vercel.app/candidatures?poste="+encodeURIComponent(titre)+"&source="+encodeURIComponent(src)+"&lien="+encodeURIComponent(location.href);
window.open(url,"_blank");
})();`;

const BOOKMARKLET = "javascript:" + RAW.replace(/\n/g, "");

export function BookmarkletButton() {
  return (
    <a
      href={BOOKMARKLET}
      onClick={(e) => e.preventDefault()}
      draggable
      className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-orange-200 cursor-grab active:cursor-grabbing select-none text-sm"
    >
      <Bookmark size={16} />
      ＋ Ajouter à MyRecrut
    </a>
  );
}
