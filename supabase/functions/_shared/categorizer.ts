const CATEGORY_KEYWORDS: Record<string, string[]> = {
  audio: [
    "headphone", "speaker", "earbuds", "amp", "audio", "sound", "dac",
    "microphone", "subwoofer", "soundbar", "hi-fi", "stereo",
  ],
  wearable: [
    "watch", "ring", "band", "wearable", "glasses", "bracelet", "tracker",
  ],
  smart_home: [
    "alexa", "home", "light", "thermostat", "lock", "smart", "doorbell",
    "curtain", "plug", "switch", "hub", "sensor",
  ],
  edc: [
    "knife", "multi-tool", "flashlight", "pen", "wallet", "key",
    "lighter", "carry", "titanium", "edc",
  ],
  gaming: [
    "gaming", "controller", "console", "joystick", "headset", "steam",
    "playstation", "xbox", "nintendo", "arcade",
  ],
  productivity: [
    "keyboard", "mouse", "monitor", "desk", "webcam", "microphone",
    "stream deck", "tablet", "stylus", "note", "planner",
  ],
  photography: [
    "camera", "lens", "tripod", "drone", "gimbal", "photo", "film",
    "action cam", "gopro", "insta360",
  ],
  automotive: [
    "car", "dash cam", "charger", "tesla", "mount", "gps", "obd",
    "tire", "automotive",
  ],
  outdoor: [
    "camping", "hiking", "tent", "backpack", "survival", "compass",
    "stove", "solar", "outdoor", "adventure", "bike",
  ],
  health: [
    "fitness", "health", "massage", "recovery", "scale", "blood",
    "glucose", "sleep", "meditation", "yoga",
  ],
};

export function categorize(title: string, description?: string): string {
  const text = `${title} ${description ?? ""}`.toLowerCase();

  let bestMatch = "other";
  let bestScore = 0;

  for (const [slug, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        score++;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = slug;
    }
  }

  return bestMatch;
}
