import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  numeric,
  unique,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================
// CATEGORIES
// ============================================
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").unique().notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  gadgets: many(gadgets),
}));

// ============================================
// GADGETS
// ============================================
export const gadgets = pgTable(
  "gadgets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    description: text("description"),
    imageUrl: text("image_url").notNull(),
    priceCents: integer("price_cents"),
    currency: text("currency").default("USD"),
    sourceUrl: text("source_url").notNull().unique(),
    sourceSite: text("source_site").notNull(),
    categoryId: uuid("category_id").references(() => categories.id),
    tags: text("tags").array().default([]),
    sourceRating: numeric("source_rating", { precision: 3, scale: 2 }),
    isActive: boolean("is_active").default(true),
    contentStatus: text("content_status").default("approved"),
    viewCount: integer("view_count").default(0),
    rightSwipeCount: integer("right_swipe_count").default(0),
    leftSwipeCount: integer("left_swipe_count").default(0),
    superSwipeCount: integer("super_swipe_count").default(0),
    aiDescription: text("ai_description"),
    aiTags: text("ai_tags").array().default([]),
    // embedding: skip for now, pgvector custom type needed in Phase 2
    affiliateUrl: text("affiliate_url"),
    fetchedAt: timestamp("fetched_at", { withTimezone: true }).defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_gadgets_active").on(table.isActive),
    index("idx_gadgets_category").on(table.categoryId),
  ]
);

export const gadgetsRelations = relations(gadgets, ({ one }) => ({
  category: one(categories, {
    fields: [gadgets.categoryId],
    references: [categories.id],
  }),
}));

// ============================================
// SWIPE SESSIONS
// ============================================
export const swipeSessions = pgTable(
  "swipe_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    totalCards: integer("total_cards").notNull().default(20),
    startedAt: timestamp("started_at", { withTimezone: true }).defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => [index("idx_sessions_user").on(table.userId)]
);

export const swipeSessionsRelations = relations(
  swipeSessions,
  ({ many, one }) => ({
    swipes: many(swipes),
    result: one(sessionResults),
  })
);

// ============================================
// SWIPES
// ============================================
export const swipes = pgTable(
  "swipes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => swipeSessions.id, { onDelete: "cascade" }),
    gadgetId: uuid("gadget_id")
      .notNull()
      .references(() => gadgets.id, { onDelete: "cascade" }),
    direction: text("direction").notNull(),
    swipeDurationMs: integer("swipe_duration_ms"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    unique("swipes_session_gadget_unique").on(table.sessionId, table.userId, table.gadgetId),
    index("idx_swipes_user").on(table.userId),
    index("idx_swipes_session").on(table.sessionId),
    index("idx_swipes_gadget").on(table.gadgetId),
  ]
);

export const swipesRelations = relations(swipes, ({ one }) => ({
  session: one(swipeSessions, {
    fields: [swipes.sessionId],
    references: [swipeSessions.id],
  }),
  gadget: one(gadgets, {
    fields: [swipes.gadgetId],
    references: [gadgets.id],
  }),
}));

// ============================================
// SESSION RESULTS
// ============================================
export const sessionResults = pgTable(
  "session_results",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => swipeSessions.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull(),
    topGadgets: jsonb("top_gadgets").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("idx_results_user").on(table.userId)]
);

export const sessionResultsRelations = relations(sessionResults, ({ one }) => ({
  session: one(swipeSessions, {
    fields: [sessionResults.sessionId],
    references: [swipeSessions.id],
  }),
}));

// ============================================
// EVENTS
// ============================================
export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id"),
    sessionId: uuid("session_id"),
    gadgetId: uuid("gadget_id"),
    name: text("name").notNull(),
    props: jsonb("props").default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_events_name").on(table.name, table.createdAt),
    index("idx_events_user").on(table.userId, table.createdAt),
  ]
);
