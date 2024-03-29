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

  // @Put(':id/resource')
  // @HttpCode(HttpStatus.OK)
  // @UseInterceptors(FileInterceptor('asset', multerResourceOptions))
  // updateLectureUploadResource(
  //   @Param('id') lectureID: number,
  //   @GetCurrentUserID() userID: number,
  //   @UploadedFile() asset: Express.Multer.File,
  // ): Promise<ResponseData> {
  //   return this.lectureService.uploadResourceLecture(userID, lectureID, asset);
  // }

  // @Put(':id/video')
  // @HttpCode(HttpStatus.OK)
  // @UseInterceptors(FileInterceptor('asset', multerVideoOptions))
  // updateLectureUploadVideo(
  //   @Param('id') lectureID: number,
  //   @GetCurrentUserID() userID: number,
  //   @UploadedFile() asset: Express.Multer.File,
  // ): Promise<ResponseData> {
  //   return this.lectureService.uploadVideoLecture(userID, lectureID, asset);
  // }

  // @Post(':id/mark')
  // @HttpCode(HttpStatus.OK)
  // markLecture(
  //   @Param('id') lectureID: number,
  //   @Body() markLectureDto: MarkLectureDto,
  //   @GetCurrentUserID() userID: number,
  // ): Promise<ResponseData> {
  //   return this.lectureService.markLecture(userID, lectureID, markLectureDto);
  // }

  // @Delete(':id')
  // @HttpCode(HttpStatus.OK)
  // deleteLecture(
  //   @Param('id') lectureID: number,
  //   @GetCurrentUserID() userID: number,
  // ): Promise<ResponseData> {
  //   return this.lectureService.deleteLecture(userID, lectureID);
  // }

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
