/**
 * Auto-curate pending gadgets:
 * - Reject accessories, stands, cases, cables, mounts, etc.
 * - Reject duplicates (keep max 3-4 per sub-category)
 * - Approve quality gadgets
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Items with these words in the title are NOT real gadgets — reject
const REJECT_KEYWORDS = [
  "stand", "mount", "holder", "hanger", "hook", "bracket",
  "case", "cover", "sleeve", "pouch", "bag", "carrying",
  "cable", "cord", "adapter", "dongle", "converter", "hub",
  "charger", "charging", "power bank", "power strip",
  "screen protector", "tempered glass", "film",
  "replacement", "repair", "parts", "tips", "pads", "cushion", "ear pad",
  "strap", "band", "wristband",
  "cleaning", "cloth", "wipe",
  "sticker", "decal", "skin",
  "manual", "guide", "book",
  "wall plate", "wall mount",
  "desk mat", "mouse pad", "mousepad",
  "usb hub", "extension",
  "memory card", "sd card", "micro sd",
  "stylus", "pen", "pencil",
  "tripod", "selfie stick", "gimbal",
  "remote control", "replacement remote",
  "light strip", "led strip",
  "surge protector",
];

// Sub-category groupings for dedup (title keyword → group)
const CATEGORY_GROUPS: Record<string, string[]> = {
  "gaming-headset": ["gaming headset", "gaming headphone"],
  "headphone": ["headphone", "over-ear", "on-ear"],
  "earbud": ["earbud", "earphone", "in-ear", "earbuds"],
  "speaker": ["speaker", "soundbar", "sound bar"],
  "smartwatch": ["smartwatch", "smart watch", "fitness tracker", "fitness band"],
  "keyboard": ["keyboard", "mechanical keyboard"],
  "mouse": ["gaming mouse", "wireless mouse", "mouse"],
  "monitor": ["monitor", "display"],
  "webcam": ["webcam", "web cam"],
  "microphone": ["microphone", "mic", "usb mic"],
  "tablet": ["tablet", "ipad"],
  "laptop": ["laptop", "notebook", "chromebook", "macbook"],
  "phone": ["phone", "iphone", "smartphone", "galaxy"],
  "drone": ["drone", "quadcopter"],
  "camera": ["camera", "action cam", "gopro", "dashcam", "dash cam"],
  "tv": ["television", "smart tv", "4k tv", "oled tv"],
  "router": ["router", "mesh", "wifi", "wi-fi"],
  "console": ["playstation", "xbox", "nintendo", "switch", "console"],
  "vr": ["vr headset", "virtual reality", "quest", "meta quest"],
  "projector": ["projector", "portable projector"],
  "e-reader": ["kindle", "e-reader", "ereader"],
};

const MAX_PER_GROUP = 4;

function shouldReject(title: string): boolean {
  const lower = title.toLowerCase();
  return REJECT_KEYWORDS.some((kw) => lower.includes(kw));
}

function getGroup(title: string): string {
  const lower = title.toLowerCase();
  for (const [group, keywords] of Object.entries(CATEGORY_GROUPS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return group;
    }
  }
  return "other";
}

async function main() {
  // Fetch all pending gadgets
  const allGadgets: any[] = [];
  let offset = 0;
  const pageSize = 500;

  while (true) {
    const { data, error } = await supabase
      .from("gadgets")
      .select("id, title, image_url, source_site")
      .eq("content_status", "pending")
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error("Fetch error:", error.message);
      process.exit(1);
    }
    if (!data || data.length === 0) break;
    allGadgets.push(...data);
    if (data.length < pageSize) break;
    offset += pageSize;
  }

  console.log(`Found ${allGadgets.length} pending gadgets\n`);

  const approveIds: string[] = [];
  const rejectIds: string[] = [];
  const groupCounts: Record<string, number> = {};

  // Sort by title to get variety (not all from same batch)
  const shuffled = allGadgets.sort(() => Math.random() - 0.5);

  for (const g of shuffled) {
    const title = g.title ?? "";

    // 1. Reject accessories and junk
    if (shouldReject(title)) {
      rejectIds.push(g.id);
      continue;
    }

    // 2. Reject items with no image
    if (!g.image_url) {
      rejectIds.push(g.id);
      continue;
    }

    // 3. Check group limit
    const group = getGroup(title);
    const count = groupCounts[group] ?? 0;

    if (count >= MAX_PER_GROUP) {
      rejectIds.push(g.id);
      continue;
    }

    // Approve
    groupCounts[group] = count + 1;
    approveIds.push(g.id);
  }

  console.log(`Approving: ${approveIds.length}`);
  console.log(`Rejecting: ${rejectIds.length}`);
  console.log(`\nGroup breakdown:`);
  for (const [group, count] of Object.entries(groupCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${group}: ${count}`);
  }

  // Print approved titles
  const approvedGadgets = allGadgets.filter((g) => approveIds.includes(g.id));
  console.log(`\n--- APPROVED (${approvedGadgets.length}) ---`);
  for (const g of approvedGadgets) {
    console.log(`  [${getGroup(g.title)}] ${g.title}`);
  }

  // Bulk update
  if (approveIds.length > 0) {
    const batchSize = 100;
    for (let i = 0; i < approveIds.length; i += batchSize) {
      const batch = approveIds.slice(i, i + batchSize);
      const { error } = await supabase
        .from("gadgets")
        .update({ content_status: "approved" })
        .in("id", batch);
      if (error) console.error("Approve error:", error.message);
    }
    console.log(`\nApproved ${approveIds.length} gadgets`);
  }

  if (rejectIds.length > 0) {
    const batchSize = 100;
    for (let i = 0; i < rejectIds.length; i += batchSize) {
      const batch = rejectIds.slice(i, i + batchSize);
      const { error } = await supabase
        .from("gadgets")
        .update({ content_status: "rejected" })
        .in("id", batch);
      if (error) console.error("Reject error:", error.message);
    }
    console.log(`Rejected ${rejectIds.length} gadgets`);
  }
}

main();
