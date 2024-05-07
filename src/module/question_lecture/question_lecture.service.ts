import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PageMetaDto } from 'src/common/paginate/page-meta.dto';
import { PageDto } from 'src/common/paginate/paginate.dto';
import { QuestionLectureAuthorShow, QuestionLectureShow } from 'src/constants';
import { QuestionLecture } from 'src/entities';
import { ResponseData } from '../../interface/response.interface';
import { CourseRepository } from '../courses/course.repository';
import { CurriculumRepository } from '../curriculum/curriculum.repository';
import { LearningRepository } from '../learning/learning.repository';
// import { CurriculumRepository } from './lecture.repository';
import { LectureRepository } from '../lecture/lecture.repository';
import { QuestionRepository } from '../question/question.repository';
import { UserRepository } from '../user/user.repository';
import { CreateQuestionLectureDto } from './dto';
import { GetQuestionLectureDto } from './dto/get-question-lecture-dto';
import { UpdateQuestionLectureDto } from './dto/update-question-lecture-dto';
import { QuestionLectureRepository } from './question_lecture.repository';

@Injectable()
export class QuestionLectureService {
  private logger = new Logger(QuestionLectureService.name);
  constructor(
    private readonly curriculumRepository: CurriculumRepository,
    private readonly courseRepository: CourseRepository,
    private readonly lectureRepository: LectureRepository,
    private readonly questionRepository: QuestionRepository,
    private readonly userRepository: UserRepository,
    private readonly learningRepository: LearningRepository,
    private readonly questionLectureRepository: QuestionLectureRepository,
  ) {}
  async createQuestionLecture(
    createQuestionLectureDto: CreateQuestionLectureDto,
    userID: number,
  ): Promise<ResponseData> {
    const { courseID, description, lectureID, title } =
      createQuestionLectureDto;

    const course = await this.courseRepository.getCourseByIDWithRelation(
      courseID,
      ['curriculums'],
    );

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const lecture = await this.lectureRepository.getLectureByIdWithRelation(
      lectureID,
      ['curriculum.course'],
    );

    if (!lecture) {
      throw new NotFoundException('Lecture not found');
    }

    if (lecture.curriculum.course.id !== course.id) {
      throw new BadRequestException('Lecture not belong to course');
    }
    const learning = await this.learningRepository.getLearningByIDCourseUser(
      courseID,
      userID,
    );

    if (!learning) {
      throw new BadRequestException('Course not belong to user');
    }

    // Create question lecture

    console.log('Course: ', course);
    console.log('lecture: ', lecture);

    const user = await this.userRepository.getByID(userID);

    const dataQuestionLecture: Partial<QuestionLecture> = {
      courseId: courseID,
      description: description,
      lectureId: lectureID,
      title,
      userId: userID,
    };

    const questionLectureCreated =
      await this.questionLectureRepository.createQuestionLecture(
        dataQuestionLecture,
      );

    const questionLectureCreatedShow: QuestionLectureShow = {
      id: questionLectureCreated.id,
      courseID: questionLectureCreated.courseId,
      lectureID: questionLectureCreated.lectureId,
      createdAt: questionLectureCreated.createdAt,
      updatedAt: questionLectureCreated.updatedAt,
      description: questionLectureCreated.description,
      title: questionLectureCreated.title,
      user: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
      },
      totalAnswer: 0,
    };

    const responseData: ResponseData = {
      message: 'Create question lecture successfully!',
      data: questionLectureCreatedShow,
    };

    return responseData;
  }

  async updateQuestionLecture(
    updateQuestionLectureDto: UpdateQuestionLectureDto,
    userID: number,
    questionLectureID: number,
  ): Promise<ResponseData> {
    const { title, description } = updateQuestionLectureDto;

    const questionLecture =
      await this.questionLectureRepository.getQuestionLectureByIdWithRelation(
        questionLectureID,
        ['user'],
      );

    if (!questionLecture) {
      throw new NotFoundException('Question lecture not found');
    }

    if (questionLecture.userId !== userID) {
      throw new ForbiddenException('');
    }
    questionLecture.title = title;
    questionLecture.description = description;

    await this.questionLectureRepository.save(questionLecture);

    const questionLectureShow: QuestionLectureShow = {
      id: questionLecture.id,
      courseID: questionLecture.courseId,
      lectureID: questionLecture.lectureId,
      createdAt: questionLecture.createdAt,
      updatedAt: questionLecture.updatedAt,
      description: questionLecture.description,
      title: questionLecture.title,
      user: {
        id: questionLecture.user.id,
        name: questionLecture.user.name,
        avatar: questionLecture.user.avatar,
      },
      totalAnswer: 0,
    };
    const responseData: ResponseData = {
      message: 'Update question lecture successfully!',
      data: questionLectureShow,
    };

    return responseData;
  }

  async deleteQuestionLecture(
    userID: number,
    questionLectureID: number,
  ): Promise<ResponseData> {
    const questionLecture =
      await this.questionLectureRepository.getQuestionLectureById(
        questionLectureID,
      );

    if (!questionLecture) {
      throw new NotFoundException('Question lecture not found');
    }

    if (questionLecture.userId !== userID) {
      throw new ForbiddenException('');
    }

    this.questionLectureRepository.delete(questionLectureID);

    const responseData: ResponseData = {
      message: 'Delete question lecture successfully!',
    };

    return responseData;
  }

  async getQuestionLectures(
    getQuestionLectureDto: GetQuestionLectureDto,
    userID: number,
  ): Promise<ResponseData> {
    const { order, skip, size, page, courseID, search } = getQuestionLectureDto;
    const queryBuilder =
      this.questionLectureRepository.createQueryBuilder('question_lectures');
    queryBuilder
      .orderBy('question_lectures.createdAt', order)
      .leftJoinAndSelect('question_lectures.user', 'user');

    if (search) {
      queryBuilder.andWhere(function () {
        this.where('question_lectures.title LIKE :searchQuery', {
          searchQuery: `%${search}%`,
        }).orWhere('question_lectures.description LIKE :searchQuery', {
          searchQuery: `%${search}%`,
        });
      });
    }

    if (courseID) {
      queryBuilder.where('question_lectures.courseId = :courseId', {
        courseId: courseID,
      });
    }
    const itemCount = await queryBuilder.getCount();

    queryBuilder.skip(skip).take(skip);
    const { entities: questionLectures } =
      await queryBuilder.getRawAndEntities();

    const questionLecturesShow: QuestionLectureShow[] = [];

    questionLectures.forEach((questionLecture) => {
      questionLecturesShow.push({
        courseID: questionLecture.courseId,
        lectureID: questionLecture.lectureId,
        createdAt: questionLecture.createdAt,
        updatedAt: questionLecture.updatedAt,
        description: questionLecture.description,
        title: questionLecture.title,
        id: questionLecture.id,
        user: {
          id: questionLecture.user.id,
          name: questionLecture.user.name,
          avatar: questionLecture.user.avatar,
        },
        totalAnswer: 0,
      });
    });

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: {
        skip,
        order,
        page,
        size,
      },
    });

    const data = new PageDto(questionLecturesShow, pageMetaDto);

    const responseData: ResponseData = {
      message: 'Get question lecture successfully!',
      data,
    };

    return responseData;
  }

  async getQuestionLecturesAuthor(
    getQuestionLectureDto: GetQuestionLectureDto,
    userID: number,
  ): Promise<ResponseData> {
    const { order, skip, size, page, courseID, search } = getQuestionLectureDto;

    const queryBuilder =
      this.questionLectureRepository.createQueryBuilder('question_lectures');
    queryBuilder
      .orderBy('question_lectures.createdAt', order)

      .leftJoinAndSelect('question_lectures.user', 'user')
      .leftJoinAndSelect('question_lectures.course', 'course');

    if (search) {
      queryBuilder.andWhere(function () {
        this.where('question_lectures.title LIKE :searchQuery', {
          searchQuery: `%${search}%`,
        }).orWhere('question_lectures.description LIKE :searchQuery', {
          searchQuery: `%${search}%`,
        });
      });
    }
      console.log('UUU', courseID);

    if (courseID) {
      // Check course belong to user
      const course = await this.courseRepository.getCourseByID(courseID);

      if (!course) {
        throw new NotFoundException('Course not found');
      }

      if (course.userID != userID) {
        throw new ForbiddenException();
      }
      queryBuilder.where('question_lectures.courseId = :courseId', {
        courseId: courseID,
      });
    } else {
      const courses = await this.courseRepository.find({
        where: { userID },
        select: ['id'],
      });

      const courseIdsByAuthor = courses.map((course) => course.id);
      queryBuilder.where('question_lectures.courseId IN (:...courseIds)', {
        courseIdsByAuthor,
      });
    }
    const itemCount = await queryBuilder.getCount();

    queryBuilder.skip(skip).take(skip);
    const { entities: questionLectures } =
      await queryBuilder.getRawAndEntities();

    const questionLecturesAuthorShow: QuestionLectureAuthorShow[] = [];

    questionLectures.forEach((questionLecture) => {
      questionLecturesAuthorShow.push({
        course: {
          id: questionLecture.course.id,
          title: questionLecture.course.title,
          image: questionLecture.course.image,
        },
        lectureID: questionLecture.lectureId,
        createdAt: questionLecture.createdAt,
        updatedAt: questionLecture.updatedAt,
        description: questionLecture.description,
        title: questionLecture.title,
        id: questionLecture.id,
        user: {
          id: questionLecture.user.id,
          name: questionLecture.user.name,
          avatar: questionLecture.user.avatar,
        },
        totalAnswer: 0,
      });
    });

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: {
        skip,
        order,
        page,
        size,
        search
      },
    });

    const data = new PageDto(questionLecturesAuthorShow, pageMetaDto);

    const responseData: ResponseData = {
      message: 'Get question lecture author successfully!',
      data,
    };

    return responseData;
  }
}
