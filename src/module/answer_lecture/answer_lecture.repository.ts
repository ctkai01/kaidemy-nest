import {
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import { EntityRepository, Repository } from 'typeorm';
import _ = require('lodash');
import { Answer, AnswerLecture, Curriculum, QuestionLecture, Report, TopicLearning } from 'src/entities';
import { Lecture } from 'src/entities/lecture.entity';
import { Question } from 'src/entities/question.entity';

@EntityRepository(AnswerLecture)
export class AnswerLectureRepository extends Repository<AnswerLecture> {
  private logger = new Logger(AnswerLecture.name);

  constructor(
    @InjectRepository(AnswerLecture)
    private answerLectureRepository: Repository<AnswerLecture>,
  ) {
    super(
      answerLectureRepository.target,
      answerLectureRepository.manager,
      answerLectureRepository.queryRunner,
    );
  }
  async createAnswerLecture(
    answerLectureData: Partial<AnswerLecture>,
  ): Promise<AnswerLecture> {
    try {
      const answerLecture = this.create(answerLectureData);
      const answerLectureCreated = await this.save(answerLecture);

      return answerLectureCreated;
    } catch (err) {
      this.logger.error(err);

      throw new InternalServerErrorException('Something error query');
    }
  }

  async getAnswerLectureByIdWithRelation(
    answerLectureID: number,
    relations: string[],
  ): Promise<AnswerLecture | null> {
    const answerLecture = await this.findOne({
      where: {
        id: answerLectureID,
      },
      relations,
    });
    return answerLecture;
  }

  async getAnswerLectureById(
    answerLectureID: number,
  ): Promise<AnswerLecture | null> {
    const answerLecture = await this.findOne({
      where: {
        id: answerLectureID,
      },
    });
    return answerLecture;
  }
}
