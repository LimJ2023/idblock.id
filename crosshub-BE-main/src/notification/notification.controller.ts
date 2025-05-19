import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { NotificationService } from './notification.service';
import { FcmTokenUpdateDto } from './notification.dto';

@Controller('notification')
@ApiTags('알림')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: '알림 목록 조회' })
  @ApiBearerAuth()
  async getNotification(@CurrentUser() userId: bigint) {
    return this.notificationService.listNotifications(userId);
  }

  @Post('fcm')
  @ApiOperation({ summary: 'FCM token 전송' })
  @ApiBearerAuth()
  async sendFcmToken(
    @CurrentUser() userId: bigint,
    @Body() body: FcmTokenUpdateDto,
  ) {
    return this.notificationService.sendFcmToken(userId, body.data.fcmToken);
  }

  @Post('test')
  @ApiOperation({ summary: 'Test 알림 전송' })
  @ApiBearerAuth()
  async testEcho(@CurrentUser() userId: bigint) {
    return this.notificationService.sendNotification({
      userId,
      type: Math.random() > 0.5 ? 0 : 1,
      title: 'test',
      content: 'test',
    });
  }
}
