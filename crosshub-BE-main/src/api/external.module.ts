import { Global, Module } from "@nestjs/common";
import { ExternalController } from "./external.controller";
import { ExternalApiKeyService } from "src/api/api-key.service";
import { GcsModule } from "src/gcp/gcs.module";
import { DatabaseModule } from "src/database/database.module";




@Global()
@Module({
    imports: [GcsModule, DatabaseModule],
    controllers: [ExternalController],
    providers: [ExternalApiKeyService],
    exports: [ExternalApiKeyService],
})
export class ExternalModule {}