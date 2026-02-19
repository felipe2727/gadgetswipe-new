import { createClient } from "@/lib/supabase/server";
import type { Gadget } from "@/types";

export async function getGadgetsForSession(
  userId: string,
  limit = 25
): Promise<Gadget[]> {
  const supabase = await createClient();

  // Fetch active, approved gadgets (randomized by limiting to a window)
  const { data } = await supabase
    .from("gadgets")
    .select("*")
    .eq("is_active", true)
    .eq("content_status", "approved")
    .limit(limit);

  return (data ?? []).map(mapGadgetRow);
}

export async function getGadgetsByIds(ids: string[]): Promise<Gadget[]> {
  if (ids.length === 0) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("gadgets")
    .select("*")
    .in("id", ids);

  return (data ?? []).map(mapGadgetRow);
}

function mapGadgetRow(row: any): Gadget {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    image_url: row.image_url,
    price_cents: row.price_cents,
    currency: row.currency ?? "USD",
    source_url: row.source_url,
    source_site: row.source_site as Gadget["source_site"],
    category_id: row.category_id,
    tags: row.tags ?? [],
    is_active: row.is_active ?? true,
    content_status: (row.content_status ?? "approved") as Gadget["content_status"],
    view_count: row.view_count ?? 0,
    right_swipe_count: row.right_swipe_count ?? 0,
    left_swipe_count: row.left_swipe_count ?? 0,
    super_swipe_count: row.super_swipe_count ?? 0,
    source_rating: row.source_rating ? Number(row.source_rating) : null,
    ai_description: row.ai_description,
    ai_tags: row.ai_tags ?? [],
    embedding: null,
    affiliate_url: row.affiliate_url,
    fetched_at: row.fetched_at ?? new Date().toISOString(),
    created_at: row.created_at ?? new Date().toISOString(),
    updated_at: row.updated_at ?? new Date().toISOString(),
  };
}
