import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
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
import { UpdateLearningDto } from './dto';
import { GetLearningDto } from './dto/get-learning-dto';
import { LearningService } from './learning.service';

@Controller('learnings')
@UseFilters(new HttpExceptionValidateFilter())
@UseInterceptors(TransformInterceptor)
export class LearningController {
  constructor(private learningService: LearningService) {}

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  updateLearning(
    @GetCurrentUserID() userID: number,
    @Param('id') learningID: number,
    @Body() updateLearningDto: UpdateLearningDto,
  ): Promise<ResponseData> {
    return this.learningService.updateLearning(
      userID,
      learningID,
      updateLearningDto,
    );
  }

  @Post('wish-course/:id')
  @HttpCode(HttpStatus.OK)
  createWishCourse(
    @GetCurrentUserID() userID: number,
    @Param('id', ParseIntPipe) courseID: number,
  ): Promise<ResponseData> {
    return this.learningService.createWishCourse(userID, courseID);
  }

  @Delete('wish-course/:id')
  @HttpCode(HttpStatus.OK)
  deleteWishCourse(
    @GetCurrentUserID() userID: number,
    @Param('id', ParseIntPipe) learningID: number,
  ): Promise<ResponseData> {
    return this.learningService.deleteWishCourse(userID, learningID);
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  getLearning(@Query() getLearningDto: GetLearningDto): Promise<ResponseData> {
    return this.learningService.getLearning(getLearningDto);
  }
}
