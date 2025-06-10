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
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SiteService } from './site.service';
import { CreateSiteDto, UpdateSiteDto } from './site.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadDto } from 'src/s3/s3.dto';
import { S3Service } from 'src/s3/s3.service';
import { ManagerAuthService } from 'src/manager-auth/manager-auth.service';
import { AdminPermissionGuard } from 'src/auth/admin-permission.guard';
import { RequireAdminPermission } from 'src/auth/admin-permission.decorator';
import { AdminPermission } from 'src/database/schema/admin-user';

@ApiTags('Admin 관광지')
@Controller('site')
@ApiBearerAuth()
@UseGuards(AdminPermissionGuard)
export class AdminSiteController {
  constructor(
    private readonly siteService: SiteService,
    private readonly s3Service: S3Service,
    private readonly managerAuthService: ManagerAuthService,
  ) {}

  @Get('')
  @ApiOperation({ 
    summary: '관광지 목록 조회',
    description: '모든 관광지의 목록을 조회합니다. (일반 관리자 이상 접근 가능)'
  })
  @RequireAdminPermission(AdminPermission.GENERAL)
  async listSites() {
    return this.siteService.listSites();
  }

  @Get(':id')
  @ApiOperation({ 
    summary: '관광지 상세 조회',
    description: '특정 관광지의 상세 정보를 조회합니다. (일반 관리자 이상 접근 가능)'
  })
  @RequireAdminPermission(AdminPermission.GENERAL)
  async findOneSite(@Param('id') id: bigint) {
    return this.siteService.findOneSite(id);
  }

  @Post('')
  @ApiOperation({ 
    summary: '관광지 생성',
    description: '새로운 관광지를 생성합니다. (중간 관리자 이상 접근 가능)'
  })
  @RequireAdminPermission(AdminPermission.MIDDLE)
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
  @ApiOperation({ 
    summary: '관광지 수정',
    description: '관광지 정보를 수정합니다. (중간 관리자 이상 접근 가능)'
  })
  @RequireAdminPermission(AdminPermission.MIDDLE)
  async updateSite(@Param('id') id: bigint, @Body() body: UpdateSiteDto) {
    return this.siteService.updateSite(id, body.data);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: '관광지 삭제',
    description: '관광지를 삭제합니다. (루트 관리자만 접근 가능)'
  })
  @RequireAdminPermission(AdminPermission.ROOT)
  async deleteSite(@Param('id') id: bigint) {
    return this.siteService.deleteSite(id);
  }

  @Post('thumbnail')
  @ApiOperation({ 
    summary: '관광지 썸네일 업로드',
    description: '관광지 썸네일을 업로드합니다. (중간 관리자 이상 접근 가능)'
  })
  @RequireAdminPermission(AdminPermission.MIDDLE)
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
