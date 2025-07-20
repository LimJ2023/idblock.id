import {
  bigserial,
  pgTable,
  text,
  timestamp,
  jsonb,
  boolean,
  index,
} from 'drizzle-orm/pg-core';

// DID Document 저장 테이블
export const DidDocument = pgTable(
  'did_document',
  {
    id: bigserial({ mode: 'bigint' }).primaryKey().notNull(),
    did: text().unique().notNull(), // did:idblock:identifier
    document: jsonb().notNull(), // DID Document JSON
    metadata: jsonb(), // 추가 메타데이터
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    isActive: boolean('is_active').default(true).notNull(),
  },
  (table) => {
    return {
      didIdx: index('idx_did_document_did').on(table.did),
      createdAtIdx: index('idx_did_document_created_at').on(table.createdAt),
    };
  },
);

// Verifiable Credential 저장 테이블
export const VerifiableCredential = pgTable(
  'verifiable_credential',
  {
    id: bigserial({ mode: 'bigint' }).primaryKey().notNull(),
    credentialId: text('credential_id').unique().notNull(), // VC의 고유 ID
    issuerDid: text('issuer_did').notNull(), // 발행자 DID
    subjectDid: text('subject_did').notNull(), // 주체 DID
    credentialType: text('credential_type').notNull(), // VC 타입
    credential: jsonb().notNull(), // VC JSON
    issuanceDate: timestamp('issuance_date', { withTimezone: true, mode: 'string' })
      .notNull(),
    expirationDate: timestamp('expiration_date', { withTimezone: true, mode: 'string' }),
    isRevoked: boolean('is_revoked').default(false).notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true, mode: 'string' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      issuerDidIdx: index('idx_vc_issuer_did').on(table.issuerDid),
      subjectDidIdx: index('idx_vc_subject_did').on(table.subjectDid),
      credentialTypeIdx: index('idx_vc_credential_type').on(table.credentialType),
      issuanceDateIdx: index('idx_vc_issuance_date').on(table.issuanceDate),
    };
  },
);

// DID 해결 캐시 테이블 (성능 최적화용)
export const DidResolutionCache = pgTable(
  'did_resolution_cache',
  {
    id: bigserial({ mode: 'bigint' }).primaryKey().notNull(),
    did: text().unique().notNull(),
    resolutionResult: jsonb('resolution_result').notNull(),
    cachedAt: timestamp('cached_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'string' })
      .notNull(),
  },
  (table) => {
    return {
      didIdx: index('idx_did_cache_did').on(table.did),
      expiresAtIdx: index('idx_did_cache_expires_at').on(table.expiresAt),
    };
  },
); 