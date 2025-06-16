import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";

// Users table
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(() => new Date()),
});

// Habits table
export const habits = sqliteTable("habits", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  importance: integer("importance").notNull().default(5), // 1-10 scale, 10 being most important
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(() => new Date()),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
});

// Habit entries table (for tracking daily completions)
export const habitEntries = sqliteTable("habit_entries", {
  id: text("id").primaryKey(),
  habitId: text("habit_id").notNull().references(() => habits.id, { onDelete: "cascade" }),
  date: text("date").notNull(), // Format: YYYY-MM-DD
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(() => new Date()),
}, (table) => {
  return {
    habitDateIdx: primaryKey({ columns: [table.habitId, table.date] }),
  };
}); 