import { bigserial, pgTable, text } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-valibot';

export const Site = pgTable('site', {
  id: bigserial({ mode: 'bigint' }).primaryKey().notNull(),
  name: text().notNull(),
  imageKey: text('image_key').notNull(),
  address: text().notNull(),
  description: text().notNull(),
});
