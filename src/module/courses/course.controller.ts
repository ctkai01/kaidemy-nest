import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { GetCurrentUserID } from 'src/decorators';
// import { GetCurrentUser, GetCurrentUserId, Public } from 'src/decorators';
// import { AtGuard, RtGuard } from 'src/guards';
// import { TransformInterceptor } from '../../custom-response/core.response';
import { AdminRoleGuard } from 'src/guards/admin-role.guard';
import { HttpExceptionValidateFilter } from '../../filter/http-exception.filter';
import { ResponseData } from '../../interface/response.interface';
import { CourseService } from './course.service';
import { CreateCourseDto, UpdateCourseDto } from './dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerImageOptions } from './multer.config';

@Controller('courses')
@UseFilters(new HttpExceptionValidateFilter())
export class CourseController {
  constructor(private courseService: CourseService) {}

  @Post('')
  @HttpCode(HttpStatus.CREATED)
  createCourse(
    @Body() createCourseDto: CreateCourseDto,
    @GetCurrentUserID() userID: number,
  ): Promise<ResponseData> {
    return this.courseService.createCourse(createCourseDto, userID);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('image', multerImageOptions))
  updateCourse(
    @UploadedFile() image: Express.Multer.File,
    @Body() updateCourseDto: UpdateCourseDto,
    @GetCurrentUserID() userID: number,
    @Param('id') courseID: number,
  ): Promise<ResponseData> {
    return this.courseService.updateCourse(
      updateCourseDto,
      userID,
      courseID,
      image,
    );
  }

  // @Delete(':id')
  // @UseGuards(AdminRoleGuard)
  // @HttpCode(HttpStatus.OK)
  // deletePrice(@Param('id') categoryID: number): Promise<ResponseData> {
  //   return this.categoryService.deleteCategory(categoryID);
  // }

  // @Get(':id')
  // @HttpCode(HttpStatus.OK)
  // getCategoryByID(
  //   @Param('id') categoryID: number,
  // ): Promise<ResponseData> {
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
