import {
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import { EntityRepository, Repository } from 'typeorm';
import _ = require('lodash');
import { Curriculum } from 'src/entities';
import { Lecture } from 'src/entities/lecture.entity';
import { Question } from 'src/entities/question.entity';

@EntityRepository(Question)
export class QuestionRepository extends Repository<Question> {
  private logger = new Logger(QuestionRepository.name);

  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
  ) {
    super(
      questionRepository.target,
      questionRepository.manager,
      questionRepository.queryRunner,
    );
  }
  async createQuestion(questionData: Question): Promise<Question> {
    try {
      const question = this.create(questionData);
      const questionCreated = await this.save(question);

      return questionCreated;
    } catch (err) {
      this.logger.error(err);

      throw new InternalServerErrorException('Something error query');
    }
  }

  async getQuestionById(questionID: number): Promise<Question | null> {
    const question = await this.findOne({
      where: {
        id: questionID,
      },
    });
    return question;
  }

  async getQuestionByIdWithRelation(
    questionID: number,
    relations: string[],
  ): Promise<Question | null> {
    const question = await this.findOne({
      where: {
        id: questionID,
      },
      relations: relations,
    });
    return question;
  }

}
