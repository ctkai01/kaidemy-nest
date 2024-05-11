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
  UseInterceptors,
} from '@nestjs/common';
import { GetCurrentUserID } from 'src/decorators';
// import { GetCurrentUser, GetCurrentUserId, Public } from 'src/decorators';
// import { AtGuard, RtGuard } from 'src/guards';
// import { TransformInterceptor } from '../../custom-response/core.response';
import { HttpExceptionValidateFilter } from '../../filter/http-exception.filter';
import { ResponseData } from '../../interface/response.interface';
import { CreateAnswerDto, UpdateAnswerDto } from './dto';
import { AnswerService } from './answer.service';
import { TransformInterceptor } from 'src/response/custom';

@Controller('answers')
@UseFilters(new HttpExceptionValidateFilter())
@UseInterceptors(TransformInterceptor)
export class AnswerController {
  constructor(private answerService: AnswerService) {}

  @Post('')
  @HttpCode(HttpStatus.CREATED)
  createAnswer(
    @Body() createAnswerDto: CreateAnswerDto,
    @GetCurrentUserID() userID: number,
  ): Promise<ResponseData> {
    return this.answerService.createAnswer(createAnswerDto, userID);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  updateAnswer(
    @Body() updateAnswerDto: UpdateAnswerDto,
    @Param('id') answerID: number,
    @GetCurrentUserID() userID: number,
  ): Promise<ResponseData> {
    return this.answerService.updateAnswer(updateAnswerDto, userID, answerID);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  deleteAnswer(
    @Param('id') answerID: number,
    @GetCurrentUserID() userID: number,
  ): Promise<ResponseData> {
    return this.answerService.deleteAnswer(userID, answerID);
  }
}
