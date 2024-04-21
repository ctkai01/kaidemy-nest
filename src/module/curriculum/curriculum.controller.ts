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
import { CurriculumService } from './curriculum.service';
import { CreateCurriculumDto, UpdateCurriculumDto } from './dto';

@Controller('curriculums')
@UseFilters(new HttpExceptionValidateFilter())
export class CurriculumController {
  constructor(private curriculumService: CurriculumService) {}

  @Post('')
  @HttpCode(HttpStatus.CREATED)
  createCurriculum(
    @Body() createCurriculumDto: CreateCurriculumDto,
    @GetCurrentUserID() userID: number,
  ): Promise<ResponseData> {
    return this.curriculumService.createCurriculum(createCurriculumDto, userID);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  updateCurriculum(
    @Body() updateCurriculumDto: UpdateCurriculumDto,
    @Param('id') curriculumID: number,
    @GetCurrentUserID() userID: number,
  ): Promise<ResponseData> {
    return this.curriculumService.updateCurriculum(
      updateCurriculumDto,
      userID,
      curriculumID,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  deleteCurriculum(
    @Param('id') curriculumID: number,
    @GetCurrentUserID() userID: number,
  ): Promise<ResponseData> {
    return this.curriculumService.deleteCurriculum(curriculumID, userID);
  }

}
