import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { recordSwipeSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = recordSwipeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { session_id, gadget_id, direction, swipe_duration_ms } =
      parsed.data;

    // Insert the swipe
    const { data: swipe, error: swipeError } = await supabase
      .from("swipes")
      .insert([
        {
          user_id: user.id,
          session_id,
          gadget_id,
          direction,
          swipe_duration_ms,
        },
      ])
      .select()
      .single();

    if (swipeError) {
      // Handle unique constraint violation
      if (swipeError.message.includes("unique")) {
        return NextResponse.json(
          { error: "Already swiped this gadget" },
          { status: 409 }
        );
      }
      throw swipeError;
    }

    // Update gadget counters (fetch current, increment, update)
    const { data: gadget } = await supabase
      .from("gadgets")
      .select("view_count, right_swipe_count, left_swipe_count, super_swipe_count")
      .eq("id", gadget_id)
      .single();

    if (gadget) {
      const updates: any = {
        view_count: (gadget.view_count || 0) + 1,
      };

      if (direction === "right") {
        updates.right_swipe_count = (gadget.right_swipe_count || 0) + 1;
      } else if (direction === "super") {
        updates.super_swipe_count = (gadget.super_swipe_count || 0) + 1;
      } else {
        updates.left_swipe_count = (gadget.left_swipe_count || 0) + 1;
      }

      await supabase
        .from("gadgets")
        .update(updates)
        .eq("id", gadget_id);
    }

    return NextResponse.json(swipe, { status: 201 });
  } catch (error) {
    console.error("Error recording swipe:", error);
    return NextResponse.json(
      { error: "Failed to record swipe" },
      { status: 500 }
    );
  }
}
