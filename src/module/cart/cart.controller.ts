import {
  Body,
  Controller, Delete, Get, HttpCode,
  HttpStatus, Param, Post, UseFilters
} from '@nestjs/common';
import { GetCurrentUserID } from 'src/decorators';
// import { GetCurrentUser, GetCurrentUserId, Public } from 'src/decorators';
// import { AtGuard, RtGuard } from 'src/guards';
// import { TransformInterceptor } from '../../custom-response/core.response';
import { HttpExceptionValidateFilter } from '../../filter/http-exception.filter';
import { ResponseData } from '../../interface/response.interface';
import { CartService } from './cart.service';
import { CreateQuestionDto } from './dto';

@Controller('carts')
@UseFilters(new HttpExceptionValidateFilter())
export class CartController {
  constructor(private cartService: CartService) {}

  @Post('')
  @HttpCode(HttpStatus.CREATED)
  createCart(@GetCurrentUserID() userID: number): Promise<ResponseData> {
    return this.cartService.createCart(userID);
  }

  @Post('/item/:id')
  @HttpCode(HttpStatus.OK)
  addCourseToCart(
    @GetCurrentUserID() userID: number,
    @Param('id') courseID: number,
  ): Promise<ResponseData> {
    return this.cartService.addCourseToCart(userID, courseID);
  }

  @Delete('/item/:id')
  @HttpCode(HttpStatus.OK)
  deleteCourseToCart(
    @GetCurrentUserID() userID: number,
    @Param('id') courseID: number,
  ): Promise<ResponseData> {
    return this.cartService.deleteCourseToCart(userID, courseID);
  }

  @Post('/claims')
  @HttpCode(HttpStatus.OK)
  claimsPayment(@GetCurrentUserID() userID: number): Promise<ResponseData> {
    return this.cartService.claimsPayment(userID);
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  getCart(@GetCurrentUserID() userID: number): Promise<ResponseData> {
    return this.cartService.getCart(userID);
  }

  // @Put(':id')
  // @HttpCode(HttpStatus.OK)
  // updateQuestion(
  //   @Body() updateQuestionDto: UpdateQuestionDto,
  //   @Param('id') questionID: number,
  //   @GetCurrentUserID() userID: number,
  // ): Promise<ResponseData> {
  //   return this.questionService.updateQuestion(
  //     updateQuestionDto,
  //     userID,
  //     questionID,
  //   );
  // }

  // @Delete(':id')
  // @HttpCode(HttpStatus.OK)
  // deleteQuestion(
  //   @Param('id') questionID: number,
  //   @GetCurrentUserID() userID: number,
  // ): Promise<ResponseData> {
  //   return this.questionService.deleteQuestion(userID, questionID);
  // }
  //  @UseInterceptors(FileInterceptor('avatar', multerImageOptions))
  //   updateProfile(
  //     @UploadedFile() avatar: Express.Multer.File,
  //     @Body() updateProfileDto: UpdateProfileDto,
  //     @GetCurrentUserID() userID: number,
  //   ): Promise<ResponseData> {
  // @Put(':id')
  // @HttpCode(HttpStatus.OK)
  // updateLecture(
  //   @Body() updateLectureDto: UpdateLectureDto,
  //   @Param('id') lectureID: number,
  //   @GetCurrentUserID() userID: number,
  // ): Promise<ResponseData> {
  //   return this.lectureService.updateLecture(
  //     updateLectureDto,
  //     userID,
  //     lectureID,
  //   );
  // }

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
