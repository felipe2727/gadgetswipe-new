import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { scrapeReddit } from "../_shared/sources/reddit.ts";
import { scrapeGadgetFlow } from "../_shared/sources/gadgetflow.ts";
import { scrapeAmazon } from "../_shared/sources/amazon.ts";
import { scrapeProductHunt } from "../_shared/sources/producthunt.ts";
import { scrapeUncrate } from "../_shared/sources/uncrate.ts";
import { deduplicateGadgets } from "../_shared/deduplicator.ts";
import type { RawGadget, ScraperResult } from "../_shared/types.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Verify authorization
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Missing authorization" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const results: ScraperResult[] = [];

  // Run all scrapers in parallel
  const scraperPromises = [
    { name: "reddit", fn: scrapeReddit },
    { name: "gadgetflow", fn: scrapeGadgetFlow },
    { name: "amazon", fn: scrapeAmazon },
    { name: "producthunt", fn: scrapeProductHunt },
    { name: "uncrate", fn: scrapeUncrate },
  ].map(async ({ name, fn }) => {
    try {
      const gadgets = await fn();
      return { source: name, gadgets } as ScraperResult;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Scraper ${name} failed:`, message);
      return { source: name, gadgets: [], error: message } as ScraperResult;
    }
  });

  const scraperResults = await Promise.allSettled(scraperPromises);

  for (const result of scraperResults) {
    if (result.status === "fulfilled") {
      results.push(result.value);
    }
  }

  // Combine all gadgets
  const allGadgets: RawGadget[] = results.flatMap((r) => r.gadgets);

  // Deduplicate against existing DB
  const newGadgets = await deduplicateGadgets(allGadgets, supabaseUrl, serviceRoleKey);

  // Fetch category IDs for mapping
  const { data: categories } = await supabase
    .from("categories")
    .select("id, slug");

  const categoryMap = new Map(
    (categories ?? []).map((c) => [c.slug, c.id])
  );

  // Insert new gadgets
  let insertedCount = 0;
  if (newGadgets.length > 0) {
    const rows = newGadgets.map((g) => ({
      title: g.title,
      description: g.description ?? null,
      image_url: g.image_url,
      price_cents: g.price_cents ?? null,
      source_url: g.source_url,
      source_site: g.source_site,
      category_id: categoryMap.get(g.category_slug ?? "other") ?? categoryMap.get("other") ?? null,
      tags: g.tags ?? [],
      is_active: true,
      content_status: "approved",
    }));

    // Insert in batches of 50
    for (let i = 0; i < rows.length; i += 50) {
      const batch = rows.slice(i, i + 50);
      const { error } = await supabase.from("gadgets").insert(batch);
      if (error) {
        console.error(`Insert batch error:`, error);
      } else {
        insertedCount += batch.length;
      }
    }
  }

  const summary = {
    total_scraped: allGadgets.length,
    new_inserted: insertedCount,
    duplicates_skipped: allGadgets.length - newGadgets.length,
    sources: results.map((r) => ({
      source: r.source,
      scraped: r.gadgets.length,
      error: r.error ?? null,
    })),
  };

  console.log("Scrape complete:", JSON.stringify(summary));

  return new Response(JSON.stringify(summary), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
