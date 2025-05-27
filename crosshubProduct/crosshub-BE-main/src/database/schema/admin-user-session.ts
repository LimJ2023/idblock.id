import {
  bigserial,
  foreignKey,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { AdminUser } from './admin-user';

export const AdminUserSession = pgTable(
  'admin_user_session',
  {
    id: bigserial({ mode: 'bigint' }).primaryKey().notNull(),
    adminUserId: serial('admin_user_id').notNull(),
    refreshToken: text('refresh_token').notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      uniqueAdminUserIdSesion: uniqueIndex('unique_admin_user_id_sesion').using(
        'btree',
        table.adminUserId.asc().nullsLast(),
      ),
      adminUserSessionAdminUserIdFkey: foreignKey({
        columns: [table.adminUserId],
        foreignColumns: [AdminUser.id],
        name: 'admin_user_session_admin_user_id_fkey',
      })
        .onUpdate('restrict')
        .onDelete('cascade'),
    };
  },
);
