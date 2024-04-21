import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cart, Learning } from 'src/entities';
import { ResponseData } from '../../interface/response.interface';
import { CourseRepository } from '../courses/course.repository';
import { CurriculumRepository } from '../curriculum/curriculum.repository';
// import { CurriculumRepository } from './lecture.repository';
import { LectureRepository } from '../lecture/lecture.repository';
import { PriceRepository } from '../price/price.repository';
import { UserRepository } from '../user/user.repository';
import { LearningRepository } from './learning.repository';
import { UpdateLearningDto } from './dto';
import { CourseUtil, LearningShow } from 'src/constants';
import { GetLearningDto } from './dto/get-learning-dto';
@Injectable()
export class LearningService {
  private logger = new Logger(LearningService.name);
  constructor(
    private readonly curriculumRepository: CurriculumRepository,
    private readonly userRepository: UserRepository,
    private readonly courseRepository: CourseRepository,
    private readonly lectureRepository: LectureRepository,
    private readonly learningRepository: LearningRepository,
    private readonly priceRepository: PriceRepository,
  ) {}
  async updateLearning(
    userID: number,
    learningID: number,
    updateLearningDto: UpdateLearningDto,
  ): Promise<ResponseData> {
    const { comment, process, starCount, type } = updateLearningDto;
    const learning = await this.learningRepository.getLearningByID(learningID);

    if (!learning) {
      throw new NotFoundException('Learning not found');
    }

    if (userID !== learning.userId) {
      throw new ForbiddenException('user not permission');
    }

    learning.process = process;
    learning.comment = comment;
    learning.starCount = starCount;
    learning.type = type;

    await this.learningRepository.save(learning);

    const responseData: ResponseData = {
      message: 'Update learning successfully!',
      data: learning,
    };

    return responseData;
  }

  async createWishCourse(
    userID: number,
    courseID: number,
  ): Promise<ResponseData> {
    const course = this.courseRepository.getCourseByID(courseID);

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check whether buy course or not ?
    const learning = await this.learningRepository.getLearningByIDCourseUser(
      courseID,
      userID,
    );

    if (learning) {
      throw new NotFoundException('You are purchased this course');
    }

    const learningCreate: Learning = {
      userId: userID,
      courseId: courseID,
      type: CourseUtil.WISH_LIST_TYPE,
    };

    await this.learningRepository.save(learningCreate);

    // Get learning response
    const learningData = await this.learningRepository.getLearningByIDRelation(
      learningCreate.id,
      [
        'course.level',
        'course.price',
        'course.subCategory',
        'course.category',
        'course.user',
      ],
    );
    console.log('learningData: ', learningData);
    const learningShow: LearningShow = {
      id: learningData.id,
      courseID: learningData.courseId,
      type: learningData.type,
      userID: learningData.userId,
      comment: learningData.comment,
      process: learningData.process,
      startCount: learningData.starCount,
      course: {
        author: {
          id: learningData.course.user.id,
          name: learningData.course.user.name,
        },
        id: learningData.course.id,
        image: learningData.course.image,
        level: learningData.course.level,
        category: learningData.course.category,
        subCategory: learningData.course.subCategory,
        price: learningData.course.price,
        status: learningData.course.status,
        title: learningData.course.title,
      },
    };

    const responseData: ResponseData = {
      message: 'Create wish course successfully!',
      data: learningShow,
    };

    return responseData;
  }

  async deleteWishCourse(
    userID: number,
    learningID: number,
  ): Promise<ResponseData> {
    const learning = await this.learningRepository.getLearningByID(learningID);

    if (!learning) {
      throw new NotFoundException('Wish course not found');
    }

    if (learning.userId !== userID) {
      throw new ForbiddenException('Not permission');
    }

    if (learning.type !== CourseUtil.WISH_LIST_TYPE) {
      throw new BadRequestException('Must wish course');
    }

    await this.learningRepository.delete(learning.id);

    const responseData: ResponseData = {
      message: 'Remove wish course successfully!',
    };

    return responseData;
  }

  async getLearning(
    userID: number,
    getLearningDto: GetLearningDto,
  ): Promise<ResponseData> {
    const queryBuilder = this.learningRepository.createQueryBuilder('learning');
    queryBuilder
      .orderBy('learning.createdAt', getLearningDto.order)
      .leftJoinAndSelect('learning.course', 'course')
      .leftJoinAndSelect('course.curriculums', 'curriculum')
      .leftJoinAndSelect('course.learnings', 'learnings')
      .leftJoinAndSelect('curriculum.lectures', 'lecture')
      .leftJoinAndSelect('lecture.assets', 'asset');

    if (getLearningDto.type) {
      queryBuilder.where('learning.type = :type', {
        type: getLearningDto.type,
      });
    }

    const { entities: learnings } = await queryBuilder.getRawAndEntities();

    console.log('learnings: ', learnings);

    learnings.forEach((learning) => {
      let totalReviewCountStar: number;
      let totalReviewCount: number;
      let totalStudent: number;

      learning.course.learnings.forEach((learningCourse) => {
        if (learningCourse.starCount) {
          totalReviewCountStar += learningCourse.starCount;
          totalReviewCount++;
        }

        if (
          [CourseUtil.STANDARD_TYPE, CourseUtil.ARCHIE].includes(
            learningCourse.type,
          )
        ) {
          totalStudent++;
        }
      });

      let averageReview: number;

      if (totalReviewCount) {
        averageReview = totalReviewCountStar / totalReviewCount;
      }

      let percent: number;
      let markCount: number;
      let totalLecture: number;

      learning.course.curriculums.forEach((curriculum) => {
        totalLecture += curriculum.lectures.length;
      });
    });

    // const learning = await this.learningRepository.getLearningByID(learningID);

    // if (!learning) {
    //   throw new NotFoundException('Wish course not found');
    // }

    // if (learning.userId !== userID) {
    //   throw new ForbiddenException('Not permission');
    // }

    // if (learning.type !== CourseUtil.WISH_LIST_TYPE) {
    //   throw new BadRequestException('Must wish course');
    // }

    // await this.learningRepository.delete(learning.id);

    const responseData: ResponseData = {
      message: 'Remove wish course successfully!',
    };

    return responseData;
  }
}
