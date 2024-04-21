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
} from '@nestjs/common';
import { GetCurrentUserID } from 'src/decorators';
// import { GetCurrentUser, GetCurrentUserId, Public } from 'src/decorators';
// import { AtGuard, RtGuard } from 'src/guards';
// import { TransformInterceptor } from '../../custom-response/core.response';
import { HttpExceptionValidateFilter } from '../../filter/http-exception.filter';
import { ResponseData } from '../../interface/response.interface';
import { CreateQuizDto } from './dto';
import { QuizService } from './quiz.service';
import { UpdateQuizDto } from './dto/update-quiz-dto';

@Controller('quizs')
@UseFilters(new HttpExceptionValidateFilter())
export class QuizController {
  constructor(private quizService: QuizService) {}

  @Post('')
  @HttpCode(HttpStatus.CREATED)
  createQuiz(
    @Body() createQuizDto: CreateQuizDto,
    @GetCurrentUserID() userID: number,
  ): Promise<ResponseData> {
    return this.quizService.createQuiz(createQuizDto, userID);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  updateQuiz(
    @Body() updateQuizDto: UpdateQuizDto,
    @Param('id') quizID: number,
    @GetCurrentUserID() userID: number,
  ): Promise<ResponseData> {
    return this.quizService.updateQuiz(updateQuizDto, userID, quizID);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  deleteQuiz(
    @Param('id') quizID: number,
    @GetCurrentUserID() userID: number,
  ): Promise<ResponseData> {
    return this.quizService.deleteQuiz(userID, quizID);
  }
}
