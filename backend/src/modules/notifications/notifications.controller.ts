import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { CurrentUserId } from '@modules/auth/decorators/current-user.decorator';
import { ListNotificationsQueryDto } from './dtos/list-notifications-query.dto';
import { RegisterPushTokenDto } from './dtos/register-push-token.dto';
import { SendTestPushDto } from './dtos/send-test-push.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List user notifications' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'isRead', required: false, type: Boolean })
  @ApiQuery({ name: 'type', required: false, type: String })
  async list(@CurrentUserId() userId: string, @Query() query: ListNotificationsQueryDto) {
    return this.notificationsService.listForUser(userId, query);
  }

  @Get('unread/count')
  @ApiOperation({ summary: 'Get unread notifications count' })
  @ApiResponse({
    status: 200,
    schema: { example: { total: 3 } },
  })
  async unreadCount(@CurrentUserId() userId: string) {
    return this.notificationsService.getUnreadCount(userId);
  }

  @Get('push-tokens')
  @ApiOperation({ summary: 'List active and inactive push tokens for current user' })
  async listPushTokens(@CurrentUserId() userId: string) {
    return this.notificationsService.listPushTokens(userId);
  }

  @Post('push-tokens')
  @ApiOperation({ summary: 'Register push token for current user' })
  async registerPushToken(
    @CurrentUserId() userId: string,
    @Body() registerPushTokenDto: RegisterPushTokenDto
  ) {
    return this.notificationsService.registerPushToken({
      userId,
      ...registerPushTokenDto,
    });
  }

  @Delete('push-tokens/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate one push token for current user' })
  async removePushToken(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.notificationsService.removePushToken(userId, id);
  }

  @Post('push-test')
  @ApiOperation({ summary: 'Send test push notification to current user' })
  async sendTestPush(@CurrentUserId() userId: string, @Body() body: SendTestPushDto) {
    return this.notificationsService.sendTestPush(
      userId,
      body.title || 'Teste de push',
      body.body || 'Seu push AWS SNS esta funcionando.'
    );
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.notificationsService.markAsRead(userId, id);
  }

  @Put('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@CurrentUserId() userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete one notification' })
  async delete(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.notificationsService.deleteForUser(userId, id);
  }
}
