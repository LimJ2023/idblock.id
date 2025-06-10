import { pgTable, serial, text, uniqueIndex, integer } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-valibot';

export enum AdminPermission {
  ROOT = 1,     // 루트 관리자
  MIDDLE = 2,   // 중간 관리자
  GENERAL = 3   // 일반 관리자
}

export const AdminUser = pgTable(
  'admin_user',
  {
    id: serial().primaryKey().notNull(),
    email: text().notNull(),
    password: text().notNull(),
    name: text().notNull(),
    permission: integer().notNull().default(AdminPermission.GENERAL), // 기본값은 일반 관리자
  },
  (table) => {
    return {
      uniqueEmail: uniqueIndex('unique_email').using(
        'btree',
        table.email.asc().nullsLast(),
      ),
    };
  },
);

export const insertAdminUserSchema = createInsertSchema(AdminUser);
