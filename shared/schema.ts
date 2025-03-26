import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Website pages stored in our index
export const webpages = pgTable("webpages", {
  id: serial("id").primaryKey(),
  url: text("url").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content").notNull(),
  lastIndexed: timestamp("last_indexed").defaultNow(),
});

export const insertWebpageSchema = createInsertSchema(webpages).omit({
  id: true,
  lastIndexed: true,
});

// Search queries for analytics
export const searchQueries = pgTable("search_queries", {
  id: serial("id").primaryKey(),
  query: text("query").notNull(),
  resultsCount: integer("results_count").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertSearchQuerySchema = createInsertSchema(searchQueries).omit({
  id: true,
  timestamp: true,
});

// Search schema for validating search input
export const searchSchema = z.object({
  query: z.string().min(1).max(100),
  page: z.number().int().positive().default(1),
});

export type Webpage = typeof webpages.$inferSelect;
export type InsertWebpage = z.infer<typeof insertWebpageSchema>;
export type SearchQuery = typeof searchQueries.$inferSelect;
export type InsertSearchQuery = z.infer<typeof insertSearchQuerySchema>;
export type SearchParams = z.infer<typeof searchSchema>;

// Search result interface
export interface SearchResult {
  id: number;
  url: string;
  title: string;
  description: string;
  snippet: string;
  relevanceScore: number;
}
