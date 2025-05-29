import {
  bigint,
  bigserial,
  foreignKey,
  integer,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { User } from './user';
import { AdminUser } from './admin-user';
import { UserVerificationDocument } from './user-verification-document';

export const UserApproval = pgTable(
  'user_approval',
  {
    id: bigserial({ mode: 'bigint' }).primaryKey().notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    userId: bigint('user_id', { mode: 'bigint' }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    documentId: bigint('document_id', { mode: 'bigint' }).notNull(),
    approvedAt: timestamp('approved_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    approvedBy: integer('approved_by').notNull(),
    txHash: text('tx_hash').default('0x').notNull(),
  },
  (table) => {
    return {
      userApprovalApprovedByFkey: foreignKey({
        columns: [table.approvedBy],
        foreignColumns: [AdminUser.id],
        name: 'user_approval_approved_by_fkey',
      })
        .onUpdate('restrict')
        .onDelete('restrict'),
      userApprovalUserIdFkey: foreignKey({
        columns: [table.userId],
        foreignColumns: [User.id],
        name: 'user_approval_user_id_fkey',
      })
        .onUpdate('restrict')
        .onDelete('restrict'),
      userApprovalDocumentIdFkey: foreignKey({
        columns: [table.documentId],
        foreignColumns: [UserVerificationDocument.id],
        name: 'user_approval_document_id_fkey',
      })
        .onUpdate('restrict')
        .onDelete('restrict'),
    };
  },
);

export const userApprovalRelations = relations(UserApproval, ({ one }) => ({
  user: one(User, {
    fields: [UserApproval.userId],
    references: [User.id],
  }),
  document: one(UserVerificationDocument, {
    fields: [UserApproval.documentId],
    references: [UserVerificationDocument.id],
  }),
  approvedBy: one(AdminUser, {
    fields: [UserApproval.approvedBy],
    references: [AdminUser.id],
  }),
}));
