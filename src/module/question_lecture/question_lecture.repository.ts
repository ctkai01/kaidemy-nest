import {
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import { EntityRepository, Repository } from 'typeorm';
import _ = require('lodash');
import { Answer, Curriculum, QuestionLecture, Report, TopicLearning } from 'src/entities';
import { Lecture } from 'src/entities/lecture.entity';
import { Question } from 'src/entities/question.entity';

@EntityRepository(QuestionLecture)
export class QuestionLectureRepository extends Repository<QuestionLecture> {
  private logger = new Logger(QuestionLecture.name);

  constructor(
    @InjectRepository(QuestionLecture)
    private questionLectureRepository: Repository<QuestionLecture>,
  ) {
    super(
      questionLectureRepository.target,
      questionLectureRepository.manager,
      questionLectureRepository.queryRunner,
    );
  }
  async createQuestionLecture(
    questionLectureData: Partial<QuestionLecture>,
  ): Promise<QuestionLecture> {
    try {
      const questionLecture = this.create(questionLectureData);
      const questionLectureCreated = await this.save(questionLecture);

      return questionLectureCreated;
    } catch (err) {
      this.logger.error(err);

      throw new InternalServerErrorException('Something error query');
    }
  }

  async getQuestionLectureByIdWithRelation(
    questionLectureID: number,
    relations: string[],
  ): Promise<QuestionLecture | null> {
    const questionLecture = await this.findOne({
      where: {
        id: questionLectureID,
      },
      relations,
    });
    return questionLecture;
  }

  async getQuestionLectureById(
    questionLectureID: number,
  ): Promise<QuestionLecture | null> {
    const questionLecture = await this.findOne({
      where: {
        id: questionLectureID,
      },
    });
    return questionLecture;
  }
 
}
