import type { RawGadget } from "../types.ts";
import { categorize } from "../categorizer.ts";

export async function scrapeGadgetFlow(): Promise<RawGadget[]> {
  const gadgets: RawGadget[] = [];

  try {
    const res = await fetch("https://thegadgetflow.com/cool-tech-gadgets/", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (!res.ok) {
      console.error(`GadgetFlow returned ${res.status}`);
      return [];
    }

    const html = await res.text();

    // Parse product cards using regex (Cheerio not available in Deno)
    // Look for product card patterns in the HTML
    const productPattern =
      /<article[^>]*class="[^"]*product-card[^"]*"[^>]*>[\s\S]*?<\/article>/gi;
    const matches = html.match(productPattern) ?? [];

    for (const match of matches.slice(0, 30)) {
      const title = extractBetween(match, "<h3", "</h3>");
      const imageUrl = extractAttribute(match, "img", "src");
      const link = extractAttribute(match, "a", "href");
      const priceText = extractBetween(match, "price", "<");

      if (!title || !imageUrl || !link) continue;

      const priceCents = parsePrice(priceText);
      const categorySlug = categorize(title);

      gadgets.push({
        title: title.trim(),
        description: undefined,
        image_url: imageUrl,
        price_cents: priceCents,
        source_url: link.startsWith("http")
          ? link
          : `https://thegadgetflow.com${link}`,
        source_site: "gadgetflow",
        category_slug: categorySlug,
      });
    }
  } catch (error) {
    console.error("GadgetFlow scrape error:", error);
  }

  return gadgets;
}

function extractBetween(
  html: string,
  startTag: string,
  endTag: string
): string | null {
  const startIdx = html.indexOf(startTag);
  if (startIdx === -1) return null;
  const contentStart = html.indexOf(">", startIdx) + 1;
  const endIdx = html.indexOf(endTag, contentStart);
  if (endIdx === -1) return null;
  return html.substring(contentStart, endIdx).replace(/<[^>]*>/g, "").trim();
}

function extractAttribute(
  html: string,
  tag: string,
  attr: string
): string | null {
  const tagPattern = new RegExp(`<${tag}[^>]*${attr}="([^"]*)"`, "i");
  const match = html.match(tagPattern);
  return match?.[1] ?? null;
}

function parsePrice(text: string | null): number | undefined {
  if (!text) return undefined;
  const match = text.match(/[\d,.]+/);
  if (!match) return undefined;
  const amount = parseFloat(match[0].replace(",", ""));
  return isNaN(amount) ? undefined : Math.round(amount * 100);
}
