import { Body, Controller, Get, Post, UploadedFile, UseInterceptors, UseGuards, Delete, Header } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {  ApiBody, ApiConsumes, ApiOperation, ApiTags, ApiHeader } from "@nestjs/swagger";
import { ApiKeyGuard } from "src/api/api-key.guard";
import { GcsService } from "src/gcp/gcs.service";
import { FileUploadDto } from "src/s3/s3.dto";
import { CreateApiKeyDto, DeleteApiKeyDto } from "./api-key.dto";
import { ExternalApiKeyService } from "./api-key.service";
import { Public } from "src/auth/auth.guard";


@Controller('external')
@ApiTags('외부 API')
export class ExternalController {

    constructor(
        private readonly gcsService: GcsService,
        private readonly apiKeyService: ExternalApiKeyService
    ) {}

    @Public()
    @Get('test')
    @ApiOperation({ summary: `외부 api 테스트`})
    @UseGuards(ApiKeyGuard)
    @ApiHeader({
        name: 'x-api-key',
        description: 'API 키',
        required: true
    })
    async test(@Body() body: {message: string}) {
        
        return body.message;
    }

    @Public()
    @Post('upload/passport-image')
    @ApiOperation({ summary: '외부 api 여권 업로드' })
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
      description: '파일 업로드',
      type: FileUploadDto,
    })
    async uploadPassport(@UploadedFile() file: Express.Multer.File) {
      return this.gcsService.uploadPrivateFile(file, 'private/passport/');
    }

    // api key 발급
    @Public()
    @Post('api-key')
    @ApiOperation({ summary: `api key 발급`})
    async createApiKey(@Body() body: CreateApiKeyDto) {
      return this.apiKeyService.createApiKey(body.data);
    }

    // api key 조회
    @Public()
    @Get('api-key')
    @ApiOperation({ summary: `모든 api key 조회`})
    async getApiKey() {
      return this.apiKeyService.getAllApiKeys();
    }
  
    // api key 삭제
    @Public()
    @Delete('api-key')
    @ApiOperation({ summary: `api key 삭제`})
    async deleteApiKey(@Body() body: DeleteApiKeyDto) {
      return this.apiKeyService.deleteApiKey(body.data.key);
    }
    
}
