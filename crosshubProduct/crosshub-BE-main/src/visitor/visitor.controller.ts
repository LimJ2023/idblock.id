import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { VisitorService } from './visitor.service';
import { CreateVisitSiteDto } from 'src/site/site.dto';

@ApiTags('방문객 조회')
@Controller('visitor')
export class VisitorController {
  constructor(private readonly visitorService: VisitorService) {}

  @Get()
  getVisitor(@CurrentUser() managerId: bigint) {
    return this.visitorService.getVisitor(managerId);
  }

  @Get(':userId')
  getVisitorById(@Param('userId') userId: bigint) {
    return this.visitorService.getVisitorById(userId);
  }

  @ApiOperation({ summary: '방문' })
  @ApiBearerAuth()
  @Post(':visitorId')
  async visitSite(
    @CurrentUser() managerId: bigint,
    @Param('visitorId') visitorId: bigint,
  ) {
    return this.visitorService.createVisit(visitorId, managerId);
  }
}
