import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SiteService } from './site.service';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { CreateReviewDto, CreateVisitSiteDto } from './site.dto';

@ApiTags('유저 관광지')
@Controller('site')
export class PublicSiteController {
  constructor(private readonly siteService: SiteService) {}

  @Get('all')
  @ApiOperation({ summary: '전체 관광지 조회' })
  @ApiBearerAuth()
  async listSites() {
    return this.siteService.listSites();
  }

  @Get('visit-history')
  @ApiBearerAuth()
  @ApiOperation({ summary: '방문 기록 조회' })
  async listVisitHistory(@CurrentUser() userId: bigint) {
    return this.siteService.listVisitHistory(userId);
  }

  @Put('review/:visitId')
  @ApiOperation({ summary: '리뷰 작성 및 수정' })
  @ApiBearerAuth()
  async createReview(
    @CurrentUser() userId: bigint,
    @Body() body: CreateReviewDto,
    @Param('visitId') visitId: bigint,
  ) {
    return this.siteService.createReview(visitId, body.data.content);
  }
}
