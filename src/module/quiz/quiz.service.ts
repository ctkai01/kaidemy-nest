import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ResponseData } from '../../interface/response.interface';
import { CourseRepository } from '../courses/course.repository';
import { CurriculumRepository } from '../curriculum/curriculum.repository';
// import { CurriculumRepository } from './lecture.repository';
import { CreateQuizDto } from './dto';
import { LectureRepository } from '../lecture/lecture.repository';
import { Lecture } from 'src/entities';
import { CourseStatus, LectureType } from 'src/constants';
import { UpdateQuizDto } from './dto/update-quiz-dto';

@Injectable()
export class QuizService {
  private logger = new Logger(QuizService.name);
  constructor(
    private readonly curriculumRepository: CurriculumRepository,
    private readonly courseRepository: CourseRepository,
    private readonly lectureRepository: LectureRepository,
  ) {}
  async createQuiz(
    createQuizDto: CreateQuizDto,
    userID: number,
  ): Promise<ResponseData> {
    const { title, curriculumID, description } = createQuizDto;

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

    const quiz: Lecture = {
      title,
      type: LectureType.QUIZ,
      curriculumID,
      description,
    };

    const quizCreate = await this.lectureRepository.createLecture(quiz);

    // // Update status
    const course = curriculum.course;
    course.reviewStatus = CourseStatus.REVIEW_INIT;

    await this.courseRepository.save(course);

    const responseData: ResponseData = {
      message: 'Create quiz successfully!',
      data: quizCreate,
    };

    return responseData;
  }

  async updateQuiz(
    updateQuizDto: UpdateQuizDto,
    userID: number,
    quizID: number,
  ): Promise<ResponseData> {
    const { title, description } = updateQuizDto;

    // Check quiz exist
    const lecture = await this.lectureRepository.getLectureById(quizID);

    if (!lecture) {
      throw new NotFoundException('Quiz not found');
    }

    if (lecture.type !== LectureType.QUIZ) {
      throw new InternalServerErrorException('Should quiz type');
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

    // Update quiz
    lecture.title = title;
    lecture.description = description || '';

    await this.lectureRepository.save(lecture);

    // // Update status
    const course = curriculum.course;
    course.reviewStatus = CourseStatus.REVIEW_INIT;

    await this.courseRepository.save(course);

    const responseData: ResponseData = {
      message: 'Update quiz successfully!',
      data: lecture,
    };

    return responseData;
  }

  async deleteQuiz(userID: number, quizID: number): Promise<ResponseData> {
    // Check quiz exist
    const lecture = await this.lectureRepository.getLectureById(quizID);

    if (!lecture) {
      throw new NotFoundException('Quiz not found');
    }

    if (lecture.type !== LectureType.QUIZ) {
      throw new InternalServerErrorException('Should quiz type');
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

    // // Check permission author course
    if (userID !== curriculum.course.userID) {
      throw new ForbiddenException('Not author of course');
    }
    await this.lectureRepository.delete(quizID);
   
    // Update status
    const course = curriculum.course;
    course.reviewStatus = CourseStatus.REVIEW_INIT;

    await this.courseRepository.save(course);

    const responseData: ResponseData = {
      message: 'Delete quiz successfully!',
    };

    return responseData;
  }
}
