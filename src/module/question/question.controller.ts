import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseFilters,
  UseInterceptors
} from '@nestjs/common';
import { GetCurrentUserID } from 'src/decorators';
import { TransformInterceptor } from 'src/response/custom';
// import { GetCurrentUser, GetCurrentUserId, Public } from 'src/decorators';
// import { AtGuard, RtGuard } from 'src/guards';
// import { TransformInterceptor } from '../../custom-response/core.response';
import { HttpExceptionValidateFilter } from '../../filter/http-exception.filter';
import { ResponseData } from '../../interface/response.interface';
import { CreateQuestionDto, UpdateQuestionDto } from './dto';
import { QuestionService } from './question.service';

@Controller('questions')
@UseFilters(new HttpExceptionValidateFilter())
@UseInterceptors(TransformInterceptor)
export class QuestionController {
  constructor(private questionService: QuestionService) {}

  @Post('')
  @HttpCode(HttpStatus.CREATED)
  createLecture(
    @Body() createQuestionDto: CreateQuestionDto,
    @GetCurrentUserID() userID: number,
  ): Promise<ResponseData> {
    return this.questionService.createQuestion(createQuestionDto, userID);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  updateQuestion(
    @Body() updateQuestionDto: UpdateQuestionDto,
    @Param('id') questionID: number,
    @GetCurrentUserID() userID: number,
  ): Promise<ResponseData> {
    return this.questionService.updateQuestion(
      updateQuestionDto,
      userID,
      questionID,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  deleteQuestion(
    @Param('id') questionID: number,
    @GetCurrentUserID() userID: number,
  ): Promise<ResponseData> {
    return this.questionService.deleteQuestion(userID, questionID);
  }
}
