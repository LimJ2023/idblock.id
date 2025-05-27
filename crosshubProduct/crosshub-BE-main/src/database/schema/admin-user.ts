import { pgTable, serial, text, uniqueIndex } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-valibot';

export const AdminUser = pgTable(
  'admin_user',
  {
    id: serial().primaryKey().notNull(),
    email: text().notNull(),
    password: text().notNull(),
    name: text().notNull(),
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
