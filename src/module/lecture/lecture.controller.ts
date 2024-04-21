import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UploadedFile,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetCurrentUserID } from 'src/decorators';
// import { GetCurrentUser, GetCurrentUserId, Public } from 'src/decorators';
// import { AtGuard, RtGuard } from 'src/guards';
// import { TransformInterceptor } from '../../custom-response/core.response';
import { HttpExceptionValidateFilter } from '../../filter/http-exception.filter';
import { ResponseData } from '../../interface/response.interface';
import { CreateLectureDto, UpdateLectureDto } from './dto';
import { LectureService } from './lecture.service';
import { multerImageOptions, multerResourceOptions, multerVideoOptions } from './multer.config';
import { MarkLectureDto } from './dto/mark-lecture-dto';

@Controller('lectures')
@UseFilters(new HttpExceptionValidateFilter())
export class LectureController {
  constructor(private lectureService: LectureService) {}

  @Post('')
  @HttpCode(HttpStatus.CREATED)
  createLecture(
    @Body() createLectureDto: CreateLectureDto,
    @GetCurrentUserID() userID: number,
  ): Promise<ResponseData> {
    return this.lectureService.createLecture(createLectureDto, userID);
  }
  //  @UseInterceptors(FileInterceptor('avatar', multerImageOptions))
  //   updateProfile(
  //     @UploadedFile() avatar: Express.Multer.File,
  //     @Body() updateProfileDto: UpdateProfileDto,
  //     @GetCurrentUserID() userID: number,
  //   ): Promise<ResponseData> {
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  updateLecture(
    @Body() updateLectureDto: UpdateLectureDto,
    @Param('id') lectureID: number,
    @GetCurrentUserID() userID: number,
  ): Promise<ResponseData> {
    return this.lectureService.updateLecture(
      updateLectureDto,
      userID,
      lectureID,
    );
  }

  @Put(':id/resource')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('asset', multerResourceOptions))
  updateLectureUploadResource(
    @Param('id') lectureID: number,
    @GetCurrentUserID() userID: number,
    @UploadedFile() asset: Express.Multer.File,
  ): Promise<ResponseData> {
    return this.lectureService.uploadResourceLecture(userID, lectureID, asset);
  }

  @Put(':id/video')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('asset', multerVideoOptions))
  updateLectureUploadVideo(
    @Param('id') lectureID: number,
    @GetCurrentUserID() userID: number,
    @UploadedFile() asset: Express.Multer.File,
  ): Promise<ResponseData> {
    return this.lectureService.uploadVideoLecture(userID, lectureID, asset);
  }

  @Post(':id/mark')
  @HttpCode(HttpStatus.OK)
  markLecture(
    @Param('id') lectureID: number,
    @Body() markLectureDto: MarkLectureDto,
    @GetCurrentUserID() userID: number,
  ): Promise<ResponseData> {
    return this.lectureService.markLecture(userID, lectureID, markLectureDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  deleteLecture(
    @Param('id') lectureID: number,
    @GetCurrentUserID() userID: number,
  ): Promise<ResponseData> {
    return this.lectureService.deleteLecture(userID, lectureID);
  }
}
