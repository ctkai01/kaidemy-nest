import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CourseStatus, LectureType } from 'src/constants';
import { ResponseData } from '../../interface/response.interface';
import { CourseRepository } from '../courses/course.repository';
import { CurriculumRepository } from '../curriculum/curriculum.repository';
// import { CurriculumRepository } from './lecture.repository';
import { Question } from 'src/entities/question.entity';
import { LectureRepository } from '../lecture/lecture.repository';
import { CreateQuestionDto, UpdateQuestionDto } from './dto';
import { QuestionRepository } from './question.repository';

@Injectable()
export class QuestionService {
  private logger = new Logger(QuestionService.name);
  constructor(
    private readonly curriculumRepository: CurriculumRepository,
    private readonly courseRepository: CourseRepository,
    private readonly lectureRepository: LectureRepository,
    private readonly questionRepository: QuestionRepository,
  ) {}
  async createQuestion(
    createQuestionDto: CreateQuestionDto,
    userID: number,
  ): Promise<ResponseData> {
    const { title, lectureID } = createQuestionDto;

    // Check lecture exist
    const lecture = await this.lectureRepository.getLectureById(lectureID);

    if (!lecture) {
      throw new NotFoundException('Lecture not found');
    }

    if (lecture.type !== LectureType.QUIZ) {
      throw new BadRequestException('Must quiz');
    }

    // Check curriculum exist
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
    const question: Question = {
      title,
      lectureId: lectureID,
    };
    const questionCreate = await this.questionRepository.save(question);

    // Update status
    const course = curriculum.course;
    course.reviewStatus = CourseStatus.REVIEW_INIT;

    await this.courseRepository.save(course);

    const responseData: ResponseData = {
      message: 'Create question successfully!',
      data: questionCreate,
    };

    return responseData;
  }

  async updateQuestion(
    updateQuestionDto: UpdateQuestionDto,
    userID: number,
    questionID: number,
  ): Promise<ResponseData> {
    const { title } = updateQuestionDto;

    // Check question exist
    const question = await this.questionRepository.getQuestionById(questionID);

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    // Check lecture exist
    const lecture = await this.lectureRepository.getLectureById(
      question.lectureId,
    );

    if (!lecture) {
      throw new NotFoundException('Lecture not found');
    }

    if (lecture.type !== LectureType.QUIZ) {
      throw new BadRequestException('Must quiz');
    }

    // Check curriculum exist
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

    question.title = title;

    await this.questionRepository.save(question);

    // Update status
    const course = curriculum.course;
    course.reviewStatus = CourseStatus.REVIEW_INIT;

    await this.courseRepository.save(course);

    const responseData: ResponseData = {
      message: 'Update question successfully!',
      data: question,
    };

    return responseData;
  }

  async deleteQuestion(
    userID: number,
    questionID: number,
  ): Promise<ResponseData> {

    // Check question exist
    const question = await this.questionRepository.getQuestionById(questionID);

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    // Check lecture exist
    const lecture = await this.lectureRepository.getLectureById(
      question.lectureId,
    );

    if (!lecture) {
      throw new NotFoundException('Lecture not found');
    }

    if (lecture.type !== LectureType.QUIZ) {
      throw new BadRequestException('Must quiz');
    }

    // Check curriculum exist
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

    await this.questionRepository.delete(questionID);

    // Update status
    const course = curriculum.course;
    course.reviewStatus = CourseStatus.REVIEW_INIT;

    await this.courseRepository.save(course);

    const responseData: ResponseData = {
      message: 'Delete question successfully!',
    };

    return responseData;
  }
}
