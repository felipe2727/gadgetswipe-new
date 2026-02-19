import type { RawGadget } from "../types.ts";
import { categorize } from "../categorizer.ts";

const SEARCH_QUERIES = [
  "cool+gadgets+for+men",
  "tech+gadgets+2024",
  "unique+gadgets",
];

const USER_AGENTS = [
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
];

export async function scrapeAmazon(): Promise<RawGadget[]> {
  const gadgets: RawGadget[] = [];

  // Only scrape one query to avoid rate limiting
  const query = SEARCH_QUERIES[Math.floor(Math.random() * SEARCH_QUERIES.length)];
  const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

  try {
    const url = `https://www.amazon.com/s?k=${query}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": userAgent,
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!res.ok) {
      console.error(`Amazon returned ${res.status}`);
      return [];
    }

    const html = await res.text();

    // Parse product results using regex patterns
    // Amazon product cards typically have data-asin attributes
    const asinPattern = /data-asin="([A-Z0-9]{10})"/g;
    const asins = new Set<string>();
    let match;

    while ((match = asinPattern.exec(html)) !== null) {
      if (match[1]) asins.add(match[1]);
    }

    // Extract product info for each ASIN found
    for (const asin of Array.from(asins).slice(0, 20)) {
      const productSection = extractProductSection(html, asin);
      if (!productSection) continue;

      const title = extractTitle(productSection);
      const imageUrl = extractImage(productSection);
      const price = extractPrice(productSection);

      if (!title || !imageUrl) continue;

      const categorySlug = categorize(title);

      gadgets.push({
        title: title.substring(0, 150),
        image_url: imageUrl,
        price_cents: price,
        source_url: `https://www.amazon.com/dp/${asin}`,
        source_site: "amazon",
        category_slug: categorySlug,
      });
    }
  } catch (error) {
    console.error("Amazon scrape error:", error);
  }

  return gadgets;
}

function extractProductSection(html: string, asin: string): string | null {
  const marker = `data-asin="${asin}"`;
  const idx = html.indexOf(marker);
  if (idx === -1) return null;
  // Grab surrounding ~3000 chars as a rough product card boundary
  return html.substring(Math.max(0, idx - 500), idx + 2500);
}

function extractTitle(section: string): string | null {
  // Look for span with class containing "a-text-normal" or "a-size-medium"
  const titleMatch = section.match(
    /class="[^"]*a-(?:size-medium|text-normal)[^"]*"[^>]*>([^<]+)/
  );
  return titleMatch?.[1]?.trim() ?? null;
}

function extractImage(section: string): string | null {
  const imgMatch = section.match(/src="(https:\/\/m\.media-amazon\.com\/images\/[^"]+)"/);
  return imgMatch?.[1] ?? null;
}

function extractPrice(section: string): number | undefined {
  const priceMatch = section.match(
    /class="[^"]*a-price[^"]*"[^>]*>\s*<span[^>]*>\s*<span[^>]*>\$<\/span>\s*<span[^>]*>(\d+)<\/span>\s*<span[^>]*>\.(\d+)<\/span>/
  );
  if (priceMatch) {
    return parseInt(priceMatch[1]) * 100 + parseInt(priceMatch[2]);
  }

  // Simpler price pattern
  const simplePriceMatch = section.match(/\$(\d+)\.(\d{2})/);
  if (simplePriceMatch) {
    return parseInt(simplePriceMatch[1]) * 100 + parseInt(simplePriceMatch[2]);
  }

  return undefined;
}
