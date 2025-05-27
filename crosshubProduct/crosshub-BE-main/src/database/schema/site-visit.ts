import {
  bigint,
  bigserial,
  foreignKey,
  pgTable,
  timestamp,
} from 'drizzle-orm/pg-core';
import { User } from './user';
import { Site } from './site';
import { relations } from 'drizzle-orm';
import { SiteVisitReview } from './site-visit-review';

export const SiteVisit = pgTable(
  'site_visit',
  {
    id: bigserial({ mode: 'bigint' }).primaryKey().notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    userId: bigint('user_id', { mode: 'bigint' }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    siteId: bigint('site_id', { mode: 'bigint' }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      siteVisitUserIdFkey: foreignKey({
        columns: [table.userId],
        foreignColumns: [User.id],
        name: 'site_visit_user_id_fkey',
      })
        .onUpdate('restrict')
        .onDelete('restrict'),
      siteVisitSiteIdFkey: foreignKey({
        columns: [table.siteId],
        foreignColumns: [Site.id],
        name: 'site_visit_site_id_fkey',
      })
        .onUpdate('restrict')
        .onDelete('restrict'),
    };
  },
);

export const siteVisitRelations = relations(SiteVisit, ({ one, many }) => ({
  user: one(User, {
    fields: [SiteVisit.userId],
    references: [User.id],
  }),
  site: one(Site, {
    fields: [SiteVisit.siteId],
    references: [Site.id],
  }),
  siteVisitReviews: one(SiteVisitReview),
}));
