import { pgTable, text } from 'drizzle-orm/pg-core';

export const Country = pgTable('country', {
  name: text().notNull(),
  code: text().primaryKey().notNull(),
});
