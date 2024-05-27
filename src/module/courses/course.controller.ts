import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UploadedFile,
  UseFilters,
  UseInterceptors,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GetCurrentUserID, Public } from 'src/decorators';
// import { GetCurrentUser, GetCurrentUserId, Public } from 'src/decorators';
// import { AtGuard, RtGuard } from 'src/guards';
// import { TransformInterceptor } from '../../custom-response/core.response';
import { FileInterceptor } from '@nestjs/platform-express';
import { TransformInterceptor } from 'src/response/custom';
import { HttpExceptionValidateFilter } from '../../filter/http-exception.filter';
import { ResponseData } from '../../interface/response.interface';
import { CourseService } from './course.service';
import { CreateCourseDto, UpdateCourseDto } from './dto';
import { multerImageOptions } from './multer.config';
import { GetCoursesOverviewAuthorDto } from './dto/get-courses-overview-author-dto';
import { GuardsConsumer } from '@nestjs/core/guards';
import { InstructorRoleGuard } from 'src/guards/author-role.guard';
import { GetReviewsDto } from './dto/get-reviews-by-course-id-dto';
import { GetCourseDto } from './dto/get-curriculum-by-course-id-dto';
import { GetCoursesCategory } from './dto/get-courses-category-dto';
import { GetCoursesSearch } from './dto/get-courses-search-dto';
import { GetCoursesSearchGlobal } from './dto/get-courses-search-global-dto';
import { GetCoursesAuthorDto } from './dto/get-courses-author-dto';
import { GetReviewAuthor } from './dto/get-review-author-dto';
import { GetUsersAuthor } from './dto/get-users-author-dto';
import { AdminRoleGuard } from 'src/guards/admin-role.guard';
import { GetCoursesReviewsDto } from './dto/get-courses-reviews-dto';
import { ApprovalCourseReviewDto } from './dto/approval-course-review-dto';

@Controller('courses')
@UseFilters(new HttpExceptionValidateFilter())
@UseInterceptors(TransformInterceptor)
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

  @UseGuards(InstructorRoleGuard)
  @Get('overview/author')
  @HttpCode(HttpStatus.OK)
  getCourseOverviewAuthor(
    @GetCurrentUserID() userID: number,
    @Query() getCoursesOverviewAuthorDto: GetCoursesOverviewAuthorDto,
  ): Promise<ResponseData> {
    return this.courseService.getCoursesOverviewAuthor(
      userID,
      getCoursesOverviewAuthorDto,
    );
  }

  @UseGuards(AdminRoleGuard)
  @Get('overview/admin')
  @HttpCode(HttpStatus.OK)
  getCourseOverviewAdmin(): Promise<ResponseData> {
    return this.courseService.getOverviewAdmin();
  }

  @Public()
  @Get(':id/curriculums')
  @HttpCode(HttpStatus.OK)
  getCurriculumByCourseID(
    @Param('id') courseID: number,
  ): Promise<ResponseData> {
    return this.courseService.getCurriculumByCourseID(courseID);
  }

  @Get(':id/curriculums/auth')
  @HttpCode(HttpStatus.OK)
  getCurriculumByCourseIDAuth(
    @Param('id') courseID: number,
    @GetCurrentUserID() userID: number,
  ): Promise<ResponseData> {
    return this.courseService.getCurriculumByCourseIDAuth(courseID, userID);
  }

  @Get('search-auth')
  @HttpCode(HttpStatus.OK)
  getCoursesSearch(
    @GetCurrentUserID() userID: number,
    @Query() getCoursesSearch: GetCoursesSearch,
  ): Promise<ResponseData> {
    return this.courseService.getCoursesSearch(getCoursesSearch, userID);
  }

  @Get('search')
  @Public()
  @HttpCode(HttpStatus.OK)
  getCoursesSearchNotAuth(
    @Query() getCoursesSearch: GetCoursesSearch,
  ): Promise<ResponseData> {
    return this.courseService.getCoursesSearch(getCoursesSearch, null);
  }

  @Get('author')
  @HttpCode(HttpStatus.OK)
  @UseGuards(InstructorRoleGuard)
  getCoursesAuthor(
    @Query() getCoursesAuthorDto: GetCoursesAuthorDto,
    @GetCurrentUserID() userID: number,
  ): Promise<ResponseData> {
    return this.courseService.getCoursesAuthor(getCoursesAuthorDto, userID);
  }

  @Get('reviews')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminRoleGuard)
  getCoursesReviews(
    @Query() getCoursesReviewsDto: GetCoursesReviewsDto,
  ): Promise<ResponseData> {
    return this.courseService.getCoursesReview(getCoursesReviewsDto);
  }

  @Get('reviews/author')
  @HttpCode(HttpStatus.OK)
  @UseGuards(InstructorRoleGuard)
  getReviewsAuthor(
    @Query() getReviewAuthor: GetReviewAuthor,
    @GetCurrentUserID() userID: number,
  ): Promise<ResponseData> {
    return this.courseService.getReviewAuthor(getReviewAuthor, userID);
  }

  @Get('users/author')
  @HttpCode(HttpStatus.OK)
  @UseGuards(InstructorRoleGuard)
  getUsersAuthor(
    @Query() getUsersAuthor: GetUsersAuthor,
    @GetCurrentUserID() userID: number,
  ): Promise<ResponseData> {
    return this.courseService.getUsersAuthor(getUsersAuthor, userID);
  }

  @Get('search-global')
  @Public()
  @HttpCode(HttpStatus.OK)
  getCoursesSearchGlobal(
    @Query() getCoursesSearchGlobal: GetCoursesSearchGlobal,
  ): Promise<ResponseData> {
    return this.courseService.getCoursesSearchGlobal(getCoursesSearchGlobal);
  }

  @Post(':id/approval-review')
  @HttpCode(HttpStatus.OK)
  approvalReview(
    @Param('id') courseID: number,
    @Body() approvalCourseReviewDto: ApprovalCourseReviewDto,
  ): Promise<ResponseData> {
    return this.courseService.approvalReview(courseID, approvalCourseReviewDto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  getCourseByID(
    @Param('id') courseID: number,
    @GetCurrentUserID() userID: number,
  ): Promise<ResponseData> {
    return this.courseService.getCourseByID(courseID, userID);
  }

  @Put(':id/submit-review')
  @HttpCode(HttpStatus.OK)
  submitReviewCourseByID(
    @Param('id') courseID: number,
    @GetCurrentUserID() userID: number,
  ): Promise<ResponseData> {
    return this.courseService.submitReviewCourseByID(courseID, userID);
  }

  @Get(':id/reviews')
  @Public()
  @HttpCode(HttpStatus.OK)
  getReviews(
    @Query() getCourseDto: GetReviewsDto,
    @Param('id') courseID: number,
  ): Promise<ResponseData> {
    return this.courseService.getReviewsByCourseID(getCourseDto, courseID);
  }

  @Get(':id/reviews-overall')
  @Public()
  @HttpCode(HttpStatus.OK)
  getReviewsOverall(@Param('id') courseID: number): Promise<ResponseData> {
    return this.courseService.getOverallReviewByCourseID(courseID);
  }

  @Get('category-auth/:id')
  @HttpCode(HttpStatus.OK)
  getCoursesCategory(
    @GetCurrentUserID() userID: number,
    @Param('id') categoryID: number,
    @Query() getCoursesCategory: GetCoursesCategory,
  ): Promise<ResponseData> {
    return this.courseService.getCoursesCategory(
      getCoursesCategory,
      categoryID,
      userID,
    );
  }

  @Get('category/:id')
  @Public()
  @HttpCode(HttpStatus.OK)
  getNotAuthCoursesCategory(
    @Param('id') categoryID: number,
    @Query() getCoursesCategory: GetCoursesCategory,
  ): Promise<ResponseData> {
    return this.courseService.getCoursesCategory(
      getCoursesCategory,
      categoryID,
      null,
    );
  }

  @Get('')
  @Public()
  @HttpCode(HttpStatus.OK)
  getCourses(@Query() getCourseDto: GetCourseDto): Promise<ResponseData> {
    return this.courseService.getCourses(getCourseDto);
  }
}
