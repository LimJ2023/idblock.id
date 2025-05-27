import {
  bigint,
  bigserial,
  foreignKey,
  integer,
  numeric,
  pgTable,
  smallint,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { User } from './user';

export const UserVerificationDocument = pgTable(
  'user_verification_document',
  {
    id: bigserial({ mode: 'bigint' }).primaryKey().notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    userId: bigint('user_id', { mode: 'bigint' }).notNull(),
    passportImageKey: text('passport_image_key').notNull(),
    profileImageKey: text('profile_image_key').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    approvalStatus: smallint('approval_status').default(0).notNull(),
    rejectReason: text('reject_reason'),
    screenReplay: integer('screen_replay'),
    paperPrinted: integer('paper_printed'),
    replacePortraits: integer('replace_portraits'),
    faceLiveness: integer('face_liveness'),
    matchSimilarity: numeric('match_similarity'),
    matchConfidence: numeric('match_confidence'),
  },
  (table) => {
    return {
      userVerificationDocumentUserIdFkey: foreignKey({
        columns: [table.userId],
        foreignColumns: [User.id],
        name: 'user_verification_document_user_id_fkey',
      })
        .onUpdate('restrict')
        .onDelete('restrict'),
    };
  },
);
