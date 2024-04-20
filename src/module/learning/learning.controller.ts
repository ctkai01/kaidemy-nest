import {
  Body,
  Controller,
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
import { UpdateLearningDto } from './dto';
import { LearningService } from './learning.service';

@Controller('learnings')
@UseFilters(new HttpExceptionValidateFilter())
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
}
