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
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { GetCurrentUserID } from 'src/decorators';
import { AdminRoleGuard } from 'src/guards/admin-role.guard';
import { InstructorRoleGuard } from 'src/guards/author-role.guard';
import { TransformInterceptor } from 'src/response/custom';
// import { GetCurrentUser, GetCurrentUserId, Public } from 'src/decorators';
// import { AtGuard, RtGuard } from 'src/guards';
// import { TransformInterceptor } from '../../custom-response/core.response';
import { HttpExceptionValidateFilter } from '../../filter/http-exception.filter';
import { ResponseData } from '../../interface/response.interface';
import { CreateQuestionLectureDto } from './dto';
import { GetQuestionLectureDto } from './dto/get-question-lecture-dto';
import { UpdateQuestionLectureDto } from './dto/update-question-lecture-dto';
import { QuestionLectureService } from './question_lecture.service';

@Controller('question-lectures')
@UseFilters(new HttpExceptionValidateFilter())
@UseInterceptors(TransformInterceptor)
export class QuestionLectureController {
  constructor(private questionLectureService: QuestionLectureService) {}

  @Post('')
  @HttpCode(HttpStatus.CREATED)
  createQuestionLecture(
    @Body() createQuestionLectureDto: CreateQuestionLectureDto,
    @GetCurrentUserID() userID: number,
  ): Promise<ResponseData> {
    return this.questionLectureService.createQuestionLecture(
      createQuestionLectureDto,
      userID,
    );
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  updateQuestionLecture(
    @Body() updateQuestionLectureDto: UpdateQuestionLectureDto,
    @Param('id') questionLectureID: number,
    @GetCurrentUserID() userID: number,
  ): Promise<ResponseData> {
    return this.questionLectureService.updateQuestionLecture(
      updateQuestionLectureDto,
      userID,
      questionLectureID,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  deleteQuestionLecture(
    @Param('id') questionLectureID: number,
    @GetCurrentUserID() userID: number,
  ): Promise<ResponseData> {
    return this.questionLectureService.deleteQuestionLecture(
      userID,
      questionLectureID,
    );
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  getQuestionLectures(
    @Query() getQuestionLectureDto: GetQuestionLectureDto,
    @GetCurrentUserID() userID: number,
  ): Promise<ResponseData> {
    return this.questionLectureService.getQuestionLectures(
      getQuestionLectureDto,
      userID,
    );
  }

  @UseGuards(InstructorRoleGuard)
  @Get('author')
  @HttpCode(HttpStatus.OK)
  getQuestionLecturesAuthor(
    @Query() getQuestionLectureDto: GetQuestionLectureDto,
    @GetCurrentUserID() userID: number,
  ): Promise<ResponseData> {
    return this.questionLectureService.getQuestionLecturesAuthor(
      getQuestionLectureDto,
      userID,
    );
  }

  // @Get('')
  // @HttpCode(HttpStatus.OK)
  // getReportss(
  //   @Query() getReportsDto: GetReportsDto,
  //   @GetCurrentUserID() userID: number,
  // ): Promise<ResponseData> {
  //   return this.reportService.getReports(getReportsDto, userID);
  // }
  // @Put(':id')
  // @HttpCode(HttpStatus.OK)
  // updateAnswer(
  //   @Body() updateTopicLearningDto: UpdateTopicLearningDto,
  //   @Param('id') topicLearningID: number,
  //   @GetCurrentUserID() userID: number,
  // ): Promise<ResponseData> {
  //   return this.topicLearningService.updateTopicLearning(
  //     updateTopicLearningDto,
  //     userID,
  //     topicLearningID,
  //   );
  // }

  // @Delete(':id')
  // @HttpCode(HttpStatus.OK)
  // deleteAnswer(
  //   @Param('id') topicLearningID: number,
  //   @GetCurrentUserID() userID: number,
  // ): Promise<ResponseData> {
  //   return this.topicLearningService.removeTopicLearning(
  //     userID,
  //     topicLearningID,
  //   );
  // }

  // @Post('course')
  // @HttpCode(HttpStatus.CREATED)
  // addCourseToTopic(
  //   @Body() createLearningTopicLearningDto: CreateLearningTopicLearningDto,
  //   @GetCurrentUserID() userID: number,
  // ): Promise<ResponseData> {
  //   return this.topicLearningService.addLearningToTopicLearning(
  //     createLearningTopicLearningDto,
  //     userID,
  //   );
  // }

  // @Delete('course')
  // @HttpCode(HttpStatus.CREATED)
  // removeCourseToTopic(
  //   @Body() createLearningTopicLearningDto: RemoveLearningTopicLearningDto,
  //   @GetCurrentUserID() userID: number,
  // ): Promise<ResponseData> {
  //   return this.topicLearningService.removeLearningToTopicLearning(
  //     createLearningTopicLearningDto,
  //     userID,
  //   );
  // }

  // @Get('')
  // @HttpCode(HttpStatus.OK)
  // getTopicLearnings(
  //   @Param() getTopicLearningDto: GetTopicLearningDto,
  //   @GetCurrentUserID() userID: number,
  // ): Promise<ResponseData> {
  //   return this.topicLearningService.getTopicLearning(
  //     getTopicLearningDto,
  //     userID,
  //   );
  // }

  // @Delete(':id')
  // @HttpCode(HttpStatus.OK)
  // deleteAnswer(
  //   @Param('id') answerID: number,
  //   @GetCurrentUserID() userID: number,
  // ): Promise<ResponseData> {
  //   return this.answerService.deleteAnswer(userID, answerID);
  // }
}
