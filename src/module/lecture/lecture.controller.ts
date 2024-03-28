import {
  Body,
  Controller, HttpCode,
  HttpStatus, Param, Post, Put, UseFilters, UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetCurrentUserID } from 'src/decorators';
// import { GetCurrentUser, GetCurrentUserId, Public } from 'src/decorators';
// import { AtGuard, RtGuard } from 'src/guards';
// import { TransformInterceptor } from '../../custom-response/core.response';
import { HttpExceptionValidateFilter } from '../../filter/http-exception.filter';
import { ResponseData } from '../../interface/response.interface';
import {
  CreateLectureDto, UpdateLectureDto
} from './dto';
import { LectureService } from './lecture.service';
import { multerImageOptions } from './multer.config';

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
  @UseInterceptors(FileInterceptor('asset', multerImageOptions))
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

  // @Delete(':id')
  // @HttpCode(HttpStatus.OK)
  // deleteCurriculum(
  //   @Param('id') curriculumID: number,
  //   @GetCurrentUserID() userID: number,
  // ): Promise<ResponseData> {
  //   return this.curriculumService.deleteCurriculum(curriculumID, userID);
  // }

  // @Get(':id')
  // @HttpCode(HttpStatus.OK)
  // getCategoryByID(@Param('id') categoryID: number): Promise<ResponseData> {
  //   return this.categoryService.getCategoryByID(categoryID);
  // }

  // @Get()
  // @HttpCode(HttpStatus.OK)
  // getCategories(
  //   @Query() pageCommonOptionsDto: PageCommonOptionsDto,
  // ): Promise<ResponseData> {
  //   return this.categoryService.getCategories(pageCommonOptionsDto);
  // }

  // @Public()
  // @Post('change-password')
  // @HttpCode(HttpStatus.OK)
  // signup(
  //   @Body() changePasswordDto: ChangePasswordDto,
  //   @GetCurrentUserID() userID: number,
  // ): Promise<ResponseData> {
  //   return this.userService.changePassword(changePasswordDto, userID);
  // }

  // @Public()
  // @Post('login')
  // @HttpCode(HttpStatus.OK)
  // login(@Body() loginUserDto: LoginUserDto): Promise<ResponseData> {
  //   return this.authService.loginUser(loginUserDto);
  // }

  // @Public()
  // @Post('/login')
  // @UseInterceptors(TransformInterceptor)
  // @UseFilters(new HttpExceptionValidateFilter())
  // login(@Body() loginUserDto: LoginUserDto): Promise<ResponseData> {
  //   return this.authService.login(loginUserDto);
  // }

  // @UseGuards(AtGuard)
  // @Post('logout')
  // logout(@GetCurrentUserId() userId: number): Promise<void> {
  //   return this.authService.logout(userId);
  // }

  // @Public()
  // @UseGuards(RtGuard)
  // @Post('refreshToken')
  // refreshToken(
  //   @Request() req: any,
  //   @GetCurrentUser('refresh_token') refreshToken: string,
  //   @GetCurrentUserId() userId: any,
  // ): Promise<Tokens> {
  //   return this.authService.refreshToken(userId, refreshToken);
  // }
}
