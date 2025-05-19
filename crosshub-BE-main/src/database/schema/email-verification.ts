import {
  bigserial,
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

export const EmailVerification = pgTable('email_verification', {
  id: bigserial({ mode: 'bigint' }).primaryKey().notNull(),
  email: text().notNull(),
  uuid: uuid().defaultRandom().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull(),
  code: text().notNull(),
  isVerified: boolean('is_verified').default(false).notNull(),
});
