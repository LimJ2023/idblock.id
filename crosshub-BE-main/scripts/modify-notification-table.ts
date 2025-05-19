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

async function modifyNotificationTable() {
    try {
        await client`
            ALTER TABLE "notification"
            ADD COLUMN "isRead" boolean NOT NULL DEFAULT false,
            ADD COLUMN "readAt" timestamp with time zone,
            ADD COLUMN "isDeleted" boolean NOT NULL DEFAULT false,
            ADD COLUMN "deletedAt" timestamp with time zone,
        `;
        console.log('Notification table modified successfully');
    } catch (error) {
        console.error('Error modifying notification table:', error);
        throw error;
    }
}

modifyNotificationTable();