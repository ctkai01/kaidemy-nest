import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseFilters,
  UseInterceptors
} from '@nestjs/common';
import { GetCurrentUserID } from 'src/decorators';
// import { GetCurrentUser, GetCurrentUserId, Public } from 'src/decorators';
// import { AtGuard, RtGuard } from 'src/guards';
// import { TransformInterceptor } from '../../custom-response/core.response';
import { TransformInterceptor } from 'src/response/custom';
import { HttpExceptionValidateFilter } from '../../filter/http-exception.filter';
import { ResponseData } from '../../interface/response.interface';
import { NotificationService } from './notification.service';
import { AcceptNotificationDto } from './dto';

@Controller('notifications')
@UseFilters(new HttpExceptionValidateFilter())
@UseInterceptors(TransformInterceptor)
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Post('fcm')
  @HttpCode(HttpStatus.CREATED)
  acceptPushNotification(
    @Body() acceptNotificationDto: AcceptNotificationDto,
    @GetCurrentUserID() userID: number,
  ): Promise<ResponseData> {
    return this.notificationService.acceptPushNotification(
      userID,
      acceptNotificationDto,
    );
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  getNotification(
    @Body() acceptNotificationDto: AcceptNotificationDto,
    @GetCurrentUserID() userID: number,
  ): Promise<ResponseData> {
    return this.notificationService.acceptPushNotification(
      userID,
      acceptNotificationDto,
    );
  }
}
