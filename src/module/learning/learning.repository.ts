import {
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import { EntityRepository, Repository } from 'typeorm';
import _ = require('lodash');
import { Cart, Curriculum, Learning } from 'src/entities';
import { Lecture } from 'src/entities/lecture.entity';
import { Question } from 'src/entities/question.entity';

@EntityRepository(Learning)
export class LearningRepository extends Repository<Learning> {
  private logger = new Logger(LearningRepository.name);

  constructor(
    @InjectRepository(Learning)
    private learningRepository: Repository<Learning>,
  ) {
    super(
      learningRepository.target,
      learningRepository.manager,
      learningRepository.queryRunner,
    );
  }
  // async createCart(cartData: Cart): Promise<Cart> {
  //   try {
  //     const cart = this.create(cartData);
  //     const cartCreated = await this.save(cart);

  //     return cartCreated;
  //   } catch (err) {
  //     this.logger.error(err);

  //     throw new InternalServerErrorException('Something error query');
  //   }
  // }

  async getLearningByID(learningID: number): Promise<Learning | null> {
    const learning = await this.findOne({
      where: {
        id: learningID,
      },
    });
    return learning;
  }

  async getLearningByIDRelation(learningID: number, relations: string[]): Promise<Learning | null> {
    const learning = await this.findOne({
      where: {
        id: learningID,
      },
      relations
    });
    return learning;
  }

  async getLearningByIDCourseUser(
    courseID: number,
    userID: number,
  ): Promise<Learning | null> {
    const learning = await this.findOne({
      where: {
        userId: userID,
        courseId: courseID,
      },
    });
    return learning;
  }
}
