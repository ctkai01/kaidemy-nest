import {
  Controller, Get, HttpCode,
  HttpStatus, Query, UseFilters, UseInterceptors
} from '@nestjs/common';
import { GetCurrentUserID } from 'src/decorators';
import { TransformInterceptor } from 'src/response/custom';
// import { GetCurrentUser, GetCurrentUserId, Public } from 'src/decorators';
// import { AtGuard, RtGuard } from 'src/guards';
// import { TransformInterceptor } from '../../custom-response/core.response';
import { HttpExceptionValidateFilter } from '../../filter/http-exception.filter';
import { ResponseData } from '../../interface/response.interface';
import { ChatService } from './chat.service';
import { GetChatChannelDto } from './dto';
import { GetChatDetailDto } from './dto/get-chat-detail-dto';

@Controller('chats')
@UseFilters(new HttpExceptionValidateFilter())
@UseInterceptors(TransformInterceptor)
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('')
  @HttpCode(HttpStatus.OK)
  getAnswerLectures(
    @Query() getChatDetailDto: GetChatDetailDto,
    @GetCurrentUserID() userID: number,
  ): Promise<ResponseData> {
    return this.chatService.getChatsDetail(getChatDetailDto, userID);
  }

  @Get('channel')
  @HttpCode(HttpStatus.OK)
  getChatChannel(
    @Query() getChatChannelDto: GetChatChannelDto,
    @GetCurrentUserID() userID: number,
  ): Promise<ResponseData> {
    return this.chatService.getChatsChannel(getChatChannelDto, userID);
  }

  // @UseGuards(InstructorRoleGuard)
  // @Get('author')
  // @HttpCode(HttpStatus.OK)
  // getQuestionLecturesAuthor(
  //   @Query() getQuestionLectureDto: GetQuestionLectureDto,
  //   @GetCurrentUserID() userID: number,
  // ): Promise<ResponseData> {
  //   return this.questionLectureService.getQuestionLecturesAuthor(
  //     getQuestionLectureDto,
  //     userID,
  //   );
  // }
}
