import type { RawGadget } from "../types.ts";
import { categorize } from "../categorizer.ts";

export async function scrapeReddit(): Promise<RawGadget[]> {
  const gadgets: RawGadget[] = [];

  const urls = [
    "https://www.reddit.com/r/gadgets/hot.json?limit=50",
    "https://www.reddit.com/r/gadgets/new.json?limit=25",
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "GadgetSwipe/1.0 (Gadget Discovery App)",
        },
      });

      if (!res.ok) continue;

      const json = await res.json();
      const posts = json?.data?.children ?? [];

      for (const post of posts) {
        const data = post.data;
        if (!data) continue;

        // Skip non-image posts
        const imageUrl = extractImageUrl(data);
        if (!imageUrl) continue;

        // Skip self-posts without meaningful titles
        if (!data.title || data.title.length < 10) continue;

        const sourceUrl = `https://www.reddit.com${data.permalink}`;
        const categorySlug = categorize(data.title, data.selftext);

        gadgets.push({
          title: cleanTitle(data.title),
          description: data.selftext
            ? data.selftext.substring(0, 300)
            : undefined,
          image_url: imageUrl,
          source_url: sourceUrl,
          source_site: "reddit",
          category_slug: categorySlug,
          tags: extractTags(data.title),
        });
      }
    } catch (error) {
      console.error(`Reddit scrape error for ${url}:`, error);
    }
  }

  return dedupeByUrl(gadgets);
}

function extractImageUrl(data: Record<string, unknown>): string | null {
  // Direct image link
  const url = data.url as string | undefined;
  if (url && /\.(jpg|jpeg|png|gif|webp)$/i.test(url)) {
    return url;
  }

  // Reddit preview images
  const preview = data.preview as
    | { images?: Array<{ source?: { url?: string } }> }
    | undefined;
  if (preview?.images?.[0]?.source?.url) {
    return preview.images[0].source.url.replace(/&amp;/g, "&");
  }

  // Thumbnail (if it's a valid URL)
  const thumbnail = data.thumbnail as string | undefined;
  if (thumbnail && thumbnail.startsWith("http") && thumbnail !== "default") {
    return thumbnail;
  }

  return null;
}

function cleanTitle(title: string): string {
  // Remove common Reddit prefixes like [Review], [Question], etc.
  return title
    .replace(/^\[.*?\]\s*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTags(title: string): string[] {
  const words = title.toLowerCase().split(/\s+/);
  return words
    .filter((w) => w.length > 3 && !["this", "that", "with", "from", "have"].includes(w))
    .slice(0, 5);
}

function dedupeByUrl(gadgets: RawGadget[]): RawGadget[] {
  const seen = new Set<string>();
  return gadgets.filter((g) => {
    if (seen.has(g.source_url)) return false;
    seen.add(g.source_url);
    return true;
  });
}
