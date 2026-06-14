import { pgTable, text, timestamp, uuid, boolean, decimal } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  passwordHash: text("password_hash"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const switchAccounts = pgTable("switch_accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email"),
  iconColor: text("icon_color").notNull().default("#E60012"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const games = pgTable("games", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  switchAccountId: uuid("switch_account_id").references(() => switchAccounts.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  coverUrl: text("cover_url"),
  genre: text("genre"),
  developer: text("developer"),
  releaseDate: text("release_date"),
  format: text("format").notNull().default("physical"), // "physical" | "digital"
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }),
  purchaseDate: timestamp("purchase_date"),
  notes: text("notes"),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const gamesRelations = relations(games, ({ one }) => ({
  switchAccount: one(switchAccounts, {
    fields: [games.switchAccountId],
    references: [switchAccounts.id],
  }),
}))

export const switchAccountsRelations = relations(switchAccounts, ({ many }) => ({
  games: many(games),
}))

export type User = typeof users.$inferSelect
export type SwitchAccount = typeof switchAccounts.$inferSelect
export type Game = typeof games.$inferSelect
export type NewGame = typeof games.$inferInsert
export type NewSwitchAccount = typeof switchAccounts.$inferInsert
