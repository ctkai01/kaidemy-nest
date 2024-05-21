import {
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import { EntityRepository, Repository } from 'typeorm';
import _ = require('lodash');
import { Cart, Curriculum } from 'src/entities';
import { Lecture } from 'src/entities/lecture.entity';
import { Question } from 'src/entities/question.entity';

@EntityRepository(Cart)
export class CartRepository extends Repository<Cart> {
  private logger = new Logger(CartRepository.name);

  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
  ) {
    super(
      cartRepository.target,
      cartRepository.manager,
      cartRepository.queryRunner,
    );
  }
  async createCart(cartData: Cart): Promise<Cart> {
    try {
      const cart = this.create(cartData);
      const cartCreated = await this.save(cart);

      return cartCreated;
    } catch (err) {
      this.logger.error(err);

      throw new InternalServerErrorException('Something error query');
    }
  }

  async getCartByUserID(userID: number): Promise<Cart | null> {
    const cart = await this.findOne({
      where: {
        userId: userID,
      },
    });
    return cart;
  }

  async getCartByUserIDRelation(userID: number, relations: string[]): Promise<Cart | null> {
    const cart = await this.findOne({
      where: {
        userId: userID,
      },
      relations
    });
    return cart;
  }
}
