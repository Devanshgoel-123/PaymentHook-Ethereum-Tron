import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const MonitoringSessions=pgTable("monitoring_sessions", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    address: varchar({ length: 255 }).notNull(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
    status: varchar({ length: 255 }).notNull().default("pending"),
    amount:varchar({ length: 255 }).notNull(),
    token:varchar({ length: 255 }).notNull(),
    txHash:varchar({ length: 255 }).default(""),
    txConfirmations:integer().notNull().default(0),
    txConfirmationsRequired:integer().notNull().default(0),
    chainId:integer().notNull(),
  });
  