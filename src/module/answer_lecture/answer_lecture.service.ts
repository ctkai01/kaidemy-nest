import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AnswerLectureShow } from 'src/constants';
import { AnswerLecture } from 'src/entities';
import { ResponseData } from '../../interface/response.interface';
import { CourseRepository } from '../courses/course.repository';
import { CurriculumRepository } from '../curriculum/curriculum.repository';
import { LearningRepository } from '../learning/learning.repository';
// import { CurriculumRepository } from './lecture.repository';
import { LectureRepository } from '../lecture/lecture.repository';
import { QuestionRepository } from '../question/question.repository';
import { QuestionLectureRepository } from '../question_lecture/question_lecture.repository';
import { UserRepository } from '../user/user.repository';
import { AnswerLectureRepository } from './answer_lecture.repository';
import { CreateAnswerLectureDto } from './dto';
import { UpdateAnswerLectureDto } from './dto/update-answer-lecture-dto';

@Injectable()
export class AnswerLectureService {
  private logger = new Logger(AnswerLectureService.name);
  constructor(
    private readonly curriculumRepository: CurriculumRepository,
    private readonly courseRepository: CourseRepository,
    private readonly lectureRepository: LectureRepository,
    private readonly questionRepository: QuestionRepository,
    private readonly userRepository: UserRepository,
    private readonly learningRepository: LearningRepository,
    private readonly answerLectureRepository: AnswerLectureRepository,
    private readonly questionLectureRepository: QuestionLectureRepository,
  ) {}
  async createAnswerLecture(
    createAnswerLectureDto: CreateAnswerLectureDto,
    userID: number,
  ): Promise<ResponseData> {
    const { answer, questionLectureID } = createAnswerLectureDto;

    const questionLecture =
      await this.questionLectureRepository.getQuestionLectureById(
        questionLectureID,
      );

    if (!questionLecture) {
      throw new NotFoundException('Question lecture not found');
    }

    const dataAnswerLecture: Partial<AnswerLecture> = {
      answer,
      questionLectureId: questionLectureID,
      userId: userID,
    };

    const answerLectureCreated =
      await this.answerLectureRepository.createAnswerLecture(dataAnswerLecture);

    const user = await this.userRepository.getByID(userID);

    const answerLectureCreatedShow: AnswerLectureShow = {
      id: answerLectureCreated.id,
      answer: answerLectureCreated.answer,
      questionLectureID: answerLectureCreated.questionLectureId,
      createdAt: answerLectureCreated.createdAt,
      updatedAt: answerLectureCreated.updatedAt,
      user: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
      },
    };

    const responseData: ResponseData = {
      message: 'Create answer lecture successfully!',
      data: answerLectureCreatedShow,
    };

    return responseData;
  }

  async updateAnswerLecture(
    updateAnswerLectureDto: UpdateAnswerLectureDto,
    userID: number,
    answerLectureID: number,
  ): Promise<ResponseData> {
    const { answer } = updateAnswerLectureDto;

    const answerLecture =
      await this.answerLectureRepository.getAnswerLectureByIdWithRelation(
        answerLectureID,
        ['user'],
      );

    if (!answerLecture) {
      throw new NotFoundException('Answer lecture not found');
    }

    if (answerLecture.userId !== userID) {
      throw new ForbiddenException('');
    }
    answerLecture.answer = answer;
    await this.answerLectureRepository.save(answerLecture);

    const answerLectureUpdatedShow: AnswerLectureShow = {
      id: answerLecture.id,
      answer: answerLecture.answer,
      questionLectureID: answerLecture.questionLectureId,
      createdAt: answerLecture.createdAt,
      updatedAt: answerLecture.updatedAt,
      user: {
        id: answerLecture.user.id,
        name: answerLecture.user.name,
        avatar: answerLecture.user.avatar,
      },
    };
    const responseData: ResponseData = {
      message: 'Update answer lecture successfully!',
      data: answerLectureUpdatedShow,
    };

    return responseData;
  }

  // async deleteQuestionLecture(
  //   userID: number,
  //   questionLectureID: number,
  // ): Promise<ResponseData> {
  //   const questionLecture =
  //     await this.questionLectureRepository.getQuestionLectureById(
  //       questionLectureID,
  //     );

  //   if (!questionLecture) {
  //     throw new NotFoundException('Question lecture not found');
  //   }

  //   if (questionLecture.userId !== userID) {
  //     throw new ForbiddenException('');
  //   }

  //   this.questionLectureRepository.delete(questionLectureID);

  //   const responseData: ResponseData = {
  //     message: 'Delete question lecture successfully!',
  //   };

  //   return responseData;
  // }

  // async getQuestionLectures(
  //   getQuestionLectureDto: GetQuestionLectureDto,
  //   userID: number,
  // ): Promise<ResponseData> {
  //   const { order, skip, size, page, courseID, search } = getQuestionLectureDto;
  //   const queryBuilder =
  //     this.questionLectureRepository.createQueryBuilder('question_lectures');
  //   queryBuilder
  //     .orderBy('question_lectures.createdAt', order)
  //     .leftJoinAndSelect('question_lectures.user', 'user');

  //   if (search) {
  //     queryBuilder.andWhere(function () {
  //       this.where('question_lectures.title LIKE :searchQuery', {
  //         searchQuery: `%${search}%`,
  //       }).orWhere('question_lectures.description LIKE :searchQuery', {
  //         searchQuery: `%${search}%`,
  //       });
  //     });
  //   }

  //   if (courseID) {
  //     queryBuilder.where('question_lectures.courseId = :courseId', {
  //       courseId: courseID,
  //     });
  //   }
  //   const itemCount = await queryBuilder.getCount();

  //   queryBuilder.skip(skip).take(skip);
  //   const { entities: questionLectures } =
  //     await queryBuilder.getRawAndEntities();

  //   const questionLecturesShow: QuestionLectureShow[] = [];

  //   questionLectures.forEach((questionLecture) => {
  //     questionLecturesShow.push({
  //       courseID: questionLecture.courseId,
  //       lectureID: questionLecture.lectureId,
  //       createdAt: questionLecture.createdAt,
  //       updatedAt: questionLecture.updatedAt,
  //       description: questionLecture.description,
  //       title: questionLecture.title,
  //       id: questionLecture.id,
  //       user: {
  //         id: questionLecture.user.id,
  //         name: questionLecture.user.name,
  //         avatar: questionLecture.user.avatar,
  //       },
  //       totalAnswer: 0,
  //     });
  //   });

  //   const pageMetaDto = new PageMetaDto({
  //     itemCount,
  //     pageOptionsDto: {
  //       skip,
  //       order,
  //       page,
  //       size,
  //     },
  //   });

  //   const data = new PageDto(questionLecturesShow, pageMetaDto);

  //   const responseData: ResponseData = {
  //     message: 'Get question lecture successfully!',
  //     data,
  //   };

  //   return responseData;
  // }

  // async getQuestionLecturesAuthor(
  //   getQuestionLectureDto: GetQuestionLectureDto,
  //   userID: number,
  // ): Promise<ResponseData> {
  //   const { order, skip, size, page, courseID, search } = getQuestionLectureDto;

  //   const queryBuilder =
  //     this.questionLectureRepository.createQueryBuilder('question_lectures');
  //   queryBuilder
  //     .orderBy('question_lectures.createdAt', order)

  //     .leftJoinAndSelect('question_lectures.user', 'user')
  //     .leftJoinAndSelect('question_lectures.course', 'course');

  //   if (search) {
  //     queryBuilder.andWhere(function () {
  //       this.where('question_lectures.title LIKE :searchQuery', {
  //         searchQuery: `%${search}%`,
  //       }).orWhere('question_lectures.description LIKE :searchQuery', {
  //         searchQuery: `%${search}%`,
  //       });
  //     });
  //   }
  //   console.log('UUU', courseID);

  //   if (courseID) {
  //     // Check course belong to user
  //     const course = await this.courseRepository.getCourseByID(courseID);

  //     if (!course) {
  //       throw new NotFoundException('Course not found');
  //     }

  //     if (course.userID != userID) {
  //       throw new ForbiddenException();
  //     }
  //     queryBuilder.where('question_lectures.courseId = :courseId', {
  //       courseId: courseID,
  //     });
  //   } else {
  //     const courses = await this.courseRepository.find({
  //       where: { userID },
  //       select: ['id'],
  //     });

  //     const courseIdsByAuthor = courses.map((course) => course.id);
  //     queryBuilder.where('question_lectures.courseId IN (:...courseIds)', {
  //       courseIdsByAuthor,
  //     });
  //   }
  //   const itemCount = await queryBuilder.getCount();

  //   queryBuilder.skip(skip).take(skip);
  //   const { entities: questionLectures } =
  //     await queryBuilder.getRawAndEntities();

  //   const questionLecturesAuthorShow: QuestionLectureAuthorShow[] = [];

  //   questionLectures.forEach((questionLecture) => {
  //     questionLecturesAuthorShow.push({
  //       course: {
  //         id: questionLecture.course.id,
  //         title: questionLecture.course.title,
  //         image: questionLecture.course.image,
  //       },
  //       lectureID: questionLecture.lectureId,
  //       createdAt: questionLecture.createdAt,
  //       updatedAt: questionLecture.updatedAt,
  //       description: questionLecture.description,
  //       title: questionLecture.title,
  //       id: questionLecture.id,
  //       user: {
  //         id: questionLecture.user.id,
  //         name: questionLecture.user.name,
  //         avatar: questionLecture.user.avatar,
  //       },
  //       totalAnswer: 0,
  //     });
  //   });

  //   const pageMetaDto = new PageMetaDto({
  //     itemCount,
  //     pageOptionsDto: {
  //       skip,
  //       order,
  //       page,
  //       size,
  //       search,
  //     },
  //   });

  //   const data = new PageDto(questionLecturesAuthorShow, pageMetaDto);

  //   const responseData: ResponseData = {
  //     message: 'Get question lecture author successfully!',
  //     data,
  //   };

  //   return responseData;
  // }
}
