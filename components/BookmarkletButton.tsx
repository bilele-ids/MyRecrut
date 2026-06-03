"use client";

import { Bookmark } from "lucide-react";

// Bookmarklet robuste avec sélecteurs LinkedIn mis à jour
const RAW = `(function(){
  var host = location.hostname;
  var src = "Autre";
  if(host.includes("linkedin.com")) src = "LinkedIn";
  else if(host.includes("indeed.")) src = "Indeed";
  else if(host.includes("welcometothejungle.com")) src = "Welcome to the Jungle";
  else if(host.includes("hellowork.com")) src = "Autre";

  function txt(el){ return el ? el.innerText.trim().split("\n")[0].trim() : ""; }

  var titre = "";
  var entreprise = "";
  var localisation = "";

  // Titre du poste - sélecteurs multiples
  var tSelectors = [
    "h1.t-24.t-bold",
    "h1.job-title",
    ".job-details-jobs-unified-top-card__job-title h1",
    ".jobs-unified-top-card__job-title h1",
    "h1"
  ];
  for(var i=0; i<tSelectors.length; i++){
    var el = document.querySelector(tSelectors[i]);
    if(el && el.innerText.trim()){ titre = txt(el); break; }
  }

  // Entreprise - sélecteurs multiples
  var eSelectors = [
    ".job-details-jobs-unified-top-card__company-name a",
    ".jobs-unified-top-card__company-name a",
    ".job-details-jobs-unified-top-card__company-name",
    "[data-tracking-control-name='public_jobs_topcard-org-name']",
    ".topcard__org-name-link",
    ".company-name"
  ];
  for(var j=0; j<eSelectors.length; j++){
    var el2 = document.querySelector(eSelectors[j]);
    if(el2 && el2.innerText.trim()){ entreprise = txt(el2); break; }
  }

  // Localisation
  var lSelectors = [
    ".job-details-jobs-unified-top-card__bullet",
    ".jobs-unified-top-card__bullet",
    ".topcard__flavor--bullet"
  ];
  for(var k=0; k<lSelectors.length; k++){
    var el3 = document.querySelector(lSelectors[k]);
    if(el3 && el3.innerText.trim()){ localisation = txt(el3); break; }
  }

  // Indeed
  if(host.includes("indeed.")){
    titre = txt(document.querySelector("h1[class*='jobsearch']") || document.querySelector("h1"));
    entreprise = txt(document.querySelector("[data-company-name='true']") || document.querySelector("[class*='companyName']"));
    localisation = txt(document.querySelector("[data-testid='job-location']"));
  }

  // WTTJ
  if(host.includes("welcometothejungle")){
    titre = txt(document.querySelector("h1"));
    entreprise = txt(document.querySelector("[data-testid='company-title']") || document.querySelector("h2"));
  }

  var base = "https://myrecrut.vercel.app/candidatures";
  var params = "?entreprise=" + encodeURIComponent(entreprise) +
               "&poste=" + encodeURIComponent(titre) +
               "&source=" + encodeURIComponent(src) +
               "&lien=" + encodeURIComponent(location.href) +
               "&localisation=" + encodeURIComponent(localisation);

  var win = window.open(base + params, "_blank");
  if(!win || win.closed){ location.href = base + params; }
})();`;

// Minifier pour le href
const BOOKMARKLET = "javascript:" + RAW.replace(/\n\s*/g, " ").replace(/\s{2,}/g, " ").trim();

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
