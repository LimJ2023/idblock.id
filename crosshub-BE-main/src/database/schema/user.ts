import {
  bigint,
  bigserial,
  date,
  foreignKey,
  integer,
  pgEnum,
  pgTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { Country } from './country';
import { UserApproval } from './user-approval';
import { City } from './city';

export const User = pgTable(
  'user',
  {
    id: bigserial({ mode: 'bigint' }).primaryKey().notNull(),
    email: text().notNull(),
    password: text().notNull(),
    name: text().notNull(),
    countryCode: text('country_code').notNull(),
    birthday: date().notNull(),
    passportNumber: text('passport_number').notNull(),
    approvalId: bigint('approval_id', { mode: 'bigint' }),
    cityId: text('city_id').notNull(),
  },
  (table) => {
    return {
      uniqueUserEmail: uniqueIndex('unique_user_email').using(
        'btree',
        table.email.asc().nullsLast(),
      ),
      userCountryCodeFkey: foreignKey({
        columns: [table.countryCode],
        foreignColumns: [Country.code],
        name: 'user_country_code_fkey',
      })
        .onUpdate('restrict')
        .onDelete('restrict'),

      // userApprovalIdFkey: foreignKey({
      //   columns: [table.approvalId],
      //   foreignColumns: [UserApproval.id],
      //   name: 'user_approval_id_fkey',
      // })
      //   .onUpdate('restrict')
      //   .onDelete('restrict'),
      userCityIdFkey: foreignKey({
        columns: [table.cityId],
        foreignColumns: [City.id],
        name: 'user_city_id_fkey',
      })
        .onUpdate('restrict')
        .onDelete('restrict'),
    };
  },
);
