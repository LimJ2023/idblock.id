import { boolean, pgTable, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-valibot';

export const externalAPIKey = pgTable(
    'external_api_key',
    {
        id: serial().primaryKey().notNull(),
        key: text().unique(),
        appName: text(),
        createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
        .defaultNow()
        .notNull(),
        isActive: boolean()
    },
    (table) => {
        return {
            externalAPIKey: uniqueIndex('external_api_key').using('btree', table.key.asc().nullsLast()),
        }
    }
)

    export const insertExternalAPIKeySchema = createInsertSchema(externalAPIKey);