import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SiteService } from './site.service';
import { CreateSiteDto, UpdateSiteDto } from './site.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadDto } from 'src/s3/s3.dto';
import { S3Service } from 'src/s3/s3.service';
import { ManagerAuthService } from 'src/manager-auth/manager-auth.service';

@ApiTags('Admin 관광지')
@Controller('site')
export class AdminSiteController {
  constructor(
    private readonly siteService: SiteService,
    private readonly s3Service: S3Service,
    private readonly managerAuthService: ManagerAuthService,
  ) {}

  @Get('')
  @ApiOperation({ summary: '관광지 목록 조회' })
  async listSites() {
    return this.siteService.listSites();
  }
  @Get(':id')
  @ApiOperation({ summary: '관광지 상세 조회' })
  async findOneSite(@Param('id') id: bigint) {
    return this.siteService.findOneSite(id);
  }

  @Post('')
  @ApiOperation({ summary: '관광지 생성' })
  async createSite(@Body() body: CreateSiteDto) {
    const [createdSite] = await this.siteService.createSite(body.data);
    await this.managerAuthService.createUser({
      email: body.data.email,
      password: body.data.password,
      siteId: createdSite.id,
    });

    return createdSite;
  }

  @Put(':id')
  @ApiOperation({ summary: '관광지 수정' })
  async updateSite(@Param('id') id: bigint, @Body() body: UpdateSiteDto) {
    return this.siteService.updateSite(id, body.data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '관광지 삭제' })
  async deleteSite(@Param('id') id: bigint) {
    return this.siteService.deleteSite(id);
  }

  @Post('thumbnail')
  @ApiOperation({ summary: '관광지 썸네일 업로드' })
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '파일 업로드',
    type: FileUploadDto,
  })
  async uploadSiteThumbnail(@UploadedFile() file: Express.Multer.File) {
    return this.s3Service.uploadFile(file, 'public/site/thumbnail/');
  }
}
