import {
  bigint,
  foreignKey,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { SiteManager } from './site-manager';

export const SiteManagerSession = pgTable(
  'site_manager_session',
  {
    id: serial().primaryKey().notNull(),
    siteManagerId: bigint('site_manager_id', { mode: 'bigint' }).notNull(),
    refreshToken: text('refresh_token').notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      uniqueSiteManagerIdSession: uniqueIndex(
        'unique_site_manager_id_session',
      ).using('btree', table.siteManagerId.asc().nullsLast()),
      siteManagerSessionSiteManagerIdFkey: foreignKey({
        columns: [table.siteManagerId],
        foreignColumns: [SiteManager.id],
        name: 'site_manager_session_site_manager_id_fkey',
      })
        .onUpdate('restrict')
        .onDelete('cascade'),
    };
  },
);
