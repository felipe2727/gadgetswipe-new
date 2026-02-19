import type { RawGadget } from "../types.ts";
import { categorize } from "../categorizer.ts";

export async function scrapeProductHunt(): Promise<RawGadget[]> {
  const gadgets: RawGadget[] = [];

  try {
    const res = await fetch("https://www.producthunt.com/topics/hardware", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (!res.ok) {
      console.error(`Product Hunt returned ${res.status}`);
      return [];
    }

    const html = await res.text();

    // Extract product data from Next.js/React hydration data or meta tags
    // Product Hunt uses server-rendered React, so products may be in script tags
    const productPattern =
      /"name":"([^"]+)"[^}]*"tagline":"([^"]+)"[^}]*"thumbnail":\{[^}]*"url":"([^"]+)"/g;
    let match;

    while ((match = productPattern.exec(html)) !== null) {
      const [, name, tagline, thumbnail] = match;
      if (!name || !thumbnail) continue;

      const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const categorySlug = categorize(name, tagline);

      gadgets.push({
        title: name,
        description: tagline,
        image_url: thumbnail,
        source_url: `https://www.producthunt.com/products/${slug}`,
        source_site: "producthunt",
        category_slug: categorySlug,
      });
    }

    // Fallback: try to extract from OpenGraph or meta tags
    if (gadgets.length === 0) {
      const ogPattern =
        /<div[^>]*data-test="post-item"[^>]*>[\s\S]*?<img[^>]*src="([^"]*)"[\s\S]*?<a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/gi;
      while ((match = ogPattern.exec(html)) !== null) {
        const [, imgSrc, href, title] = match;
        if (!imgSrc || !href || !title) continue;

        gadgets.push({
          title: title.trim(),
          image_url: imgSrc,
          source_url: href.startsWith("http")
            ? href
            : `https://www.producthunt.com${href}`,
          source_site: "producthunt",
          category_slug: categorize(title),
        });
      }
    }
  } catch (error) {
    console.error("Product Hunt scrape error:", error);
  }

  return gadgets.slice(0, 25);
}
