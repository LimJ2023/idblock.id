import {
  bigint,
  bigserial,
  foreignKey,
  pgTable,
  smallint,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { User } from './user';

export const Notification = pgTable(
  'notification',
  {
    id: bigserial({ mode: 'bigint' }).primaryKey().notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    userId: bigint('user_id', { mode: 'bigint' }).notNull(),
    type: smallint().default(0).notNull(),
    title: text().notNull(),
    content: text().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      notificationUserIdFkey: foreignKey({
        columns: [table.userId],
        foreignColumns: [User.id],
        name: 'notification_user_id_fkey',
      })
        .onUpdate('restrict')
        .onDelete('cascade'),
    };
  },
);
