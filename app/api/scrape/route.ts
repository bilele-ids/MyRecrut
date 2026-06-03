import { NextRequest, NextResponse } from "next/server";

function detectSource(url: string): string {
  if (url.includes("linkedin.com")) return "LinkedIn";
  if (url.includes("indeed.")) return "Indeed";
  if (url.includes("welcometothejungle.com")) return "Welcome to the Jungle";
  if (url.includes("hellowork.com")) return "Autre";
  return "Autre";
}

function decodeHtml(str: string): string {
  return str
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ").trim();
}

function getMeta(html: string, name: string): string {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${name}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${name}["']`, "i"),
    new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["']`, "i"),
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m?.[1]) return decodeHtml(m[1].trim());
  }
  return "";
}

function extractJsonLd(html: string): Record<string, unknown> | null {
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    try {
      const json = JSON.parse(m[1]);
      const items = Array.isArray(json) ? json : [json];
      for (const item of items) {
        if (item["@type"] === "JobPosting") return item;
        if (item["@graph"]) {
          const found = (item["@graph"] as Record<string, unknown>[]).find(g => g["@type"] === "JobPosting");
          if (found) return found;
        }
      }
    } catch { /* continue */ }
  }
  return null;
}

function parseLocation(job: Record<string, unknown>): string {
  const loc = job.jobLocation as Record<string, unknown> | undefined;
  if (!loc) return "";
  const addr = loc.address as Record<string, unknown> | undefined;
  if (addr) return [addr.addressLocality, addr.addressCountry].filter(Boolean).join(", ");
  return (loc.name as string) || "";
}

function parseSalary(job: Record<string, unknown>): string {
  const s = job.baseSalary as Record<string, unknown> | undefined;
  if (!s) return "";
  const v = s.value as Record<string, unknown> | undefined;
  if (!v) return "";
  const currency = (s.currency as string) || "€";
  if (v.minValue && v.maxValue) return `${v.minValue} - ${v.maxValue} ${currency}`;
  if (v.minValue) return `${v.minValue} ${currency}`;
  return "";
}

function parseContrat(type: string): string {
  if (!type) return "";
  const t = type.toUpperCase();
  if (t.includes("FULL_TIME") || t.includes("CDI")) return "CDI";
  if (t.includes("PART_TIME") || t.includes("CDD")) return "CDD";
  if (t.includes("CONTRACTOR") || t.includes("FREELANCE")) return "Freelance";
  if (t.includes("INTERN") || t.includes("STAGE")) return "Stage";
  if (t.includes("ALTERN")) return "Alternance";
  return "";
}

// ── Welcome to the Jungle : API publique ──────────────────────────────────
async function scrapeWTTJ(url: string) {
  // URL format: /fr/companies/{org-slug}/jobs/{job-slug}_{location}_{ref}
  const match = url.match(/\/companies\/([^/]+)\/jobs\/([^?#]+)/);
  if (!match) return null;

  const orgSlug = match[1];
  const jobPart = match[2].split("_")[0]; // retirer suffixes

  // Essai API WTTJ
  const apiUrl = `https://api.welcometothejungle.com/api/v1/organizations/${orgSlug}/jobs/${match[2]}`;
  try {
    const res = await fetch(apiUrl, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0",
      },
      signal: AbortSignal.timeout(6000),
    });
    if (res.ok) {
      const data = await res.json();
      const job = data.job || data;
      return {
        intitule_poste: job.name || job.title || "",
        entreprise: job.organization?.name || orgSlug.replace(/-/g, " "),
        localisation: job.office?.city || job.contract_type?.includes("remote") ? "Remote" : "",
        remuneration: job.salary_min && job.salary_max ? `${job.salary_min} - ${job.salary_max} €` : "",
        type_contrat: parseContrat(job.contract_type || ""),
        commentaires: "",
      };
    }
  } catch { /* fallback */ }

  // Fallback : extraire du slug URL
  const titre = jobPart.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  const entreprise = orgSlug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  return { intitule_poste: titre, entreprise, localisation: "", remuneration: "", type_contrat: "", commentaires: "" };
}

// ── Indeed : extraire depuis les meta tags ────────────────────────────────
async function scrapeIndeed(url: string) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      "Accept": "text/html",
      "Accept-Language": "fr-FR,fr;q=0.9",
    },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return null;
  const html = await res.text();

  const jobLd = extractJsonLd(html);
  if (jobLd) {
    return {
      intitule_poste: decodeHtml((jobLd.title as string) || ""),
      entreprise: decodeHtml((jobLd.hiringOrganization as Record<string, unknown>)?.name as string || ""),
      localisation: parseLocation(jobLd),
      remuneration: parseSalary(jobLd),
      type_contrat: parseContrat((jobLd.employmentType as string) || ""),
      commentaires: "",
    };
  }

  return {
    intitule_poste: getMeta(html, "og:title") || "",
    entreprise: "",
    localisation: "",
    remuneration: "",
    type_contrat: "",
    commentaires: getMeta(html, "og:description") || "",
  };
}

// ── Generic : JSON-LD + Open Graph ───────────────────────────────────────
async function scrapeGeneric(url: string) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml",
      "Accept-Language": "fr-FR,fr;q=0.9",
    },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return null;
  const html = await res.text();

  const jobLd = extractJsonLd(html);
  if (jobLd) {
    return {
      intitule_poste: decodeHtml((jobLd.title as string) || ""),
      entreprise: decodeHtml((jobLd.hiringOrganization as Record<string, unknown>)?.name as string || ""),
      localisation: parseLocation(jobLd),
      remuneration: parseSalary(jobLd),
      type_contrat: parseContrat((jobLd.employmentType as string) || ""),
      commentaires: ((jobLd.description as string) || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 300),
    };
  }

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return {
    intitule_poste: getMeta(html, "og:title") || decodeHtml(titleMatch?.[1] || ""),
    entreprise: "",
    localisation: "",
    remuneration: "",
    type_contrat: "",
    commentaires: getMeta(html, "og:description") || "",
  };
}

export async function POST(req: NextRequest) {
  const { url } = await req.json();
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "URL manquante" }, { status: 400 });
  }

  const source = detectSource(url);

  try {
    let data = null;

    if (url.includes("welcometothejungle.com")) {
      data = await scrapeWTTJ(url);
    } else if (url.includes("indeed.")) {
      data = await scrapeIndeed(url);
    } else {
      data = await scrapeGeneric(url);
    }

    return NextResponse.json({
      source,
      lien_offre: url,
      intitule_poste: data?.intitule_poste || "",
      entreprise: data?.entreprise || "",
      localisation: data?.localisation || "",
      remuneration: data?.remuneration || "",
      type_contrat: data?.type_contrat || "",
      commentaires: data?.commentaires || "",
    });

  } catch {
    return NextResponse.json({
      source,
      lien_offre: url,
      intitule_poste: "",
      entreprise: "",
      localisation: "",
      remuneration: "",
      type_contrat: "",
      commentaires: "",
    });
  }
}
