import type { RawGadget } from "../types.ts";
import { categorize } from "../categorizer.ts";

export async function scrapeUncrate(): Promise<RawGadget[]> {
  const gadgets: RawGadget[] = [];

  try {
    const res = await fetch("https://uncrate.com/gear/", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (!res.ok) {
      console.error(`Uncrate returned ${res.status}`);
      return [];
    }

    const html = await res.text();

    // Uncrate uses article elements for gear items
    const articlePattern =
      /<article[^>]*>[\s\S]*?<\/article>/gi;
    const articles = html.match(articlePattern) ?? [];

    for (const article of articles.slice(0, 30)) {
      const title = extractText(article, "h2") || extractText(article, "h3");
      const imageUrl = extractImgSrc(article);
      const link = extractHref(article);
      const priceText = extractByClass(article, "price");

      if (!title || !imageUrl || !link) continue;

      const priceCents = parsePriceToCents(priceText);
      const categorySlug = categorize(title);

      gadgets.push({
        title: title.trim(),
        image_url: imageUrl,
        price_cents: priceCents,
        source_url: link.startsWith("http")
          ? link
          : `https://uncrate.com${link}`,
        source_site: "uncrate",
        category_slug: categorySlug,
      });
    }
  } catch (error) {
    console.error("Uncrate scrape error:", error);
  }

  return gadgets;
}

function extractText(html: string, tag: string): string | null {
  const pattern = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, "i");
  const match = html.match(pattern);
  return match?.[1]?.trim() ?? null;
}

function extractImgSrc(html: string): string | null {
  // Try data-src first (lazy loaded), then src
  const dataSrcMatch = html.match(/data-src="(https?:\/\/[^"]+\.(jpg|jpeg|png|webp)[^"]*)"/i);
  if (dataSrcMatch) return dataSrcMatch[1];

  const srcMatch = html.match(/src="(https?:\/\/[^"]+\.(jpg|jpeg|png|webp)[^"]*)"/i);
  return srcMatch?.[1] ?? null;
}

function extractHref(html: string): string | null {
  const match = html.match(/<a[^>]*href="([^"]+)"/i);
  return match?.[1] ?? null;
}

function extractByClass(html: string, className: string): string | null {
  const pattern = new RegExp(
    `class="[^"]*${className}[^"]*"[^>]*>([^<]*)`,
    "i"
  );
  const match = html.match(pattern);
  return match?.[1]?.trim() ?? null;
}

function parsePriceToCents(text: string | null): number | undefined {
  if (!text) return undefined;
  const match = text.match(/[\d,.]+/);
  if (!match) return undefined;
  const amount = parseFloat(match[0].replace(",", ""));
  return isNaN(amount) ? undefined : Math.round(amount * 100);
}
