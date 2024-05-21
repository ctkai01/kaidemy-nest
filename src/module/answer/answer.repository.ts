import {
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import { EntityRepository, Repository } from 'typeorm';
import _ = require('lodash');
import { Answer, Curriculum } from 'src/entities';
import { Lecture } from 'src/entities/lecture.entity';
import { Question } from 'src/entities/question.entity';

@EntityRepository(Answer)
export class AnswerRepository extends Repository<Answer> {
  private logger = new Logger(AnswerRepository.name);

  constructor(
    @InjectRepository(Answer)
    private answerRepository: Repository<Answer>,
  ) {
    super(
      answerRepository.target,
      answerRepository.manager,
      answerRepository.queryRunner,
    );
  }
  async createAnswer(answerData: Answer): Promise<Answer> {
    try {
      const answer = this.create(answerData);
      const answerCreated = await this.save(answer);

      return answerCreated;
    } catch (err) {
      this.logger.error(err);

      throw new InternalServerErrorException('Something error query');
    }
  }

  async getAnswerById(answerID: number): Promise<Answer | null> {
    const answer = await this.findOne({
      where: {
        id: answerID,
      },
    });
    return answer;
  }
}
