import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/current-user.decorator';
import {
  ApproveUserDto,
  QueryUserDto,
  RejectUserDto,
  UserVerificationDocumetDetailDto,
} from './admin.user.dto';

@ApiTags('회원 관리')
@Controller('user')
export class AdminUserController {
  constructor(private readonly userService: UserService) {}

  @Get('')
  @ApiOperation({ summary: '회원 목록 조회' })
  async listUsers(@Query() q: QueryUserDto) {
    return this.userService.listUsers(q.data.status);
  }

  @Get(':documentId')
  @ApiOperation({ summary: '회원 상세 조회' })
  async getUser(@Param() param: UserVerificationDocumetDetailDto) {
    return this.userService.getUserVerificationDocument(param.data.documentId);
  }

  @Post('argos-id-liveness')
  @ApiOperation({ summary: '회원 Argos ID Liveness' })
  async getArgosIdLiveness(@Body() body: UserVerificationDocumetDetailDto) {
    return await this.userService.argosProcessPipeline(body.data.documentId);
  }

  @Post('approve')
  @ApiOperation({ summary: '회원 승인' })
  async approveUser(
    @CurrentUser() adminId: number,
    @Body() body: ApproveUserDto,
  ) {
    return await this.userService.approveUser(body.data.documentId, adminId);
  }

  @Patch('reject')
  @ApiOperation({ summary: '회원 거부' })
  async rejectUser(@Body() body: RejectUserDto) {
    return this.userService.declineUser(body.data.documentId, body.data.reason);
  }

  @Delete('delete')
  @ApiOperation({ summary: '회원 삭제' })
  async deleteUser(@Body() body: UserVerificationDocumetDetailDto) {
    return this.userService.deleteUser(body.data.documentId);
  }
}
