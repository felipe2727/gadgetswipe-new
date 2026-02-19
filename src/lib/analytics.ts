import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function getKpiData() {
  const supabaseAdmin = getSupabaseAdmin();
  const [usersRes, swipesRes, superRes, sessionsRes] = await Promise.all([
    supabaseAdmin.from("swipe_sessions").select("user_id", { count: "exact", head: true }),
    supabaseAdmin.from("swipes").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("swipes").select("id", { count: "exact", head: true }).eq("direction", "super"),
    supabaseAdmin
      .from("swipe_sessions")
      .select("started_at, completed_at")
      .not("completed_at", "is", null),
  ]);

  const totalUsers = usersRes.count ?? 0;
  const totalSwipes = swipesRes.count ?? 0;
  const superSwipes = superRes.count ?? 0;
  const superPercent = totalSwipes > 0 ? ((superSwipes / totalSwipes) * 100).toFixed(1) : "0";

  let avgSessionMs = 0;
  if (sessionsRes.data && sessionsRes.data.length > 0) {
    const durations = sessionsRes.data
      .map((s) => {
        const start = new Date(s.started_at).getTime();
        const end = new Date(s.completed_at).getTime();
        return end - start;
      })
      .filter((d) => d > 0);
    avgSessionMs =
      durations.length > 0
        ? durations.reduce((a, b) => a + b, 0) / durations.length
        : 0;
  }

  return { totalUsers, totalSwipes, superPercent, avgSessionMs };
}

export async function getSwipeDistribution() {
  const supabaseAdmin = getSupabaseAdmin();
  const [rightRes, leftRes, superRes] = await Promise.all([
    supabaseAdmin.from("swipes").select("id", { count: "exact", head: true }).eq("direction", "right"),
    supabaseAdmin.from("swipes").select("id", { count: "exact", head: true }).eq("direction", "left"),
    supabaseAdmin.from("swipes").select("id", { count: "exact", head: true }).eq("direction", "super"),
  ]);
  return [
    { name: "Right", value: rightRes.count ?? 0, color: "#00D26A" },
    { name: "Left", value: leftRes.count ?? 0, color: "#FF4757" },
    { name: "Super", value: superRes.count ?? 0, color: "#FFD700" },
  ];
}

export async function getDailyActivity(days = 30) {
  const supabaseAdmin = getSupabaseAdmin();
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data } = await supabaseAdmin
    .from("swipes")
    .select("direction, created_at")
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: true });

  if (!data) return [];

  const byDay = new Map<string, { day: string; right: number; left: number; super: number; total: number }>();

  for (const swipe of data) {
    const day = new Date(swipe.created_at).toISOString().split("T")[0];
    if (!byDay.has(day)) {
      byDay.set(day, { day, right: 0, left: 0, super: 0, total: 0 });
    }
    const entry = byDay.get(day)!;
    entry.total++;
    if (swipe.direction === "right") entry.right++;
    else if (swipe.direction === "left") entry.left++;
    else if (swipe.direction === "super") entry.super++;
  }

  return Array.from(byDay.values());
}

export async function getTopGadgets(limit = 10) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data } = await supabaseAdmin
    .from("gadgets")
    .select("id, title, right_swipe_count, super_swipe_count, view_count")
    .order("right_swipe_count", { ascending: false })
    .limit(limit);

  return (data ?? []).map((g) => ({
    title: g.title.length > 25 ? g.title.substring(0, 25) + "..." : g.title,
    likes: (g.right_swipe_count ?? 0) + (g.super_swipe_count ?? 0),
    views: g.view_count ?? 0,
  }));
}

export async function getCategoryPopularity() {
  const supabaseAdmin = getSupabaseAdmin();
  const { data: swipeData } = await supabaseAdmin
    .from("swipes")
    .select("gadget_id, direction")
    .in("direction", ["right", "super"]);

  const { data: gadgetData } = await supabaseAdmin
    .from("gadgets")
    .select("id, category_id");

  const { data: categoryData } = await supabaseAdmin
    .from("categories")
    .select("id, name");

  if (!swipeData || !gadgetData || !categoryData) return [];

  const gadgetCategoryMap = new Map(gadgetData.map((g) => [g.id, g.category_id]));
  const categoryNameMap = new Map(categoryData.map((c) => [c.id, c.name]));

  const counts = new Map<string, number>();
  for (const swipe of swipeData) {
    const catId = gadgetCategoryMap.get(swipe.gadget_id);
    if (catId) {
      counts.set(catId, (counts.get(catId) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([catId, count]) => ({
      name: categoryNameMap.get(catId) ?? "Other",
      value: count,
    }))
    .sort((a, b) => b.value - a.value);
}

export async function getPriceVsLikeRate() {
  const supabaseAdmin = getSupabaseAdmin();
  const { data } = await supabaseAdmin
    .from("gadgets")
    .select("title, price_cents, right_swipe_count, super_swipe_count, view_count")
    .not("price_cents", "is", null)
    .gt("view_count", 0);

  return (data ?? []).map((g) => ({
    title: g.title,
    price: (g.price_cents ?? 0) / 100,
    likeRate:
      g.view_count > 0
        ? Math.round(
            (((g.right_swipe_count ?? 0) + (g.super_swipe_count ?? 0)) / g.view_count) * 100
          )
        : 0,
  }));
}

export async function getAvgDurationByDirection() {
  const supabaseAdmin = getSupabaseAdmin();
  const { data } = await supabaseAdmin
    .from("swipes")
    .select("direction, swipe_duration_ms")
    .not("swipe_duration_ms", "is", null);

  if (!data) return [];

  const grouped = new Map<string, number[]>();
  for (const s of data) {
    if (!grouped.has(s.direction)) grouped.set(s.direction, []);
    grouped.get(s.direction)!.push(s.swipe_duration_ms);
  }

  return Array.from(grouped.entries()).map(([direction, durations]) => ({
    direction: direction.charAt(0).toUpperCase() + direction.slice(1),
    avgMs: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
  }));
}

export async function getSourcePerformance() {
  const supabaseAdmin = getSupabaseAdmin();
  const { data } = await supabaseAdmin
    .from("gadgets")
    .select("source_site, right_swipe_count, super_swipe_count, view_count")
    .gt("view_count", 0);

  if (!data) return [];

  const grouped = new Map<string, { likes: number; views: number }>();
  for (const g of data) {
    if (!grouped.has(g.source_site)) grouped.set(g.source_site, { likes: 0, views: 0 });
    const entry = grouped.get(g.source_site)!;
    entry.likes += (g.right_swipe_count ?? 0) + (g.super_swipe_count ?? 0);
    entry.views += g.view_count ?? 0;
  }

  return Array.from(grouped.entries())
    .map(([source, stats]) => ({
      source,
      likeRate: stats.views > 0 ? Math.round((stats.likes / stats.views) * 100) : 0,
    }))
    .sort((a, b) => b.likeRate - a.likeRate);
}

export async function getUserSessionDistribution() {
  const supabaseAdmin = getSupabaseAdmin();
  const { data } = await supabaseAdmin
    .from("swipe_sessions")
    .select("user_id");

  if (!data) return [];

  const userCounts = new Map<string, number>();
  for (const s of data) {
    userCounts.set(s.user_id, (userCounts.get(s.user_id) ?? 0) + 1);
  }

  const distribution = new Map<string, number>();
  for (const count of userCounts.values()) {
    const bucket = count >= 5 ? "5+" : String(count);
    distribution.set(bucket, (distribution.get(bucket) ?? 0) + 1);
  }

  return Array.from(distribution.entries())
    .map(([sessions, users]) => ({ sessions, users }))
    .sort((a, b) => {
      const aNum = a.sessions === "5+" ? 5 : Number(a.sessions);
      const bNum = b.sessions === "5+" ? 5 : Number(b.sessions);
      return aNum - bNum;
    });
}

export async function getConversionFunnel() {
  const supabaseAdmin = getSupabaseAdmin();
  const [startedRes, completedRes, clicksRes] = await Promise.all([
    supabaseAdmin.from("swipe_sessions").select("id", { count: "exact", head: true }),
    supabaseAdmin
      .from("swipe_sessions")
      .select("id", { count: "exact", head: true })
      .not("completed_at", "is", null),
    supabaseAdmin
      .from("events")
      .select("id", { count: "exact", head: true })
      .eq("name", "deal_click"),
  ]);

  return [
    { stage: "Sessions Started", value: startedRes.count ?? 0 },
    { stage: "Sessions Completed", value: completedRes.count ?? 0 },
    { stage: "Deal Clicked", value: clicksRes.count ?? 0 },
  ];
}
