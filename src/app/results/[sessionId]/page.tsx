export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ResultsClient } from "./ResultsClient";
import type { ScoredGadget, Gadget } from "@/types";

interface ResultsPageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { sessionId } = await params;
  const supabase = await createClient();

  // Fetch session results
  const { data: resultRow } = await supabase
    .from("session_results")
    .select("*")
    .eq("session_id", sessionId)
    .limit(1)
    .single();

  if (!resultRow) {
    redirect("/");
  }

  const topGadgets = resultRow.top_gadgets as ScoredGadget[];

  // Fetch full gadget data for top results
  const gadgetIds = topGadgets.map((g) => g.gadget_id);
  const { data: gadgetRows } = await supabase
    .from("gadgets")
    .select("*")
    .in("id", gadgetIds);

  const matchedGadgets: Gadget[] = (gadgetRows ?? []).map((g) => ({
    id: g.id,
    title: g.title,
    description: g.description,
    image_url: g.image_url,
    price_cents: g.price_cents,
    currency: g.currency ?? "USD",
    source_url: g.source_url,
    source_site: g.source_site as Gadget["source_site"],
    category_id: g.category_id,
    tags: g.tags ?? [],
    is_active: g.is_active ?? true,
    content_status: (g.content_status ?? "approved") as Gadget["content_status"],
    view_count: g.view_count ?? 0,
    right_swipe_count: g.right_swipe_count ?? 0,
    left_swipe_count: g.left_swipe_count ?? 0,
    super_swipe_count: g.super_swipe_count ?? 0,
    source_rating: g.source_rating ? Number(g.source_rating) : null,
    ai_description: g.ai_description,
    ai_tags: g.ai_tags ?? [],
    embedding: null,
    affiliate_url: g.affiliate_url,
    fetched_at: g.fetched_at,
    created_at: g.created_at,
    updated_at: g.updated_at,
  }));

  return (
    <ResultsClient
      topGadgets={topGadgets}
      gadgets={matchedGadgets}
      sessionId={sessionId}
    />
  );
}
