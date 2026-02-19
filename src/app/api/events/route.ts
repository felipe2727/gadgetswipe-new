import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { trackEventSchema } from "@/lib/validations";

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
    const parsed = trackEventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { data: event } = await supabase
      .from("events")
      .insert([
        {
          user_id: user.id,
          session_id: parsed.data.session_id,
          gadget_id: parsed.data.gadget_id,
          name: parsed.data.name,
          props: parsed.data.props ?? {},
        },
      ])
      .select()
      .single();

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Error tracking event:", error);
    return NextResponse.json(
      { error: "Failed to track event" },
      { status: 500 }
    );
  }
}
