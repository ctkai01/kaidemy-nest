import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Query,
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
import { GetNotificationDto } from './dto/get-notifications-dto';

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
    @Query() getNotificationDto: GetNotificationDto,
    @GetCurrentUserID() userID: number,
  ): Promise<ResponseData> {
    return this.notificationService.getNotifications(
      userID,
      getNotificationDto,
    );
  }

  @Put('read-all')
  @HttpCode(HttpStatus.OK)
  readAllNotification(
    @GetCurrentUserID() userID: number,
  ): Promise<ResponseData> {
    return this.notificationService.readAllNotifications(userID);
  }

  @Get('no-read')
  @HttpCode(HttpStatus.OK)
  countNoReadNotification(
    @GetCurrentUserID() userID: number,
  ): Promise<ResponseData> {
    return this.notificationService.countNoReadNotifications(userID);
  }
}
