import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getGadgetsForSession } from "@/lib/gadgets";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const gadgets = await getGadgetsForSession(user.id, 25);
    return NextResponse.json(gadgets);
  } catch (error) {
    console.error("Error fetching gadgets:", error);
    return NextResponse.json(
      { error: "Failed to fetch gadgets" },
      { status: 500 }
    );
  }
}
