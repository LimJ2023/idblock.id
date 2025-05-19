import {
  bigint,
  bigserial,
  foreignKey,
  pgTable,
  text,
} from 'drizzle-orm/pg-core';
import { Site } from './site';
import { createInsertSchema } from 'drizzle-valibot';

export const SiteManager = pgTable(
  'site_manager',
  {
    id: bigserial({ mode: 'bigint' }).primaryKey().notNull(),
    email: text().notNull(),
    password: text().notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    siteId: bigint('site_id', { mode: 'bigint' }).notNull(),
  },
  (table) => {
    return {
      siteManagerSiteIdFkey: foreignKey({
        columns: [table.siteId],
        foreignColumns: [Site.id],
        name: 'site_manager_site_id_fkey',
      }).onDelete('cascade'),
    };
  },
);

export const insertSiteManagerSchema = createInsertSchema(SiteManager);
