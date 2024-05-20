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
import { GetCourseDto } from './dto/get-curriculum-by-course-id-dto';

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

  @Get('')
  @HttpCode(HttpStatus.OK)
  getCourses(
    @GetCurrentUserID() userID: number,
    @Query() getCourseDto: GetCourseDto,
  ): Promise<ResponseData> {
    return this.courseService.getCoursesByUserID(userID, getCourseDto);
  }

  @Get('top')
  @HttpCode(HttpStatus.OK)
  getCoursesTop(
    @GetCurrentUserID() userID: number,
    // @Query() getCourseDto: GetCourseDto,
  ): Promise<ResponseData> {
    return this.courseService.getCoursesTop();
  }
}
