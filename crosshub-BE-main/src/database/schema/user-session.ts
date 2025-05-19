import {
  bigint,
  bigserial,
  foreignKey,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { User } from './user';

export const UserSession = pgTable(
  'user_session',
  {
    id: bigserial({ mode: 'bigint' }).primaryKey().notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    userId: bigint('user_id', { mode: 'bigint' }).notNull(),
    refreshToken: text('refresh_token').notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      uniqueUserIdSession: uniqueIndex('unique_user_id_session').using(
        'btree',
        table.userId.asc().nullsLast(),
      ),
      userSessionUserIdFkey: foreignKey({
        columns: [table.userId],
        foreignColumns: [User.id],
        name: 'user_session_user_id_fkey',
      })
        .onUpdate('restrict')
        .onDelete('cascade'),
    };
  },
);
