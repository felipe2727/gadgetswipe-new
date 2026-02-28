/**
 * Seed script: scrapes electronics-focused sources using Firecrawl (markdown mode)
 * and inserts curated gadgets into the database as "pending" for admin review.
 *
 * Usage:
 *   npx tsx scripts/seed-firecrawl.ts
 *
 * Required env vars (from .env.local):
 *   FIRECRAWL_API_KEY
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import FirecrawlApp from "@mendable/firecrawl-js";
import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!FIRECRAWL_API_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "Missing env vars. Ensure FIRECRAWL_API_KEY, NEXT_PUBLIC_SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY are set."
  );
  process.exit(1);
}

const firecrawl = new FirecrawlApp({ apiKey: FIRECRAWL_API_KEY });
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ---------------------------------------------------------------------------
// Source definitions — electronics-specific category pages
// ---------------------------------------------------------------------------

interface SourceConfig {
  url: string;
  source_site: string;
  category_slug: string;
  label: string;
}

const SOURCES: SourceConfig[] = [
  // Amazon Best Sellers — each page is a specific electronics category
  {
    url: "https://www.amazon.com/Best-Sellers-Electronics-Headphones/zgbs/electronics/172541",
    source_site: "amazon",
    category_slug: "audio",
    label: "Amazon Best Sellers: Headphones",
  },
  {
    url: "https://www.amazon.com/Best-Sellers-Electronics-Smartwatches/zgbs/electronics/7939901011",
    source_site: "amazon",
    category_slug: "wearable",
    label: "Amazon Best Sellers: Smartwatches",
  },
  {
    url: "https://www.amazon.com/Best-Sellers-Smart-Home/zgbs/smart-home/",
    source_site: "amazon",
    category_slug: "smart_home",
    label: "Amazon Best Sellers: Smart Home",
  },
  {
    url: "https://www.amazon.com/Best-Sellers-Electronics-Portable-Bluetooth-Speakers/zgbs/electronics/7073956011",
    source_site: "amazon",
    category_slug: "audio",
    label: "Amazon Best Sellers: Bluetooth Speakers",
  },
  {
    url: "https://www.amazon.com/Best-Sellers-Electronics-Drones/zgbs/electronics/14329736011",
    source_site: "amazon",
    category_slug: "photography",
    label: "Amazon Best Sellers: Drones",
  },
  {
    url: "https://www.amazon.com/Best-Sellers-Electronics-Computer-Keyboards/zgbs/electronics/12879431",
    source_site: "amazon",
    category_slug: "productivity",
    label: "Amazon Best Sellers: Keyboards",
  },
  {
    url: "https://www.amazon.com/Best-Sellers-Electronics-Gaming-Headsets/zgbs/electronics/402053011",
    source_site: "amazon",
    category_slug: "gaming",
    label: "Amazon Best Sellers: Gaming Headsets",
  },
  {
    url: "https://www.amazon.com/Best-Sellers-Electronics-Action-Cameras/zgbs/electronics/7161092011",
    source_site: "amazon",
    category_slug: "photography",
    label: "Amazon Best Sellers: Action Cameras",
  },
  // Editorial / curated tech sites
  {
    url: "https://www.wired.com/gallery/best-gadgets/",
    source_site: "wired",
    category_slug: "other",
    label: "Wired: Best Gadgets",
  },
  {
    url: "https://thegadgetflow.com/cool-tech-gadgets/",
    source_site: "gadgetflow",
    category_slug: "other",
    label: "GadgetFlow: Cool Tech",
  },
  {
    url: "https://www.producthunt.com/topics/hardware",
    source_site: "producthunt",
    category_slug: "productivity",
    label: "Product Hunt: Hardware",
  },
];

// ---------------------------------------------------------------------------
// Non-electronics blocklist — reject items matching these terms
// ---------------------------------------------------------------------------

const NON_ELECTRONICS_BLOCKLIST = [
  // Outdoor / camping
  "tent", "sleeping bag", "backpack", "hiking boot", "camp stove", "cooler",
  "hammock", "canteen", "trekking pole", "camp chair", "camping",
  // Kitchen / cooking (non-electronic)
  "knife set", "cutting board", "pan", "skillet", "spatula", "apron",
  "cookbook", "spice rack", "mug", "tumbler", "bottle opener", "wine",
  "cocktail", "grilling", "cast iron",
  // Fashion / clothing
  "shirt", "jacket", "hoodie", "sneaker", "boot", "hat", "cap",
  "belt", "sock", "sunglasses", "cologne", "perfume", "watch band",
  "leather strap", "clothing", "apparel", "jeans", "shorts",
  // Furniture / decor
  "desk mat", "poster", "candle", "planter", "shelf", "bookend",
  "rug", "blanket", "pillow", "couch", "sofa", "chair", "table",
  // Hand tools (non-electronic)
  "wrench", "screwdriver set", "pliers", "hammer", "saw", "axe",
  "shovel", "rake",
  // Other non-electronics
  "wallet", "keychain", "pen", "notebook", "sticker", "card game",
  "board game", "puzzle", "toy", "figurine", "art print",
];

function isElectronicGadget(title: string, description?: string | null): boolean {
  const text = `${title} ${description ?? ""}`.toLowerCase();
  for (const blocked of NON_ELECTRONICS_BLOCKLIST) {
    if (text.includes(blocked)) return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Product interface
// ---------------------------------------------------------------------------

interface ParsedProduct {
  title: string;
  description: string | null;
  image_url: string | null;
  product_url: string | null;
  price: string | null;
}

// ---------------------------------------------------------------------------
// Markdown parser — extracts products from Firecrawl markdown output
// ---------------------------------------------------------------------------

function parseProductsFromMarkdown(
  markdown: string,
  sourceUrl: string
): ParsedProduct[] {
  const products: ParsedProduct[] = [];
  const lines = markdown.split("\n");

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();

    // Look for image+link patterns: [![title](image)](product_url)
    const linkedImageMatch = line.match(
      /\[!\[([^\]]*)\]\(([^)]+)\)\]\(([^)]+)\)/
    );
    if (linkedImageMatch) {
      const title = linkedImageMatch[1].trim();
      const imageUrl = linkedImageMatch[2];
      const productUrl = linkedImageMatch[3];

      // Collect description from following lines
      let description = "";
      let j = i + 1;
      while (
        j < lines.length &&
        lines[j].trim() &&
        !lines[j].trim().startsWith("[![") &&
        !lines[j].trim().startsWith("## ") &&
        !lines[j].trim().startsWith("# ")
      ) {
        const descLine = lines[j].trim();
        if (descLine && !descLine.startsWith("[") && descLine.length > 10) {
          description = descLine;
          break;
        }
        j++;
      }

      if (title && title.length >= 3) {
        products.push({
          title,
          description: description || null,
          image_url: imageUrl,
          product_url: productUrl,
          price: null,
        });
      }
      i = j > i + 1 ? j + 1 : i + 1;
      continue;
    }

    // Look for heading + image pattern:
    // ## [Title](url)   or   ## Title
    // ![](image)
    const headingLinkMatch = line.match(/^#{1,3}\s+\[([^\]]+)\]\(([^)]+)\)/);
    const headingMatch = !headingLinkMatch
      ? line.match(/^#{1,3}\s+(.+)/)
      : null;

    if (headingLinkMatch || headingMatch) {
      const title = headingLinkMatch
        ? headingLinkMatch[1].trim()
        : headingMatch![1].trim();
      const productUrl = headingLinkMatch ? headingLinkMatch[2] : null;

      // Look ahead for image and description
      let imageUrl: string | null = null;
      let description = "";
      let price: string | null = null;

      for (let j = i + 1; j < Math.min(i + 8, lines.length); j++) {
        const nextLine = lines[j].trim();
        if (!nextLine) continue;

        // Image
        if (!imageUrl) {
          const imgMatch = nextLine.match(/!\[.*?\]\(([^)]+)\)/);
          if (imgMatch) {
            imageUrl = imgMatch[1];
            continue;
          }
        }

        // Price
        if (!price) {
          const priceMatch = nextLine.match(/\$[\d,]+(?:\.\d{2})?/);
          if (priceMatch) {
            price = priceMatch[0];
          }
        }

        // Description
        if (
          !description &&
          nextLine.length > 20 &&
          !nextLine.startsWith("#") &&
          !nextLine.startsWith("[![") &&
          !nextLine.startsWith("![")
        ) {
          description = nextLine.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
        }
      }

      if (
        title.length >= 3 &&
        !title.toLowerCase().includes("menu") &&
        !title.toLowerCase().includes("navigation") &&
        !title.toLowerCase().includes("search")
      ) {
        products.push({
          title,
          description: description || null,
          image_url: imageUrl,
          product_url: productUrl,
          price,
        });
      }
    }

    // Standalone image with link: ![title](image) followed by text
    if (!linkedImageMatch && !headingLinkMatch && !headingMatch) {
      const standaloneImg = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);
      if (standaloneImg && standaloneImg[1].length >= 5) {
        const title = standaloneImg[1];
        const imageUrl = standaloneImg[2];

        // Look for a product link nearby
        let productUrl: string | null = null;
        for (let j = i - 2; j <= i + 3 && j < lines.length; j++) {
          if (j < 0 || j === i) continue;
          const linkMatch = lines[j]
            .trim()
            .match(/\[([^\]]*)\]\(([^)]+)\)/);
          if (
            linkMatch &&
            !linkMatch[2].match(/\.(jpg|png|gif|webp|svg)/i)
          ) {
            productUrl = linkMatch[2];
            break;
          }
        }

        products.push({
          title,
          description: null,
          image_url: imageUrl,
          product_url: productUrl,
          price: null,
        });
      }
    }

    i++;
  }

  return products;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parsePriceCents(priceStr: string | null): number | null {
  if (!priceStr) return null;
  const match = priceStr.replace(/,/g, "").match(/(\d+(?:\.\d{1,2})?)/);
  if (!match) return null;
  return Math.round(parseFloat(match[1]) * 100);
}

function isValidHttpUrl(str: string | null | undefined): boolean {
  if (!str) return false;
  try {
    const url = new URL(str);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function isImageFileUrl(url: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp|svg|avif|ico)(\?|$)/i.test(url);
}

function resolveUrl(href: string, base: string): string {
  try {
    return new URL(href, base).toString();
  } catch {
    return href;
  }
}

/** Upgrade Amazon thumbnail URLs to higher resolution */
function upgradeAmazonImageUrl(url: string): string {
  // Replace small dimension markers like ._AC_UL100_ with ._AC_UL600_
  return url.replace(/\._AC_[A-Z]{2}\d+_\./g, "._AC_UL600_.");
}

async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      headers: { "User-Agent": "GadgetSwipe/1.0" },
    });
    clearTimeout(timeout);
    if (!res.ok) return false;
    const contentType = res.headers.get("content-type") ?? "";
    return contentType.startsWith("image/");
  } catch {
    return false;
  }
}

/** Delay helper for rate limiting */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("Starting Firecrawl seed script (electronics-focused)...\n");

  // Fetch category map
  const { data: categories } = await supabase
    .from("categories")
    .select("id, slug");
  const categoryMap = new Map(
    (categories ?? []).map((c: { id: string; slug: string }) => [c.slug, c.id])
  );

  // Fetch existing source_urls for deduplication
  const { data: existingGadgets } = await supabase
    .from("gadgets")
    .select("source_url");
  const existingUrls = new Set(
    (existingGadgets ?? []).map((g: { source_url: string }) => g.source_url)
  );

  let totalScraped = 0;
  let totalInserted = 0;
  let totalSkipped = 0;
  let totalFiltered = 0;

  for (let sourceIndex = 0; sourceIndex < SOURCES.length; sourceIndex++) {
    const source = SOURCES[sourceIndex];

    // Rate limit: wait 2s between Firecrawl calls
    if (sourceIndex > 0) {
      await delay(2000);
    }

    console.log(`\n--- Scraping: ${source.label} (${source.url}) ---`);

    try {
      const result = await firecrawl.scrape(source.url, {
        formats: ["markdown"],
      });

      const markdown = result.markdown;
      if (!markdown || markdown.length < 100) {
        console.log(`  No useful content from ${source.label}`);
        continue;
      }

      console.log(`  Got ${markdown.length} chars of markdown`);

      const products = parseProductsFromMarkdown(markdown, source.url);
      console.log(`  Parsed ${products.length} products`);
      totalScraped += products.length;

      const rows: Array<Record<string, unknown>> = [];

      for (const product of products) {
        // Skip if no title or too short
        if (!product.title || product.title.trim().length < 3) {
          totalSkipped++;
          continue;
        }

        // Electronics blocklist filter
        if (!isElectronicGadget(product.title, product.description)) {
          console.log(`  Filtered non-electronic: "${product.title}"`);
          totalFiltered++;
          continue;
        }

        // Resolve and validate product URL
        const rawUrl = product.product_url ?? source.url;
        const productUrl = resolveUrl(rawUrl, source.url);
        if (!isValidHttpUrl(productUrl) || isImageFileUrl(productUrl)) {
          totalSkipped++;
          continue;
        }

        // Deduplicate
        if (existingUrls.has(productUrl)) {
          totalSkipped++;
          continue;
        }

        // Resolve and validate image
        let imageUrl = product.image_url
          ? resolveUrl(product.image_url, source.url)
          : null;
        if (!imageUrl || !isValidHttpUrl(imageUrl)) {
          totalSkipped++;
          continue;
        }

        // Reject known low-res URL patterns
        if (/thumbnail|icon|favicon|sprite/i.test(imageUrl)) {
          totalSkipped++;
          continue;
        }

        // Upgrade Amazon image resolution
        if (imageUrl.includes("amazon") || imageUrl.includes("media-amazon")) {
          imageUrl = upgradeAmazonImageUrl(imageUrl);
        }

        const imageValid = await validateImageUrl(imageUrl);
        if (!imageValid) {
          console.log(`  Skipping "${product.title}" — broken image`);
          totalSkipped++;
          continue;
        }

        existingUrls.add(productUrl);

        rows.push({
          title: product.title.trim().substring(0, 200),
          description: product.description?.trim().substring(0, 500) ?? null,
          image_url: imageUrl,
          price_cents: parsePriceCents(product.price),
          source_url: productUrl,
          source_site: source.source_site,
          category_id:
            categoryMap.get(source.category_slug) ??
            categoryMap.get("other") ??
            null,
          tags: [],
          is_active: true,
          content_status: "pending",
        });
      }

      console.log(`  ${rows.length} valid products after filtering`);

      // Insert in batches of 50
      for (let i = 0; i < rows.length; i += 50) {
        const batch = rows.slice(i, i + 50);
        const { error } = await supabase.from("gadgets").insert(batch);
        if (error) {
          console.error(`  Insert error:`, error.message);
        } else {
          totalInserted += batch.length;
          console.log(`  Inserted ${batch.length} gadgets (pending review)`);
        }
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`  Error scraping ${source.label}: ${msg}`);
      console.log(`  Skipping source and continuing...`);
    }
  }

  console.log("\n========================================");
  console.log(`Seed complete!`);
  console.log(`  Total scraped:            ${totalScraped}`);
  console.log(`  Non-electronics filtered: ${totalFiltered}`);
  console.log(`  Total inserted (pending): ${totalInserted}`);
  console.log(`  Total skipped:            ${totalSkipped}`);
  console.log("========================================");
  console.log("Items are in PENDING status. Use the admin panel to approve them.\n");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
