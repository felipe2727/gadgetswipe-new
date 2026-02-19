import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { scoreSession } from "@/lib/scoring";
import type { Swipe, Gadget } from "@/types";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all swipes for this session
    const { data: swipeRows } = await supabase
      .from("swipes")
      .select("*")
      .eq("session_id", sessionId)
      .eq("user_id", user.id);

    if (!swipeRows || swipeRows.length === 0) {
      return NextResponse.json(
        { error: "No swipes found for this session" },
        { status: 404 }
      );
    }

    // Fetch all gadgets involved
    const gadgetIds = swipeRows.map((s) => s.gadget_id);
    const { data: gadgetRows } = await supabase
      .from("gadgets")
      .select("*")
      .in("id", gadgetIds);

    // Map to our interface types
    const swipesData: Swipe[] = swipeRows.map((s) => ({
      id: s.id,
      user_id: s.user_id,
      session_id: s.session_id,
      gadget_id: s.gadget_id,
      direction: s.direction as Swipe["direction"],
      swipe_duration_ms: s.swipe_duration_ms,
      created_at: s.created_at,
    }));

    const gadgetsData: Gadget[] = (gadgetRows ?? []).map((g) => ({
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

    // Run scoring algorithm
    const topGadgets = scoreSession(swipesData, gadgetsData);

    // Store results
    const { data: result } = await supabase
      .from("session_results")
      .insert([
        {
          session_id: sessionId,
          user_id: user.id,
          top_gadgets: topGadgets,
        },
      ])
      .select()
      .single();

    // Mark session as completed
    await supabase
      .from("swipe_sessions")
      .update({ completed_at: new Date().toISOString() })
      .eq("id", sessionId);

    return NextResponse.json(
      { result, topGadgets, gadgets: gadgetsData.filter((g) => topGadgets.some((t) => t.gadget_id === g.id)) },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error computing results:", error);
    return NextResponse.json(
      { error: "Failed to compute results" },
      { status: 500 }
    );
  }
}
