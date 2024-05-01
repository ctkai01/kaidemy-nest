import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { QuestionLectureShow } from 'src/constants';
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
      await this.questionLectureRepository.createQuestionLecture(dataQuestionLecture);

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
        avatar: user.avatar
      },
      totalAnswer: 0
    };

    const responseData: ResponseData = {
      message: 'Create question lecture successfully!',
      data: questionLectureCreatedShow,
    };

    return responseData;
  }

  // async getReports(
  //   getReportsDto: GetReportsDto,
  //   userID: number,
  // ): Promise<ResponseData> {
  //   const { order, skip, size } = getReportsDto;
  //   const queryBuilder = this.reportRepository.createQueryBuilder('report');
  //   queryBuilder
  //     .orderBy('report.created_at', order)
  //     .leftJoinAndSelect('report.course', 'course')
  //     .leftJoinAndSelect('report.issueType', 'issueType')
  //     .leftJoinAndSelect('report.user', 'user');

  //   const itemCount = await queryBuilder.getCount();

  //   queryBuilder.skip(skip).take(skip);
  //   const { entities: reports } = await queryBuilder.getRawAndEntities();

  //   const reportsShow: ReportShow[] = [];

  //   reports.forEach((report) => {
  //     reportsShow.push({
  //       id: report.id,
  //       course: {
  //         id: report.course.id,
  //         title: report.course.title,
  //         image: report.course.image,
  //       },
  //       description: report.description,
  //       user: {
  //         id: report.user.id,
  //         name: report.user.name,
  //         avatar: report.user.avatar,
  //       },
  //       issueType: report.issueType,
  //     });
  //   });
  //   const pageMetaDto = new PageMetaDto({
  //     itemCount,
  //     pageOptionsDto: getReportsDto,
  //   });

  //   const data = new PageDto(reportsShow, pageMetaDto);

  //   const responseData: ResponseData = {
  //     message: 'Get reports successfully!',
  //     data,
  //   };

  //   return responseData;
  // }

  // async updateTopicLearning(
  //   updateTopicLearningDto: UpdateTopicLearningDto,
  //   userID: number,
  //   topicLearningID: number,
  // ): Promise<ResponseData> {
  //   const { title, description } = updateTopicLearningDto;

  //   const topicLearning =
  //     await this.topicLearningRepository.getTopicLearningById(topicLearningID);

  //   if (!topicLearning) {
  //     throw new NotFoundException('Topic learning not found');
  //   }

  //   if (topicLearning.userId != userID) {
  //     throw new ForbiddenException();
  //   }

  //   topicLearning.title = title;
  //   topicLearning.description = description;

  //   await this.topicLearningRepository.save(topicLearning);

  //   const responseData: ResponseData = {
  //     message: 'Update topic learning successfully!',
  //     data: topicLearning,
  //   };

  //   return responseData;
  // }

  // async removeTopicLearning(
  //   userID: number,
  //   topicLearningID: number,
  // ): Promise<ResponseData> {
  //   const topicLearning =
  //     await this.topicLearningRepository.getTopicLearningById(topicLearningID);

  //   if (!topicLearning) {
  //     throw new NotFoundException('Topic learning not found');
  //   }

  //   if (topicLearning.userId != userID) {
  //     throw new ForbiddenException();
  //   }

  //   await this.topicLearningRepository.delete(topicLearningID);

  //   const responseData: ResponseData = {
  //     message: 'Delete topic learning successfully!',
  //   };

  //   return responseData;
  // }

  // async addLearningToTopicLearning(
  //   updateTopicLearningDto: CreateLearningTopicLearningDto,
  //   userID: number,
  // ): Promise<ResponseData> {
  //   const { learningID, topicLearningID } = updateTopicLearningDto;

  //   // Check learning
  //   const learning = await this.learningRepository.getLearningByIDRelation(
  //     learningID,
  //     [
  //       'course.user',
  //       'course.category',
  //       'course.subCategory',
  //       'course.level',
  //       'course.price',
  //     ],
  //   );

  //   if (!learning) {
  //     throw new NotFoundException('Learning not found');
  //   }

  //   if (learning.userId !== userID) {
  //     throw new ForbiddenException();
  //   }

  //   if (learning.type !== CourseUtil.STANDARD_TYPE) {
  //     throw new NotFoundException('Cannot add this course learning');
  //   }

  //   // Check topic learning
  //   const topicLearning =
  //     await this.topicLearningRepository.getTopicLearningByIdWithRelation(
  //       topicLearningID,
  //       [
  //         'learnings',
  //         'learnings.course.user',
  //         'learnings.course.category',
  //         'learnings.course.subCategory',
  //         'learnings.course.level',
  //         'learnings.course.price',
  //       ],
  //     );

  //   if (!topicLearning) {
  //     throw new NotFoundException('Topic learning not found');
  //   }

  //   if (topicLearning.userId !== userID) {
  //     throw new ForbiddenException();
  //   }

  //   // Check exist
  //   let checkLearning = topicLearning.learnings.find(
  //     (learning) => learning.id === learningID,
  //   );

  //   if (checkLearning) {
  //     throw new InternalServerErrorException(
  //       'Already added learning to this topic',
  //     );
  //   }
  //   topicLearning.learnings.push(learning);

  //   await this.topicLearningRepository.save(topicLearning);
  //   const learningShows: LearningShow[] = [];
  //   topicLearning.learnings.forEach((learning) => {
  //     console.log('learning.course: ', learning.course);
  //     learningShows.push({
  //       course: {
  //         id: learning.course.id,
  //         author: {
  //           id: learning.course.user.id,
  //           name: learning.course.user.name,
  //         },
  //         category: learning.course.category,
  //         subCategory: learning.course.subCategory,
  //         image: learning.course.image,
  //         level: learning.course.level,
  //         price: learning.course.price,
  //         reviewStatus: learning.course.reviewStatus,
  //         title: learning.course.title,
  //       },
  //       courseID: learning.courseId,
  //       id: learning.id,
  //       type: learning.type,
  //       userID: learning.userId,
  //       comment: learning.comment,
  //       startCount: learning.starCount,
  //     });
  //   });

  //   const topicLearningShow: TopicLearningShow = {
  //     id: topicLearning.id,
  //     learnings: learningShows,
  //     title: topicLearning.title,
  //     userID: topicLearning.userId,
  //     description: topicLearning.description,
  //   };
  //   const responseData: ResponseData = {
  //     message: 'Add learning to topic learning successfully!',
  //     data: topicLearningShow,
  //   };

  //   return responseData;
  // }

  // async removeLearningToTopicLearning(
  //   removeLearningTopicLearningDto: RemoveLearningTopicLearningDto,
  //   userID: number,
  // ): Promise<ResponseData> {
  //   const { learningID, topicLearningID } = removeLearningTopicLearningDto;

  //   // Check learning
  //   const learning = await this.learningRepository.getLearningByID(learningID);

  //   if (!learning) {
  //     throw new NotFoundException('Learning not found');
  //   }

  //   if (learning.userId !== userID) {
  //     throw new ForbiddenException();
  //   }

  //   if (learning.type !== CourseUtil.STANDARD_TYPE) {
  //     throw new NotFoundException('Cannot remove this course learning');
  //   }

  //   // Check topic learning
  //   const topicLearning =
  //     await this.topicLearningRepository.getTopicLearningByIdWithRelation(
  //       topicLearningID,
  //       ['learnings'],
  //     );

  //   if (!topicLearning) {
  //     throw new NotFoundException('Topic learning not found');
  //   }

  //   if (topicLearning.userId !== userID) {
  //     throw new ForbiddenException();
  //   }
  //   // Check exist
  //   let checkLearning = topicLearning.learnings.find(
  //     (learning) => learning.id === learningID,
  //   );

  //   if (!checkLearning) {
  //     throw new InternalServerErrorException(
  //       'This learning not belong to this topic',
  //     );
  //   }

  //   topicLearning.learnings = topicLearning.learnings.filter(
  //     (learning) => learning.id != learningID,
  //   );

  //   await this.topicLearningRepository.save(topicLearning);

  //   const responseData: ResponseData = {
  //     message: 'Remove learning to topic learning successfully!',
  //   };

  //   return responseData;
  // }

  // async getTopicLearning(
  //   getTopicLearningDto: GetTopicLearningDto,
  //   userID: number,
  // ): Promise<ResponseData> {
  //   const { order } = getTopicLearningDto;

  //   const queryBuilder =
  //     this.topicLearningRepository.createQueryBuilder('topic_learnings');
  //   queryBuilder
  //     .where('topic_learnings.user_id = :userId', { userId: userID })
  //     .orderBy('topic_learnings.created_at', order)
  //     .leftJoinAndSelect('topic_learnings.learnings', 'learning')
  //     .leftJoinAndSelect('learning.course', 'course')
  //     .leftJoinAndSelect('course.price', 'price')
  //     .leftJoinAndSelect('course.level', 'level')
  //     .leftJoinAndSelect('course.user', 'user')
  //     .leftJoinAndSelect('course.category', 'category')
  //     .leftJoinAndSelect('course.subCategory', 'subCategory');

  //   const { entities: topicLearnings } = await queryBuilder.getRawAndEntities();
  //   console.log(topicLearnings);

  //   const topicLearningShow: TopicLearningShow[] = [];

  //   topicLearnings.forEach((topicLearning) => {
  //     const learningsShow: LearningShow[] = [];

  //     topicLearning.learnings.forEach((learning) => {
  //       learningsShow.push({
  //         id: learning.id,
  //         courseID: learning.courseId,
  //         type: learning.type,
  //         userID: learning.userId,
  //         startCount: learning.starCount,
  //         comment: learning.comment,
  //         course: {
  //           id: learning.course.id,
  //           author: {
  //             id: learning.course.user.id,
  //             name: learning.course.user.name,
  //           },
  //           image: learning.course.image,
  //           category: learning.course.category,
  //           level: learning.course.level,
  //           price: learning.course.price,
  //           reviewStatus: learning.course.reviewStatus,
  //           subCategory: learning.course.subCategory,
  //           title: learning.course.title,
  //         },
  //       });
  //     });

  //     topicLearningShow.push({
  //       id: topicLearning.id,
  //       title: topicLearning.title,
  //       userID: topicLearning.userId,
  //       description: topicLearning.description,
  //       learnings: learningsShow,
  //     });
  //   });

  //   const responseData: ResponseData = {
  //     message: 'Get topic learnings successfully!',
  //     data: topicLearningShow,
  //   };

  //   return responseData;
  // }
  // async updateAnswer(
  //   updateAnswerDto: UpdateAnswerDto,
  //   userID: number,
  //   answerID: number,
  // ): Promise<ResponseData> {
  //   const { questionID, answerText, explain, isCorrect } = updateAnswerDto;
  //   // Check answer exist
  //   const answer = await this.answerRepository.getAnswerById(answerID);

  //   //  Check question exist
  //   const question = await this.questionRepository.getQuestionById(questionID);

  //   if (!question) {
  //     throw new NotFoundException('Question not found');
  //   }

  //   const lecture = await this.lectureRepository.getLectureById(
  //     question.lectureId,
  //   );

  //   if (!lecture) {
  //     throw new NotFoundException('Lecture not found');
  //   }

  //   if (lecture.type !== LectureType.QUIZ) {
  //     throw new BadRequestException('Must quiz');
  //   }

  //   //  Check curriculum exist
  //   const curriculum =
  //     await this.curriculumRepository.getCurriculumByIdWithRelation(
  //       lecture.curriculumID,
  //       ['course'],
  //     );

  //   if (!curriculum) {
  //     throw new NotFoundException('Curriculum not found');
  //   }

  //   // Check permission author course
  //   if (userID !== curriculum.course.userID) {
  //     throw new ForbiddenException('Not author of course');
  //   }

  //   (answer.answerText = answerText),
  //     (answer.explain = explain || ''),
  //     (answer.isCorrect = isCorrect || false);

  //   await this.answerRepository.save(answer);

  //   // Update course status
  //   const course = curriculum.course;
  //   course.reviewStatus = CourseStatus.REVIEW_INIT;

  //   await this.courseRepository.save(course);

  //   const responseData: ResponseData = {
  //     message: 'Update answer successfully!',
  //     data: answer,
  //   };

  //   return responseData;
  // }

  // async deleteAnswer(userID: number, answerID: number): Promise<ResponseData> {
  //   // Check answer exist
  //   const answer = await this.answerRepository.getAnswerById(answerID);

  //   //  Check question exist
  //   const question = await this.questionRepository.getQuestionById(
  //     answer.questionId,
  //   );

  //   if (!question) {
  //     throw new NotFoundException('Question not found');
  //   }

  //   const lecture = await this.lectureRepository.getLectureById(
  //     question.lectureId,
  //   );

  //   if (!lecture) {
  //     throw new NotFoundException('Lecture not found');
  //   }

  //   if (lecture.type !== LectureType.QUIZ) {
  //     throw new BadRequestException('Must quiz');
  //   }

  //   //  Check curriculum exist
  //   const curriculum =
  //     await this.curriculumRepository.getCurriculumByIdWithRelation(
  //       lecture.curriculumID,
  //       ['course'],
  //     );

  //   if (!curriculum) {
  //     throw new NotFoundException('Curriculum not found');
  //   }

  //   // Check permission author course
  //   if (userID !== curriculum.course.userID) {
  //     throw new ForbiddenException('Not author of course');
  //   }

  //   await this.answerRepository.delete(answerID);

  //   // Update course status
  //   const course = curriculum.course;
  //   course.reviewStatus = CourseStatus.REVIEW_INIT;

  //   await this.courseRepository.save(course);

  //   const responseData: ResponseData = {
  //     message: 'Delete answer successfully!',
  //     data: answer,
  //   };

  //   return responseData;
  // }

  // async deleteQuestion(
  //   userID: number,
  //   questionID: number,
  // ): Promise<ResponseData> {
  //   // Check question exist
  //   const question = await this.questionRepository.getQuestionById(questionID);

  //   if (!question) {
  //     throw new NotFoundException('Question not found');
  //   }

  //   // Check lecture exist
  //   const lecture = await this.lectureRepository.getLectureById(
  //     question.lectureId,
  //   );

  //   if (!lecture) {
  //     throw new NotFoundException('Lecture not found');
  //   }

  //   if (lecture.type !== LectureType.QUIZ) {
  //     throw new BadRequestException('Must quiz');
  //   }

  //   // Check curriculum exist
  //   const curriculum =
  //     await this.curriculumRepository.getCurriculumByIdWithRelation(
  //       lecture.curriculumID,
  //       ['course'],
  //     );

  //   if (!curriculum) {
  //     throw new NotFoundException('Curriculum not found');
  //   }

  //   // Check permission author course
  //   if (userID !== curriculum.course.userID) {
  //     throw new ForbiddenException('Not author of course');
  //   }

  //   await this.questionRepository.delete(questionID);

  //   // Update status
  //   const course = curriculum.course;
  //   course.reviewStatus = CourseStatus.REVIEW_INIT;

  //   await this.courseRepository.save(course);

  //   const responseData: ResponseData = {
  //     message: 'Delete question successfully!',
  //   };

  //   return responseData;
  // }
}
