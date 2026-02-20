/**
 * Seed script: scrapes gadget sources using Firecrawl (markdown mode)
 * and parses product listings from the rendered page content.
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
// Source definitions
// ---------------------------------------------------------------------------

interface SourceConfig {
  url: string;
  source_site: string;
  category_slug: string;
  label: string;
}

const SOURCES: SourceConfig[] = [
  {
    url: "https://uncrate.com/gear/",
    source_site: "uncrate",
    category_slug: "edc",
    label: "Uncrate Gear",
  },
  {
    url: "https://thegadgetflow.com/blog/",
    source_site: "gadgetflow",
    category_slug: "other",
    label: "GadgetFlow Blog",
  },
  {
    url: "https://blessthisstuff.com",
    source_site: "blessthisstuff",
    category_slug: "other",
    label: "BlessThisStuff",
  },
  {
    url: "https://dudeiwantthat.com",
    source_site: "dudeiwantthat",
    category_slug: "other",
    label: "DudeIWantThat",
  },
  {
    url: "https://coolthings.com",
    source_site: "coolthings",
    category_slug: "other",
    label: "CoolThings",
  },
  {
    url: "https://gearpatrol.com/tech/",
    source_site: "gearpatrol",
    category_slug: "productivity",
    label: "Gear Patrol Tech",
  },
  {
    url: "https://yankodesign.com",
    source_site: "yankodesign",
    category_slug: "other",
    label: "Yanko Design",
  },
  {
    url: "https://awesomestufftobuy.com/gifts/gadgets/",
    source_site: "awesomestuff",
    category_slug: "other",
    label: "AwesomeStuffToBuy",
  },
  {
    url: "https://rakunew.com",
    source_site: "rakunew",
    category_slug: "other",
    label: "Rakunew",
  },
  {
    url: "https://www.producthunt.com/topics/hardware",
    source_site: "producthunt",
    category_slug: "productivity",
    label: "Product Hunt Hardware",
  },
];

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

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("Starting Firecrawl seed script (markdown mode)...\n");

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

  for (const source of SOURCES) {
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
        const imageUrl = product.image_url
          ? resolveUrl(product.image_url, source.url)
          : null;
        if (!imageUrl || !isValidHttpUrl(imageUrl)) {
          totalSkipped++;
          continue;
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
          content_status: "approved",
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
          console.log(`  Inserted ${batch.length} gadgets`);
        }
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`  Error scraping ${source.label}: ${msg}`);
    }
  }

  console.log("\n========================================");
  console.log(`Seed complete!`);
  console.log(`  Total scraped:  ${totalScraped}`);
  console.log(`  Total inserted: ${totalInserted}`);
  console.log(`  Total skipped:  ${totalSkipped}`);
  console.log("========================================\n");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
