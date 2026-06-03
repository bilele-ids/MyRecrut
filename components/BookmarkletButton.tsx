"use client";

import { Bookmark } from "lucide-react";

const BOOKMARKLET = `javascript:(function(){var src="";var host=location.hostname;if(host.includes("linkedin.com"))src="LinkedIn";else if(host.includes("indeed."))src="Indeed";else if(host.includes("welcometothejungle.com"))src="Welcome to the Jungle";else src="Autre";var titre="";var entreprise="";if(host.includes("linkedin.com")){titre=(document.querySelector("h1.t-24")||document.querySelector("h1")||{innerText:""}).innerText.trim();entreprise=(document.querySelector(".job-details-jobs-unified-top-card__company-name a")||{innerText:""}).innerText.trim();}else if(host.includes("indeed.")){titre=(document.querySelector("h1.jobsearch-JobInfoHeader-title")||document.querySelector("h1")||{innerText:""}).innerText.trim();}else{titre=(document.querySelector("h1")||{innerText:""}).innerText.trim();}var params=new URLSearchParams({entreprise:entreprise||"",poste:titre||"",source:src,lien:location.href,localisation:""});window.open("https://myrecrut.vercel.app/candidatures?"+params.toString(),"_blank");})();`;

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
