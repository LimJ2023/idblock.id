import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';

config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}
const client = postgres(connectionString);
const db = drizzle(client);

async function createExternalApiKeyTable() {
  try {
    // 테이블 생성
    await client`
      CREATE TABLE IF NOT EXISTS "external_api_key" (
        "id" serial PRIMARY KEY NOT NULL,
        "key" text,
        "appName" text,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "isActive" boolean,
        CONSTRAINT "external_api_key_key_unique" UNIQUE("key")
      )
    `;

    // 인덱스 생성
    await client`
      CREATE UNIQUE INDEX IF NOT EXISTS "external_api_key" ON "external_api_key" USING btree ("key")
    `;

    console.log('external_api_key 테이블이 성공적으로 생성되었습니다.');
  } catch (error) {
    console.error('테이블 생성 중 오류가 발생했습니다:', error);
  } finally {
    await client.end();
  }
}

createExternalApiKeyTable(); 