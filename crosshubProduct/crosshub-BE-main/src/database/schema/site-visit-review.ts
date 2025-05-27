import {
  bigint,
  bigserial,
  foreignKey,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { SiteVisit } from './site-visit';
import { relations } from 'drizzle-orm';

export const SiteVisitReview = pgTable(
  'site_visit_review',
  {
    id: bigserial({ mode: 'bigint' }).primaryKey().notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    visitId: bigint('visit_id', { mode: 'bigint' }).notNull(),
    content: text().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      uniqueReviewVisit: uniqueIndex('unique_review_visit').using(
        'btree',
        table.visitId.asc().nullsLast(),
      ),
      siteVisitReviewVisitIdFkey: foreignKey({
        columns: [table.visitId],
        foreignColumns: [SiteVisit.id],
        name: 'site_visit_review_visit_id_fkey',
      })
        .onUpdate('restrict')
        .onDelete('restrict'),
    };
  },
);
export const siteVisitReviewRelations = relations(
  SiteVisitReview,
  ({ one }) => ({
    siteVisit: one(SiteVisit, {
      fields: [SiteVisitReview.visitId],
      references: [SiteVisit.id],
    }),
  }),
);
