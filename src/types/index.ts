export type SwipeDirection = "right" | "left" | "super";

export type SourceSite =
  | "reddit"
  | "gadgetflow"
  | "amazon"
  | "producthunt"
  | "uncrate"
  | "blessthisstuff"
  | "awesomestuff"
  | "dudeiwantthat"
  | "coolthings"
  | "gearpatrol"
  | "yankodesign"
  | "rakunew"
  | "wired";

export interface Gadget {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  price_cents: number | null;
  currency: string;
  source_url: string;
  source_site: SourceSite;
  category_id: string | null;
  tags: string[];
  is_active: boolean;
  content_status: "pending" | "approved" | "rejected";
  view_count: number;
  right_swipe_count: number;
  left_swipe_count: number;
  super_swipe_count: number;
  source_rating: number | null;
  ai_description: string | null;
  ai_tags: string[];
  embedding: number[] | null;
  affiliate_url: string | null;
  fetched_at: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  created_at: string;
}

export interface SwipeSession {
  id: string;
  user_id: string;
  total_cards: number;
  started_at: string;
  completed_at: string | null;
}

export interface Swipe {
  id: string;
  user_id: string;
  session_id: string;
  gadget_id: string;
  direction: SwipeDirection;
  swipe_duration_ms: number | null;
  created_at: string;
}

export interface SessionResult {
  id: string;
  session_id: string;
  user_id: string;
  top_gadgets: ScoredGadget[];
  created_at: string;
}

export interface ScoredGadget {
  gadget_id: string;
  score: number;
  rank: number;
  reasons: string[];
}

export interface AnalyticsEvent {
  id?: string;
  user_id: string;
  session_id?: string;
  gadget_id?: string;
  name: string;
  props?: Record<string, unknown>;
  created_at?: string;
}

export interface RawGadget {
  title: string;
  description?: string;
  image_url: string;
  price_cents?: number;
  source_url: string;
  source_site: SourceSite;
  category_slug?: string;
  tags?: string[];
}
