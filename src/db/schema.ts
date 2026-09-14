import {
  pgTable,
  serial,
  varchar,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),

  name: varchar("name", {
    length: 255,
  }).notNull(),

  email: varchar("email", {
    length: 255,
  }).notNull().unique(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),

  name: varchar("name", {
    length: 255,
  }).notNull(),

  ownerId: integer("owner_id")
    .notNull()
    .references(() => users.id),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),

  title: varchar("title", {
    length: 255,
  }).notNull(),

  description: varchar("description", {
    length: 1000,
  }),

  priority: integer("priority")
    .notNull()
    .default(0),

  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
});