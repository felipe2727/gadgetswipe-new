import type { Gadget, Swipe, ScoredGadget } from "@/types";
import { median, daysBetween, countBy } from "@/lib/utils";

function getGadget(gadgetId: string, gadgets: Gadget[]): Gadget | undefined {
  return gadgets.find((g) => g.id === gadgetId);
}

export function scoreSession(
  swipes: Swipe[],
  gadgets: Gadget[]
): ScoredGadget[] {
  // Filter to only right + super swipes
  const liked = swipes.filter((s) => s.direction !== "left");
  if (liked.length === 0) return [];

  // Calculate session median view time (for normalization)
  const allDurations = swipes
    .map((s) => s.swipe_duration_ms)
    .filter((d): d is number => d != null && d > 0);
  const medianDuration = median(allDurations);

  // Detect category affinity (3+ rights in same category = bonus)
  const categoryCounts = countBy(liked, (s) => {
    const gadget = getGadget(s.gadget_id, gadgets);
    return gadget?.category_id ?? null;
  });
  const affinityCategories = Object.entries(categoryCounts)
    .filter(([, count]) => count >= 3)
    .map(([catId]) => catId);

  // Score each liked gadget
  const scored = liked.map((swipe) => {
    const gadget = getGadget(swipe.gadget_id, gadgets);
    if (!gadget) {
      return { gadget_id: swipe.gadget_id, score: 0, reasons: [] as string[] };
    }

    let score = 0;
    const reasons: string[] = [];

    // 1. Direction weight
    if (swipe.direction === "super") {
      score += 2.5;
      reasons.push("Super liked");
    } else {
      score += 1.0;
      reasons.push("Liked");
    }

    // 2. Time bonus (longer viewing = higher interest)
    if (swipe.swipe_duration_ms && medianDuration > 0) {
      const timeBonus = Math.min(
        1,
        swipe.swipe_duration_ms / (2 * medianDuration)
      );
      score += timeBonus;
      if (timeBonus > 0.7) reasons.push("Spent extra time viewing");
    }

    // 3. Category affinity bonus
    if (gadget.category_id && affinityCategories.includes(gadget.category_id)) {
      score += 0.5;
      reasons.push("Matches your category preference");
    }

    // 4. Freshness bonus (newer gadgets slightly boosted)
    const daysSinceFetch = daysBetween(gadget.fetched_at, new Date());
    if (daysSinceFetch < 3) {
      score += 0.3;
      reasons.push("Newly discovered");
    }

    return { gadget_id: swipe.gadget_id, score, reasons };
  });

  // Sort descending, apply diversity re-ranking, take top 3
  scored.sort((a, b) => b.score - a.score);
  const diversified = diversifyTopN(scored, gadgets, 3);
  return diversified.map((g, i) => ({ ...g, rank: i + 1 }));
}

// Ensure top 3 isn't all one category (unless user overwhelmingly prefers it)
function diversifyTopN(
  scored: Array<{ gadget_id: string; score: number; reasons: string[] }>,
  gadgets: Gadget[],
  n: number
): Array<{ gadget_id: string; score: number; reasons: string[] }> {
  const result: Array<{
    gadget_id: string;
    score: number;
    reasons: string[];
  }> = [];
  const categorySeen = new Map<string, number>();

  for (const item of scored) {
    const gadget = getGadget(item.gadget_id, gadgets);
    const cat = gadget?.category_id ?? "unknown";
    const count = categorySeen.get(cat) || 0;
    if (count < 2) {
      // max 2 per category in top 3
      result.push(item);
      categorySeen.set(cat, count + 1);
    }
    if (result.length >= n) break;
  }

  return result;
}
