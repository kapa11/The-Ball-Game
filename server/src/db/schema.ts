import {
  pgSchema,
  pgTable,
  pgEnum,
  uuid,
  varchar,
  integer,
  timestamp,
  uniqueIndex,
  check,
  index,
} from "drizzle-orm/pg-core";

import { sql } from "drizzle-orm";
// Match status
export const matchStatusEnum = pgEnum("match_status", [
  "WAITING",
  "PLAYING",
  "COMPLETED",
  "ABANDONED",
]);

const authSchema = pgSchema("neon_auth");

const authUser = authSchema.table("user", {
  id: uuid("id").primaryKey(),
});

// Team
export const teamEnum = pgEnum("team", ["RED", "BLUE"]);

// Players table
export const players = pgTable(
  "players",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .unique()
      .references(() => authUser.id, { onDelete: "cascade" }),

    username: varchar("username", { length: 24 }).notNull(),

    displayName: varchar("display_name", { length: 32 }).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("players_username_lower_idx").on(
      sql`lower(${table.username})`,
    ),
  ],
);

// Matches table
export const matches = pgTable(
  "matches",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    status: matchStatusEnum("status").default("WAITING").notNull(),

    redScore: integer("red_score").default(0).notNull(),

    blueScore: integer("blue_score").default(0).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    startedAt: timestamp("started_at", { withTimezone: true }),

    endedAt: timestamp("ended_at", { withTimezone: true }),
  },
  (table) => [
    // Scores cannot be negative
    check("matches_red_score_check", sql`${table.redScore} >= 0`),
    check("matches_blue_score_check", sql`${table.blueScore} >= 0`),

    // A playing match must have started
    check(
      "matches_playing_started_check",
      sql`${table.status} <> 'PLAYING' OR ${table.startedAt} IS NOT NULL`,
    ),

    // Completed or abandoned matches must have ended
    check(
      "matches_terminal_ended_check",
      sql`${table.status} NOT IN ('COMPLETED', 'ABANDONED') OR ${table.endedAt} IS NOT NULL`,
    ),

    // End time cannot precede start time
    check(
      "matches_timestamp_order_check",
      sql`${table.startedAt} IS NULL OR ${table.endedAt} IS NULL OR ${table.endedAt} >= ${table.startedAt}`,
    ),

    // Indexes
    index("matches_created_at_idx").on(table.createdAt),
    index("matches_status_created_at_idx").on(
      table.status,
      table.createdAt,
    ),
  ],
);

// Match participants
export const matchPlayers = pgTable(
  "match_players",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    matchId: uuid("match_id")
      .notNull()
      .references(() => matches.id, { onDelete: "cascade" }),

    playerId: uuid("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),

    team: teamEnum("team").notNull(),

    joinedAt: timestamp("joined_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    leftAt: timestamp("left_at", { withTimezone: true }),
  },
    (table) => [
    uniqueIndex("match_players_match_player_idx").on(
      table.matchId,
      table.playerId,
    ),

    index("match_players_player_joined_idx").on(
      table.playerId,
      table.joinedAt,
    ),
  ],
);