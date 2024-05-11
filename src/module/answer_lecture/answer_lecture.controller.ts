import {
  Body,
  Controller, Delete, Get, HttpCode,
  HttpStatus, Param, Post, Put, Query, UseFilters, UseInterceptors
} from '@nestjs/common';
import { GetCurrentUserID } from 'src/decorators';
import { TransformInterceptor } from 'src/response/custom';
// import { GetCurrentUser, GetCurrentUserId, Public } from 'src/decorators';
// import { AtGuard, RtGuard } from 'src/guards';
// import { TransformInterceptor } from '../../custom-response/core.response';
import { HttpExceptionValidateFilter } from '../../filter/http-exception.filter';
import { ResponseData } from '../../interface/response.interface';
import { AnswerLectureService } from './answer_lecture.service';
import { CreateAnswerLectureDto } from './dto';
import { GetAnswerLectureDto } from './dto/get-answer-lecture-dto';
import { UpdateAnswerLectureDto } from './dto/update-answer-lecture-dto';

@Controller('answer-lectures')
@UseFilters(new HttpExceptionValidateFilter())
@UseInterceptors(TransformInterceptor)
export class AnswerLectureController {
  constructor(private answerLectureService: AnswerLectureService) {}

  @Post('')
  @HttpCode(HttpStatus.CREATED)
  createAnswerLecture(
    @Body() createAnswerLectureDto: CreateAnswerLectureDto,
    @GetCurrentUserID() userID: number,
  ): Promise<ResponseData> {
    return this.answerLectureService.createAnswerLecture(
      createAnswerLectureDto,
      userID,
    );
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  updateAnswerLecture(
    @Body() updateAnswerLectureDto: UpdateAnswerLectureDto,
    @Param('id') answerLectureID: number,
    @GetCurrentUserID() userID: number,
  ): Promise<ResponseData> {
    return this.answerLectureService.updateAnswerLecture(
      updateAnswerLectureDto,
      userID,
      answerLectureID,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  deleteAnswerLecture(
    @Param('id') answerLectureID: number,
    @GetCurrentUserID() userID: number,
  ): Promise<ResponseData> {
    return this.answerLectureService.deleteAnswerLecture(
      userID,
      answerLectureID,
    );
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  getAnswerLectures(
    @Query() getQuestionLectureDto: GetAnswerLectureDto,
    @GetCurrentUserID() userID: number,
  ): Promise<ResponseData> {
    return this.answerLectureService.getAnswerLectures(
      getQuestionLectureDto,
      userID,
    );
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
