import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ResponseData } from '../../interface/response.interface';
import { CourseRepository } from '../courses/course.repository';
import { CurriculumRepository } from '../curriculum/curriculum.repository';
// import { CurriculumRepository } from './lecture.repository';
import { LectureRepository } from '../lecture/lecture.repository';
import { AnswerRepository } from './answer.repository';
import { CreateAnswerDto, UpdateAnswerDto } from './dto';
import { QuestionRepository } from '../question/question.repository';
import { CourseStatus, LectureType } from 'src/constants';
import { Answer } from 'src/entities';

@Injectable()
export class AnswerService {
  private logger = new Logger(AnswerService.name);
  constructor(
    private readonly curriculumRepository: CurriculumRepository,
    private readonly courseRepository: CourseRepository,
    private readonly lectureRepository: LectureRepository,
    private readonly questionRepository: QuestionRepository,
    private readonly answerRepository: AnswerRepository,
  ) {}
  async createAnswer(
    createAnswerDto: CreateAnswerDto,
    userID: number,
  ): Promise<ResponseData> {
    const { questionID, answerText, explain, isCorrect } = createAnswerDto;

    // // Check question exist
    const question = await this.questionRepository.getQuestionByIdWithRelation(
      questionID,
      ['answers'],
    );

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    if (question.answers.length >= 6) {
      throw new BadRequestException('Limit answer');
    }

    const lecture = await this.lectureRepository.getLectureById(
      question.lectureId,
    );

    if (!lecture) {
      throw new NotFoundException('Lecture not found');
    }

    if (lecture.type !== LectureType.QUIZ) {
      throw new BadRequestException('Must quiz');
    }

    // // Check curriculum exist
    const curriculum =
      await this.curriculumRepository.getCurriculumByIdWithRelation(
        lecture.curriculumID,
        ['course'],
      );

    if (!curriculum) {
      throw new NotFoundException('Curriculum not found');
    }

    // Check permission author course
    if (userID !== curriculum.course.userID) {
      throw new ForbiddenException('Not author of course');
    }

    const answer: Answer = {
      answerText,
      questionId: questionID,
      explain,
      isCorrect,
    };
    const answerCreate = await this.answerRepository.save(answer);

    // Update status
    const course = curriculum.course;
    course.reviewStatus = CourseStatus.REVIEW_INIT;

    await this.courseRepository.save(course);

    const responseData: ResponseData = {
      message: 'Create answer successfully!',
      data: answerCreate,
    };

    return responseData;
  }

  async updateAnswer(
    updateAnswerDto: UpdateAnswerDto,
    userID: number,
    answerID: number,
  ): Promise<ResponseData> {
    const { questionID, answerText, explain, isCorrect } = updateAnswerDto;
    // Check answer exist
    const answer = await this.answerRepository.getAnswerById(answerID);

    //  Check question exist
    const question = await this.questionRepository.getQuestionById(questionID);

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    const lecture = await this.lectureRepository.getLectureById(
      question.lectureId,
    );

    if (!lecture) {
      throw new NotFoundException('Lecture not found');
    }

    if (lecture.type !== LectureType.QUIZ) {
      throw new BadRequestException('Must quiz');
    }

    //  Check curriculum exist
    const curriculum =
      await this.curriculumRepository.getCurriculumByIdWithRelation(
        lecture.curriculumID,
        ['course'],
      );

    if (!curriculum) {
      throw new NotFoundException('Curriculum not found');
    }

    // Check permission author course
    if (userID !== curriculum.course.userID) {
      throw new ForbiddenException('Not author of course');
    }

    (answer.answerText = answerText),
      (answer.explain = explain || ''),
      (answer.isCorrect = isCorrect || false);

    await this.answerRepository.save(answer);

    // Update course status
    const course = curriculum.course;
    course.reviewStatus = CourseStatus.REVIEW_INIT;

    await this.courseRepository.save(course);

    const responseData: ResponseData = {
      message: 'Update answer successfully!',
      data: answer,
    };

    return responseData;
  }

  async deleteAnswer(
    userID: number,
    answerID: number,
  ): Promise<ResponseData> {
    // Check answer exist
    const answer = await this.answerRepository.getAnswerById(answerID);

    //  Check question exist
    const question = await this.questionRepository.getQuestionById(answer.questionId);

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    const lecture = await this.lectureRepository.getLectureById(
      question.lectureId,
    );

    if (!lecture) {
      throw new NotFoundException('Lecture not found');
    }

    if (lecture.type !== LectureType.QUIZ) {
      throw new BadRequestException('Must quiz');
    }

    //  Check curriculum exist
    const curriculum =
      await this.curriculumRepository.getCurriculumByIdWithRelation(
        lecture.curriculumID,
        ['course'],
      );

    if (!curriculum) {
      throw new NotFoundException('Curriculum not found');
    }

    // Check permission author course
    if (userID !== curriculum.course.userID) {
      throw new ForbiddenException('Not author of course');
    }

    
    await this.answerRepository.delete(answerID);

    // Update course status
    const course = curriculum.course;
    course.reviewStatus = CourseStatus.REVIEW_INIT;

    await this.courseRepository.save(course);

    const responseData: ResponseData = {
      message: 'Delete answer successfully!',
      data: answer,
    };

    return responseData;
  }

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
