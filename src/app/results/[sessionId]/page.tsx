export const dynamic = "force-dynamic";

import { db } from "@/db";
import { sessionResults, gadgets } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ResultsClient } from "./ResultsClient";
import type { ScoredGadget, Gadget } from "@/types";

interface ResultsPageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { sessionId } = await params;

  // Fetch session results
  const results = await db
    .select()
    .from(sessionResults)
    .where(eq(sessionResults.sessionId, sessionId))
    .limit(1);

  if (results.length === 0) {
    redirect("/");
  }

  const topGadgets = results[0].topGadgets as ScoredGadget[];

  // Fetch full gadget data for top results
  const gadgetIds = topGadgets.map((g) => g.gadget_id);
  const gadgetRows = await db
    .select()
    .from(gadgets)
    .where(eq(gadgets.isActive, true));

  const matchedGadgets: Gadget[] = gadgetRows
    .filter((g) => gadgetIds.includes(g.id))
    .map((g) => ({
      id: g.id,
      title: g.title,
      description: g.description,
      image_url: g.imageUrl,
      price_cents: g.priceCents,
      currency: g.currency ?? "USD",
      source_url: g.sourceUrl,
      source_site: g.sourceSite as Gadget["source_site"],
      category_id: g.categoryId,
      tags: g.tags ?? [],
      is_active: g.isActive ?? true,
      content_status: (g.contentStatus ?? "approved") as Gadget["content_status"],
      view_count: g.viewCount ?? 0,
      right_swipe_count: g.rightSwipeCount ?? 0,
      left_swipe_count: g.leftSwipeCount ?? 0,
      super_swipe_count: g.superSwipeCount ?? 0,
      source_rating: g.sourceRating ? Number(g.sourceRating) : null,
      ai_description: g.aiDescription,
      ai_tags: g.aiTags ?? [],
      embedding: null,
      affiliate_url: g.affiliateUrl,
      fetched_at: g.fetchedAt?.toISOString() ?? new Date().toISOString(),
      created_at: g.createdAt?.toISOString() ?? new Date().toISOString(),
      updated_at: g.updatedAt?.toISOString() ?? new Date().toISOString(),
    }));

  return (
    <ResultsClient
      topGadgets={topGadgets}
      gadgets={matchedGadgets}
      sessionId={sessionId}
    />
  );
}
