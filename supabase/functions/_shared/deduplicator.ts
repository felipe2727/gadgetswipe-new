import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import type { RawGadget } from "./types.ts";

export async function deduplicateGadgets(
  gadgets: RawGadget[],
  supabaseUrl: string,
  serviceRoleKey: string
): Promise<RawGadget[]> {
  if (gadgets.length === 0) return [];

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const sourceUrls = gadgets.map((g) => g.source_url);

  const { data: existing } = await supabase
    .from("gadgets")
    .select("source_url")
    .in("source_url", sourceUrls);

  const existingUrls = new Set((existing ?? []).map((e) => e.source_url));

  return gadgets.filter((g) => !existingUrls.has(g.source_url));
}
