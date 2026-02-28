import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return NextResponse.json({
    server_user_id: user?.id ?? null,
    server_user_email: user?.email ?? null,
    is_anonymous: user?.is_anonymous ?? null,
    admin_user_id: process.env.ADMIN_USER_ID ?? "NOT SET",
    match: user?.id === process.env.ADMIN_USER_ID,
  });
}
