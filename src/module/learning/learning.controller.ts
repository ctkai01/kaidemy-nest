import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseFilters
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

  @Post('')
  @HttpCode(HttpStatus.OK)
  createCart(
    @GetCurrentUserID() userID: number,
    @Body() updateLearningDto: UpdateLearningDto,
  ): Promise<ResponseData> {
    return this.learningService.updateLearning(userID, updateLearningDto);
  }
}
