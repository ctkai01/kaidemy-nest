import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
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

@Controller('notifications')
@UseFilters(new HttpExceptionValidateFilter())
@UseInterceptors(TransformInterceptor)
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get('')
  @HttpCode(HttpStatus.CREATED)
  test(
    // @Body() createLectureDto: CreateLectureDto,
    @GetCurrentUserID() userID: number,
  ): Promise<ResponseData> {
    return this.notificationService.pushNotification();
  }
}
