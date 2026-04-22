import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  uuid,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// better-auth tables (user / session / account / verification / passkey)
// Shape matches @better-auth/passkey conventions — do not rename columns.
// ---------------------------------------------------------------------------

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (t) => [index("session_userId_idx").on(t.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [index("account_userId_idx").on(t.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)],
);

export const passkey = pgTable(
  "passkey",
  {
    id: text("id").primaryKey(),
    name: text("name"),
    publicKey: text("public_key").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    credentialID: text("credential_id").notNull(),
    counter: integer("counter").notNull(),
    deviceType: text("device_type").notNull(),
    backedUp: boolean("backed_up").notNull(),
    transports: text("transports"),
    createdAt: timestamp("created_at"),
    aaguid: text("aaguid"),
  },
  (t) => [
    index("passkey_userId_idx").on(t.userId),
    index("passkey_credentialID_idx").on(t.credentialID),
  ],
);

// ---------------------------------------------------------------------------
// Bike tours — group rides with per-slot capacity, per-booking rider count.
// ---------------------------------------------------------------------------

// A scheduled group ride. Hand-seeded via scripts/seed-rides.ts.
export const rideSlot = pgTable("ride_slot", {
  id: uuid("id").primaryKey().defaultRandom(),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  title: text("title").notNull(), // e.g. "Saturday Morning — North Shore Loop"
  startLocation: text("start_location").notNull(), // e.g. "Boston Common, Charles St gate"
  routeName: text("route_name"), // e.g. "North Shore via 1A → Swampscott"
  distanceKm: integer("distance_km"),
  elevationGainM: integer("elevation_gain_m"),
  pace: text("pace", { enum: ["casual", "moderate", "fast"] })
    .notNull()
    .default("moderate"),
  capacity: integer("capacity").notNull().default(6),
  seatsBooked: integer("seats_booked").notNull().default(0),
  // `open` = bookable if seats remain; `canceled` = ride called off.
  // A slot with seats_booked === capacity is full but still `open`-status —
  // the UI derives "full" from seats remaining, not from this column.
  status: text("status", { enum: ["open", "canceled"] })
    .notNull()
    .default("open"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// A user's booking on a ride_slot. riderCount is how many seats they consume.
export const rideBooking = pgTable(
  "ride_booking",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slotId: uuid("slot_id")
      .notNull()
      .references(() => rideSlot.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    riderCount: integer("rider_count").notNull().default(1),
    notes: text("notes"),
    // Rider opted in to the food & beverage add-on at the meet point.
    foodBeverage: boolean("food_beverage").notNull().default(false),
    // pending → admin reviews → accepted. Cancels (user or admin) delete the row
    // and decrement rideSlot.seatsBooked in the same transaction.
    status: text("status", { enum: ["pending", "accepted"] })
      .notNull()
      .default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("ride_booking_slot_idx").on(t.slotId),
    index("ride_booking_user_idx").on(t.userId),
    // One booking per user per slot. Re-booking requires canceling first.
    uniqueIndex("ride_booking_slot_user_uniq").on(t.slotId, t.userId),
  ],
);

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  passkeys: many(passkey),
  rideBookings: many(rideBooking),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const passkeyRelations = relations(passkey, ({ one }) => ({
  user: one(user, { fields: [passkey.userId], references: [user.id] }),
}));

export const rideSlotRelations = relations(rideSlot, ({ many }) => ({
  bookings: many(rideBooking),
}));

export const rideBookingRelations = relations(rideBooking, ({ one }) => ({
  slot: one(rideSlot, {
    fields: [rideBooking.slotId],
    references: [rideSlot.id],
  }),
  user: one(user, {
    fields: [rideBooking.userId],
    references: [user.id],
  }),
}));

export type RideSlot = typeof rideSlot.$inferSelect;
export type RideBooking = typeof rideBooking.$inferSelect;
