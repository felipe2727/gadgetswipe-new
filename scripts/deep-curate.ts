/**
 * Deep curation: reject everything that's NOT an electronic gadget.
 * Keep only: headphones, earbuds, speakers, smartwatches, phones, tablets,
 * laptops, monitors, keyboards, mice, cameras, drones, game consoles/controllers,
 * VR headsets, projectors, e-readers, smart home devices, action cameras, DACs,
 * streaming devices, dash cams, GPS devices, e-bikes, electric scooters.
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// If title contains ANY of these → REJECT (not electronics)
const HARD_REJECT = [
  // Not products - articles, reviews, lists, generic pages
  "review", "should you buy", "deals that", "deals on", "subscribe to",
  "early black friday", "skip the chaos", "event is mysterious",
  "did google actually change", "editors picks", "stuff we drool",
  "huckberry finds", "essentials february", "best desk accessories",
  "tech\n", "ガジェット", "ニュース", "techcrunch",
  // Non-electronics
  "lego", "levi's", "collars & co", "hoka", "melin", "rimowa",
  "topo designs", "flint and tinder", "peak design mobile strap",
  "nike acg", "yeti skala", "camping pillow",
  "espresso", "moka pot", "coffee", "wine", "tinto amorio",
  "bbq", "grill", "weber", "frying pan", "breakfast station",
  "slushie", "slushi",
  "pimple popper", "cheating golf", "paracord grenade",
  "wearable chair", "chairless",
  "pickleball", "table tennis", "marty supreme",
  "porsche", "mercedes", "camper van", "ferrari", "electric suv",
  "yacht", "dayboat", "submarine",
  "sauna", "recovery boot", "infrared sauna",
  "survival kit", "uncharted supply",
  "tent box", "wingcube", "campstove", "biolitecampstove",
  "ride-on toy", "garvee",
  "cat habitat", "wooden basket", "virginia sin", "wall-clock",
  "pile of leaves", "3d-printed building", "corn waste",
  "desk accessories", "minimalist studio",
  "suitcase", "carbon fiber suitcase", "luggage",
  "microblade", "pocket knife", "leatherman", "wesn",
  "credit karma", "turbotax",
  "figma design", "spring boot", "practical ui",
  "appSignal", "cal.com", "canvas by mindpal", "daily bots",
  "sentra by dodo", "thunai", "findr: remember",
  "hardware\n",
  "- image", "close-up of a",
  "living room with",
  "shapeshifting machine", "road-construct",
  "ofis rebuilt", "post-war home",
  "maersk vessel", "sustainable shippin",
  "scandi", "scandinavian edition",
  "besnati hurlo",
  "polaris rzr",
  "collars",
  "pants",
  "bod", "bodi fitness",
  "levels cgm", "glucose",
  "tenpoint yuvezzi", "eye drop",
  "exod pod", "air station shelter",
  "everyday carry",
  "orbitkey",
  "camping lantern", "headlamp",
  "flashlight",
  "ai health tracker", "meta wants to put",
  "mexico just turned",
  "google released a new",
  "your tactical",
  "command deck",
  "stop carrying three",
  "keyboard has a 4k screen",
];

// Positive: must match at least one of these to be a real electronic gadget
const GADGET_KEYWORDS = [
  "headphone", "headset", "earbud", "earphone", "airpod",
  "speaker", "soundbar", "echo",
  "smartwatch", "smart watch", "apple watch", "galaxy watch", "oura ring",
  "phone", "iphone", "galaxy s2", "pixel",
  "tablet", "ipad", "kindle", "e-reader", "ereader",
  "laptop", "macbook", "chromebook",
  "monitor", "display", "gaming monitor",
  "keyboard", "mechanical",
  "mouse", "trackpad",
  "webcam", "camera", "gopro", "action cam", "dash cam", "dashcam", "insta360",
  "drone", "quadcopter", "dji",
  "controller", "gamepad", "xbox", "playstation", "nintendo", "switch", "console",
  "vr headset", "quest", "virtual reality",
  "projector",
  "microphone", "mic",
  "streaming stick", "fire tv", "roku", "chromecast", "apple tv",
  "ring chime", "ring doorbell", "doorbell",
  "smart home", "smart plug", "smart light", "hue",
  "router", "mesh wifi",
  "e-bike", "ebike", "electric scooter",
  "gimbal", "stabilizer",
  "dac", "amp", "fiio",
  "tesla", // only for Tesla tech accessories
  "steam deck",
  "switchbot",
  "humidifier", "air purifier",
  "robot", "astro",
  "gps", "navigator",
  "ray-ban meta", "smart glasses",
  "gaming mouse", "gaming keyboard",
  "retro console", "vectrex", "modretro", "analogue",
  "e-ink", "trmnl",
  "espresso maker", // actually reject this
  "sleepbuds", "ozlo",
  "magnetic charging",
  "marshall", "jbl", "sony", "samsung", "apple",
  "survival watch",
  "chess robot",
  "tcl", "optoma",
  "xteink",
  "ayaneo", "handheld",
  "asus rog",
  "huawei watch",
  "garmin",
  "nothing headphone",
  "osmo", "pocket camera",
  "fender", "audio interface",
  "gear coin",
  "theragun",
];

async function main() {
  const { data, error } = await supabase
    .from("gadgets")
    .select("id, title, source_site")
    .eq("content_status", "approved")
    .order("title");

  if (error || !data) {
    console.error("Error:", error?.message);
    return;
  }

  console.log(`Total approved: ${data.length}\n`);

  const keepIds: string[] = [];
  const rejectIds: string[] = [];

  for (const g of data) {
    const title = (g.title ?? "").toLowerCase();

    // Hard reject
    if (HARD_REJECT.some((kw) => title.includes(kw.toLowerCase()))) {
      rejectIds.push(g.id);
      continue;
    }

    // Must match a gadget keyword
    if (GADGET_KEYWORDS.some((kw) => title.includes(kw.toLowerCase()))) {
      keepIds.push(g.id);
    } else {
      rejectIds.push(g.id);
    }
  }

  // Now deduplicate: max 3 per category
  const CATEGORY_MAP: Record<string, string[]> = {
    "gaming-headset": ["gaming headset", "gaming headphone"],
    "headphone": ["headphone", "over-ear", "on-ear", "cloud iii", "rog kithara"],
    "earbud": ["earbud", "earphone", "earbuds", "airpod", "galaxy buds", "jlab go air", "nothing headphone", "sleepbuds"],
    "speaker": ["speaker", "soundbar", "echo pop", "marshall", "wonderboom", "ancoon"],
    "smartwatch": ["smartwatch", "smart watch", "apple watch", "galaxy watch", "huawei watch", "oura ring"],
    "phone": ["phone", "iphone", "galaxy s2", "pixel 10"],
    "keyboard": ["keyboard"],
    "mouse": ["mouse", "trackpad"],
    "monitor": ["monitor", "gaming monitor"],
    "camera": ["camera", "gopro", "insta360", "osmo", "dashcam", "dash cam", "viofo"],
    "controller": ["controller", "gamepad", "arcade"],
    "streaming": ["streaming stick", "fire tv", "roku", "chromecast"],
    "smart-home": ["ring chime", "doorbell", "switchbot", "hue", "humidifier", "smart plug"],
    "audio-pro": ["microphone", "dac", "amp", "fiio", "audio interface", "fender"],
    "wearable-tech": ["ray-ban meta", "smart glasses", "theragun", "garmin"],
    "retro-gaming": ["vectrex", "modretro", "analogue", "retro"],
    "handheld": ["steam deck", "ayaneo", "handheld"],
    "projector": ["projector", "tcl playcube", "optoma"],
    "e-reader": ["kindle", "e-reader", "xteink", "e-ink"],
    "other-tech": [],
  };

  const MAX_PER_CAT = 3;
  const catCounts: Record<string, number> = {};
  const finalKeep: string[] = [];
  const dedupReject: string[] = [];

  // Shuffle to get variety
  const keepGadgets = data.filter((g) => keepIds.includes(g.id)).sort(() => Math.random() - 0.5);

  for (const g of keepGadgets) {
    const title = (g.title ?? "").toLowerCase();
    let cat = "other-tech";
    for (const [c, keywords] of Object.entries(CATEGORY_MAP)) {
      if (keywords.some((kw) => title.includes(kw))) {
        cat = c;
        break;
      }
    }

    const count = catCounts[cat] ?? 0;
    if (count >= MAX_PER_CAT) {
      dedupReject.push(g.id);
    } else {
      catCounts[cat] = count + 1;
      finalKeep.push(g.id);
    }
  }

  const allReject = [...rejectIds, ...dedupReject];

  console.log(`Keeping: ${finalKeep.length}`);
  console.log(`Rejecting: ${allReject.length}`);
  console.log(`\nCategory breakdown:`);
  for (const [cat, count] of Object.entries(catCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat}: ${count}`);
  }

  // Show kept items
  const keptGadgets = data.filter((g) => finalKeep.includes(g.id));
  console.log(`\n--- KEEPING (${keptGadgets.length}) ---`);
  for (const g of keptGadgets) {
    console.log(`  [${g.source_site}] ${g.title?.substring(0, 80)}`);
  }

  console.log(`\n--- REJECTING (${allReject.length}) ---`);
  const rejGadgets = data.filter((g) => allReject.includes(g.id));
  for (const g of rejGadgets) {
    console.log(`  [${g.source_site}] ${g.title?.substring(0, 80)}`);
  }

  // Apply
  if (allReject.length > 0) {
    for (let i = 0; i < allReject.length; i += 100) {
      const batch = allReject.slice(i, i + 100);
      await supabase.from("gadgets").update({ content_status: "rejected" }).in("id", batch);
    }
    console.log(`\nRejected ${allReject.length} gadgets`);
  }

  const { count } = await supabase
    .from("gadgets")
    .select("*", { count: "exact", head: true })
    .eq("content_status", "approved");
  console.log(`Final approved count: ${count}`);
}

main();
