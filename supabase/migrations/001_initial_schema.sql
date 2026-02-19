-- ============================================
-- EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ============================================
-- CATEGORIES
-- ============================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO categories (slug, name) VALUES
  ('audio', 'Audio'),
  ('wearable', 'Wearables'),
  ('smart_home', 'Smart Home'),
  ('edc', 'EDC & Tools'),
  ('gaming', 'Gaming'),
  ('productivity', 'Productivity'),
  ('photography', 'Photography'),
  ('automotive', 'Automotive'),
  ('outdoor', 'Outdoor & Travel'),
  ('health', 'Health & Fitness'),
  ('other', 'Other');

-- ============================================
-- GADGETS
-- ============================================
CREATE TABLE gadgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  price_cents INTEGER,
  currency TEXT DEFAULT 'USD',
  source_url TEXT NOT NULL UNIQUE,
  source_site TEXT NOT NULL,
  category_id UUID REFERENCES categories(id),
  tags TEXT[] DEFAULT '{}',
  source_rating NUMERIC(3,2),
  is_active BOOLEAN DEFAULT true,
  content_status TEXT DEFAULT 'approved' CHECK (content_status IN ('pending', 'approved', 'rejected')),
  view_count INTEGER DEFAULT 0,
  right_swipe_count INTEGER DEFAULT 0,
  left_swipe_count INTEGER DEFAULT 0,
  super_swipe_count INTEGER DEFAULT 0,
  ai_description TEXT,
  ai_tags TEXT[] DEFAULT '{}',
  embedding VECTOR(1536),
  affiliate_url TEXT,
  fetched_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_gadgets_active ON gadgets(is_active) WHERE is_active = true;
CREATE INDEX idx_gadgets_category ON gadgets(category_id);
CREATE INDEX idx_gadgets_source ON gadgets(source_url);

-- ============================================
-- SWIPE SESSIONS
-- ============================================
CREATE TABLE swipe_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  total_cards INTEGER NOT NULL DEFAULT 20,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_sessions_user ON swipe_sessions(user_id);

-- ============================================
-- SWIPES
-- ============================================
CREATE TABLE swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES swipe_sessions(id) ON DELETE CASCADE,
  gadget_id UUID REFERENCES gadgets(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('right', 'left', 'super')),
  swipe_duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, gadget_id)
);

CREATE INDEX idx_swipes_user ON swipes(user_id);
CREATE INDEX idx_swipes_session ON swipes(session_id);
CREATE INDEX idx_swipes_gadget ON swipes(gadget_id);

-- ============================================
-- SESSION RESULTS
-- ============================================
CREATE TABLE session_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES swipe_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  top_gadgets JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_results_user ON session_results(user_id);

-- ============================================
-- EVENTS
-- ============================================
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id UUID REFERENCES swipe_sessions(id) ON DELETE SET NULL,
  gadget_id UUID REFERENCES gadgets(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  props JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_events_name ON events(name, created_at DESC);
CREATE INDEX idx_events_user ON events(user_id, created_at DESC);

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE gadgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipe_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active gadgets" ON gadgets FOR SELECT USING (is_active = true);

CREATE POLICY "Users read own swipes" ON swipes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own swipes" ON swipes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read own sessions" ON swipe_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own sessions" ON swipe_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own sessions" ON swipe_sessions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users read own results" ON session_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own results" ON session_results FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users insert own events" ON events FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- ADMIN ANALYTICS VIEWS
-- ============================================
CREATE VIEW admin_swipe_stats AS
SELECT
  g.id AS gadget_id,
  g.title,
  c.name AS category,
  g.source_site,
  g.price_cents,
  g.right_swipe_count,
  g.left_swipe_count,
  g.super_swipe_count,
  g.view_count,
  CASE WHEN g.view_count > 0
    THEN ROUND((g.right_swipe_count + g.super_swipe_count)::NUMERIC / g.view_count * 100, 1)
    ELSE 0
  END AS like_rate_pct
FROM gadgets g
LEFT JOIN categories c ON g.category_id = c.id;

CREATE VIEW admin_daily_activity AS
SELECT
  DATE(created_at) AS day,
  COUNT(*) AS total_swipes,
  COUNT(*) FILTER (WHERE direction = 'right') AS rights,
  COUNT(*) FILTER (WHERE direction = 'left') AS lefts,
  COUNT(*) FILTER (WHERE direction = 'super') AS supers,
  COUNT(DISTINCT user_id) AS unique_users
FROM swipes
GROUP BY DATE(created_at)
ORDER BY day DESC;
