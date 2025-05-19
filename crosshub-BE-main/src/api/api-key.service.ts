import { Inject, Injectable } from "@nestjs/common";
import { INJECT_DRIZZLE } from "src/database/drizzle.provider";
import { DrizzleDB } from "src/database/drizzle.provider";
import { eq } from "drizzle-orm";
import  crypto  from "crypto";
import { externalAPIKey } from "src/database/schema/externalAPI-key";

@Injectable()
export class ExternalApiKeyService {

    constructor(
        @Inject(INJECT_DRIZZLE) private db: DrizzleDB,
    ) {}

    async createApiKey(data: typeof externalAPIKey.$inferInsert) {
        const key = crypto.randomBytes(32).toString('hex');
        const apiKey = await this.db.insert(externalAPIKey).values({
            ...data,
            key,
        }).returning();
        return apiKey;
    }

    async getAllApiKeys() {
        const apiKeys=await this.db.query.externalAPIKey.findMany();
        return apiKeys;
    }

    async getApiKey(key: string) {
        const apiKey = await this.db.query.externalAPIKey.findFirst({
            where: eq(externalAPIKey.key, key),
        });
        return apiKey;
    }

    async deleteApiKey(key: string) {
        const apiKey = await this.db.delete(externalAPIKey).where(eq(externalAPIKey.key, key));
        return apiKey;
    }

    async validateApiKey(key: string) {
        const apiKey = await this.db.query.externalAPIKey.findFirst({
            where: eq(externalAPIKey.key, key),
        })
        if (!apiKey) return false;
        return true;
    }
} 