import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CourseStatus } from 'src/constants';
import { Curriculum } from 'src/entities';
import { ResponseData } from '../../interface/response.interface';
import { CourseRepository } from '../courses/course.repository';
import { CurriculumRepository } from './curriculum.repository';
import { CreateCurriculumDto, UpdateCurriculumDto } from './dto';

@Injectable()
export class CurriculumService {
  private logger = new Logger(CurriculumService.name);
  constructor(
    private readonly curriculumRepository: CurriculumRepository,
    private readonly courseRepository: CourseRepository,
  ) {}
  async createCurriculum(
    createCurriculumDto: CreateCurriculumDto,
    userID: number,
  ): Promise<ResponseData> {
    const { title, description, courseID } = createCurriculumDto;

    // Check course exist
    const course = await this.courseRepository.getCourseByID(courseID);
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check permission author course
    if (userID !== course.userID) {
      throw new ForbiddenException('Not author of course');
    }
    const curriculum: Curriculum = {
      title,
      description,
      courseId: courseID,
    };

    const curriculumCreate =
      await this.curriculumRepository.createCurriculum(curriculum);

    course.reviewStatus = CourseStatus.REVIEW_INIT;

    await this.courseRepository.save(course);

    const responseData: ResponseData = {
      message: 'Create curriculum successfully!',
      data: curriculumCreate,
    };

    return responseData;
  }

  async updateCurriculum(
    updateCurriculumDto: UpdateCurriculumDto,
    userID: number,
    curriculumID: number,
  ): Promise<ResponseData> {
    const { title, description } = updateCurriculumDto;

    // Check curriculum exist

    const curriculum =
      await this.curriculumRepository.getCurriculumByIdWithRelation(
        curriculumID,
        ['course'],
      );
    if (!curriculum) {
      throw new NotFoundException('Curriculum not found');
    }

    // Check permission author course
    if (userID !== curriculum.course.userID) {
      throw new ForbiddenException('Not author of course');
    }

    curriculum.title = title;
    curriculum.description = description || '';

    await this.curriculumRepository.save(curriculum);

    curriculum.course.reviewStatus = CourseStatus.REVIEW_INIT;

    await this.courseRepository.save(curriculum.course);

    // delete curriculum.course;
    const responseData: ResponseData = {
      message: 'Update curriculum successfully!',
      data: curriculum,
    };

    return responseData;
  }

  async deleteCurriculum(
    curriculumID: number,
    userID: number,
  ): Promise<ResponseData> {
    // Check curriculum exist

    const curriculum =
      await this.curriculumRepository.getCurriculumByIdWithRelation(
        curriculumID,
        ['course'],
      );
    if (!curriculum) {
      throw new NotFoundException('Curriculum not found');
    }

    // Check permission author course
    if (userID !== curriculum.course.userID) {
      throw new ForbiddenException('Not author of course');
    }

    await this.curriculumRepository.delete(curriculumID);

    curriculum.course.reviewStatus = CourseStatus.REVIEW_INIT;

    await this.courseRepository.save(curriculum.course);

    const responseData: ResponseData = {
      message: 'Delete curriculum successfully!',
    };

    return responseData;
  }
}
