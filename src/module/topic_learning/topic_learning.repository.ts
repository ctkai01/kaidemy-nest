import {
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import { EntityRepository, Repository } from 'typeorm';
import _ = require('lodash');
import { Answer, Curriculum, TopicLearning } from 'src/entities';
import { Lecture } from 'src/entities/lecture.entity';
import { Question } from 'src/entities/question.entity';

@EntityRepository(TopicLearning)
export class TopicLearningRepository extends Repository<TopicLearning> {
  private logger = new Logger(TopicLearningRepository.name);

  constructor(
    @InjectRepository(TopicLearning)
    private topicLearningRepository: Repository<TopicLearning>,
  ) {
    super(
      topicLearningRepository.target,
      topicLearningRepository.manager,
      topicLearningRepository.queryRunner,
    );
  }
  async createTopicLearning(
    topicLearningData: Partial<TopicLearning>,
  ): Promise<TopicLearning> {
    try {
      const topicLearning = this.create(topicLearningData);
      const topicLearningCreated = await this.save(topicLearning);

      return topicLearningCreated;
    } catch (err) {
      this.logger.error(err);

      throw new InternalServerErrorException('Something error query');
    }
  }

  async getTopicLearningById(
    topicLearningID: number,
  ): Promise<TopicLearning | null> {
    const topicLearning = await this.findOne({
      where: {
        id: topicLearningID,
      },
    });
    return topicLearning;
  }

  async getTopicLearningByIdWithRelation(
    topicLearningID: number,
    relations: string[],
  ): Promise<TopicLearning | null> {
    const topicLearning = await this.findOne({
      where: {
        id: topicLearningID,
      },
      relations,
    });
    return topicLearning;
  }

}
