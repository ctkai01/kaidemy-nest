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
  UseInterceptors,
} from '@nestjs/common';
import { GetCurrentUserID } from 'src/decorators';
import { TransformInterceptor } from 'src/response/custom';
// import { GetCurrentUser, GetCurrentUserId, Public } from 'src/decorators';
// import { AtGuard, RtGuard } from 'src/guards';
// import { TransformInterceptor } from '../../custom-response/core.response';
import { HttpExceptionValidateFilter } from '../../filter/http-exception.filter';
import { ResponseData } from '../../interface/response.interface';
import {
  CreateTopicLearningDto,
  RemoveLearningTopicLearningDto,
  UpdateTopicLearningDto,
} from './dto';
import { CreateLearningTopicLearningDto } from './dto/create-learning-topic-learning-dto';
import { GetTopicLearningDto } from './dto/get-topic-learning-dto';
import { TopicLearningService } from './topic_learning.service';

@Controller('topic-learnings')
@UseFilters(new HttpExceptionValidateFilter())
@UseInterceptors(TransformInterceptor)
export class TopicLearningController {
  constructor(private topicLearningService: TopicLearningService) {}

  @Post('')
  @HttpCode(HttpStatus.CREATED)
  createTopicLearning(
    @Body() createTopicLearningDto: CreateTopicLearningDto,
    @GetCurrentUserID() userID: number,
  ): Promise<ResponseData> {
    return this.topicLearningService.createTopicLearning(
      createTopicLearningDto,
      userID,
    );
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  updateTopicLearning(
    @Body() updateTopicLearningDto: UpdateTopicLearningDto,
    @Param('id') topicLearningID: number,
    @GetCurrentUserID() userID: number,
  ): Promise<ResponseData> {
    return this.topicLearningService.updateTopicLearning(
      updateTopicLearningDto,
      userID,
      topicLearningID,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  deleteTopicLearning(
    @Param('id') topicLearningID: number,
    @GetCurrentUserID() userID: number,
  ): Promise<ResponseData> {
    return this.topicLearningService.removeTopicLearning(
      userID,
      topicLearningID,
    );
  }

  @Post('course')
  @HttpCode(HttpStatus.CREATED)
  addCourseToTopic(
    @Body() createLearningTopicLearningDto: CreateLearningTopicLearningDto,
    @GetCurrentUserID() userID: number,
  ): Promise<ResponseData> {
    return this.topicLearningService.addLearningToTopicLearning(
      createLearningTopicLearningDto,
      userID,
    );
  }

  @Delete('course/:id/:learningID')
  @HttpCode(HttpStatus.OK)
  removeCourseToTopic(
    @Param('id') topicLearningID: number,
    @Param('learningID') learningID: number,
    @GetCurrentUserID() userID: number,
  ): Promise<ResponseData> {
    return this.topicLearningService.removeLearningToTopicLearning(
      topicLearningID,
      learningID,
      userID,
    );
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  getTopicLearnings(
    @Query() getTopicLearningDto: GetTopicLearningDto,
    @GetCurrentUserID() userID: number,
  ): Promise<ResponseData> {
    return this.topicLearningService.getTopicLearning(
      getTopicLearningDto,
      userID,
    );
  }

  // @Delete(':id')
  // @HttpCode(HttpStatus.OK)
  // deleteTopicLearning(
  //   @Param('id') answerID: number,
  //   @GetCurrentUserID() userID: number,
  // ): Promise<ResponseData> {
  //   return this.answerService.deleteAnswer(userID, answerID);
  // }
}
