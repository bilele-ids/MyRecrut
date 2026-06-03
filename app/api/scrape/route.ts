import { NextRequest, NextResponse } from "next/server";

// Détecte la source depuis l'URL
function detectSource(url: string): string {
  if (url.includes("linkedin.com")) return "LinkedIn";
  if (url.includes("indeed.")) return "Indeed";
  if (url.includes("welcometothejungle.com")) return "Welcome to the Jungle";
  if (url.includes("hellowork.com")) return "Autre";
  return "Autre";
}

// Extrait le contenu d'une balise meta
function getMeta(html: string, name: string): string {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${name}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${name}["']`, "i"),
    new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["']`, "i"),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeHtml(match[1].trim());
  }
  return "";
}

// Décode les entités HTML basiques
function decodeHtml(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}

// Extrait le JSON-LD de type JobPosting
function extractJobPosting(html: string): Record<string, unknown> | null {
  const scriptRegex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = scriptRegex.exec(html)) !== null) {
    try {
      const json = JSON.parse(match[1]);
      const items = Array.isArray(json) ? json : [json];
      for (const item of items) {
        if (item["@type"] === "JobPosting") return item;
        // Parfois imbriqué dans @graph
        if (item["@graph"]) {
          const found = item["@graph"].find((g: Record<string, unknown>) => g["@type"] === "JobPosting");
          if (found) return found;
        }
      }
    } catch {
      // JSON invalide, on continue
    }
  }
  return null;
}

// Parse le salaire depuis JSON-LD
function parseSalary(job: Record<string, unknown>): string {
  const salary = job.baseSalary as Record<string, unknown> | undefined;
  if (!salary) return "";
  const value = salary.value as Record<string, unknown> | undefined;
  if (!value) return "";
  const min = value.minValue;
  const max = value.maxValue;
  const unit = (salary.currency as string) || "€";
  if (min && max) return `${min} - ${max} ${unit}`;
  if (min) return `${min} ${unit}`;
  return "";
}

// Parse la localisation depuis JSON-LD
function parseLocation(job: Record<string, unknown>): string {
  const loc = job.jobLocation as Record<string, unknown> | undefined;
  if (!loc) return "";
  const addr = loc.address as Record<string, unknown> | undefined;
  if (!addr) return (loc.name as string) || "";
  const city = (addr.addressLocality as string) || "";
  const country = (addr.addressCountry as string) || "";
  return [city, country].filter(Boolean).join(", ");
}

// Mappe le type de contrat
function parseEmploymentType(type: string): string {
  if (!type) return "";
  const t = type.toUpperCase();
  if (t.includes("FULL_TIME") || t.includes("CDI")) return "CDI";
  if (t.includes("PART_TIME") || t.includes("CDD")) return "CDD";
  if (t.includes("CONTRACTOR") || t.includes("FREELANCE")) return "Freelance";
  if (t.includes("INTERN") || t.includes("STAGE")) return "Stage";
  if (t.includes("ALTERN")) return "Alternance";
  return "";
}

export async function POST(req: NextRequest) {
  const { url } = await req.json();

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "URL manquante" }, { status: 400 });
  }

  const source = detectSource(url);

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
        "Cache-Control": "no-cache",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return NextResponse.json({ source, error: "Page inaccessible" }, { status: 200 });
    }

    const html = await response.text();

    // 1. Essayer JSON-LD (le plus fiable)
    const jobPosting = extractJobPosting(html);

    if (jobPosting) {
      const titre = (jobPosting.title as string) || getMeta(html, "og:title") || "";
      const entreprise = (jobPosting.hiringOrganization as Record<string, unknown>)?.name as string || "";
      const localisation = parseLocation(jobPosting);
      const remuneration = parseSalary(jobPosting);
      const type_contrat = parseEmploymentType((jobPosting.employmentType as string) || "");
      const description = (jobPosting.description as string) || "";
      const commentaires = description ? description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 300) : "";

      return NextResponse.json({
        source,
        intitule_poste: decodeHtml(titre),
        entreprise: decodeHtml(entreprise),
        localisation,
        remuneration,
        type_contrat,
        lien_offre: url,
        commentaires,
      });
    }

    // 2. Fallback : Open Graph + balises meta
    const ogTitle = getMeta(html, "og:title");
    const ogDescription = getMeta(html, "og:description");

    // Titre de page comme dernier recours
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const pageTitle = titleMatch ? decodeHtml(titleMatch[1]) : "";

    const titre = ogTitle || pageTitle;

    return NextResponse.json({
      source,
      intitule_poste: titre,
      entreprise: "",
      localisation: "",
      remuneration: "",
      type_contrat: "",
      lien_offre: url,
      commentaires: ogDescription || "",
    });

  } catch {
    // Site bloqué ou timeout — on retourne au moins la source
    return NextResponse.json({
      source,
      intitule_poste: "",
      entreprise: "",
      localisation: "",
      remuneration: "",
      type_contrat: "",
      lien_offre: url,
      commentaires: "",
    });
  }
}
