import {
  Body,
  Controller, Get, HttpCode,
  HttpStatus, Post, Query, UseFilters
} from '@nestjs/common';
import { GetCurrentUserID } from 'src/decorators';
// import { GetCurrentUser, GetCurrentUserId, Public } from 'src/decorators';
// import { AtGuard, RtGuard } from 'src/guards';
// import { TransformInterceptor } from '../../custom-response/core.response';
import { HttpExceptionValidateFilter } from '../../filter/http-exception.filter';
import { ResponseData } from '../../interface/response.interface';
import {
  CreateReportDto,
} from './dto';
import { GetReportsDto } from './dto/get-reports-dto';
import { ReportService } from './report.service';

@Controller('reports')
@UseFilters(new HttpExceptionValidateFilter())
export class ReportController {
  constructor(private reportService: ReportService) {}

  @Post('')
  @HttpCode(HttpStatus.CREATED)
  createReport(
    @Body() createReportDto: CreateReportDto,
    @GetCurrentUserID() userID: number,
  ): Promise<ResponseData> {
    return this.reportService.createReport(createReportDto, userID);
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  getReportss(
    @Query() getReportsDto: GetReportsDto,
    @GetCurrentUserID() userID: number,
  ): Promise<ResponseData> {
    return this.reportService.getReports(getReportsDto, userID);
  }
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
