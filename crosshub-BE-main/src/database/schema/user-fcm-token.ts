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

export const UserFcmToken = pgTable(
  'user_fcm_token',
  {
    id: bigserial({ mode: 'bigint' }).primaryKey().notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    userId: bigint('user_id', { mode: 'bigint' }).notNull(),
    fcmToken: text('fcm_token').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      uniqueTokenUser: uniqueIndex('unique_token_user').using(
        'btree',
        table.userId.asc().nullsLast(),
      ),
      userFcmTokenUserIdFkey: foreignKey({
        columns: [table.userId],
        foreignColumns: [User.id],
        name: 'user_fcm_token_user_id_fkey',
      })
        .onUpdate('restrict')
        .onDelete('cascade'),
    };
  },
);
