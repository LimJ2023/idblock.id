import { foreignKey, index, pgTable, text } from 'drizzle-orm/pg-core';
import { Country } from './country';

export const City = pgTable(
  'city',
  {
    id: text().primaryKey().notNull(),
    name: text(),
    asciiName: text('ASCII_name'),
    alternateNames: text('alternate_names'),
    latitude: text(),
    longitude: text(),
    featureClass: text('feature_class'),
    featureCode: text('feature_code'),
    countryCode2: text('country_code_2'),
    admin1Code: text('admin1_code'),
    admin2Code: text('admin2_code'),
    admin3Code: text('admin3_code'),
    admin4Code: text('admin4_code'),
    population: text(),
    elevation: text(),
    digitalElevationModel: text('digital_elevation_model'),
    timezone: text(),
    modificationDate: text('modification_date'),
    country: text(),
    coordinates: text(),
    countryCode: text('country_code'),
  },
  (table) => {
    return {
      countryCodeGroup: index('country_code_group').using(
        'btree',
        table.countryCode.asc().nullsLast(),
      ),
      fkEbd8Be319E2628736B4Bfeb82Ca: foreignKey({
        columns: [table.countryCode],
        foreignColumns: [Country.code],
        name: 'FK_ebd8be319e2628736b4bfeb82ca',
      })
        .onUpdate('cascade')
        .onDelete('cascade'),
    };
  },
);
