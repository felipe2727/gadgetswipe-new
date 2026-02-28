import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

async function verifyAdmin(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const adminUserId = process.env.ADMIN_USER_ID;
  if (!user || user.id !== adminUserId) {
    return null;
  }
  return user;
}

// GET /api/admin/gadgets?status=pending&offset=0&limit=50
export async function GET(req: NextRequest) {
  const user = await verifyAdmin(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "pending";
  const offset = parseInt(searchParams.get("offset") ?? "0", 10);
  const limit = parseInt(searchParams.get("limit") ?? "50", 10);

  const admin = getSupabaseAdmin();

  const { data, error, count } = await admin
    .from("gadgets")
    .select("*", { count: "exact" })
    .eq("content_status", status)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ gadgets: data, total: count });
}

// PATCH /api/admin/gadgets — bulk update content_status
// Body: { ids: string[], status: "approved" | "rejected" }
export async function PATCH(req: NextRequest) {
  const user = await verifyAdmin(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { ids, status } = body as { ids: string[]; status: string };

  if (
    !ids?.length ||
    !["approved", "rejected", "pending"].includes(status)
  ) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const admin = getSupabaseAdmin();

  const { error } = await admin
    .from("gadgets")
    .update({ content_status: status })
    .in("id", ids);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ updated: ids.length });
}
