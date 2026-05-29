import { pgTable, text, serial, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const keysTable = pgTable("keys", {
  id: serial("id").primaryKey(),
  keyValue: text("key_value").notNull().unique(),
  duration: text("duration").notNull(),
  expiresAt: timestamp("expires_at"),
  active: boolean("active").notNull().default(true),
  note: text("note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertKeySchema = createInsertSchema(keysTable).omit({ id: true, createdAt: true });
export type InsertKey = z.infer<typeof insertKeySchema>;
export type Key = typeof keysTable.$inferSelect;
