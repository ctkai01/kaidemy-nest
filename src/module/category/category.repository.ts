import {
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import { EntityRepository, Repository } from 'typeorm';
import _ = require('lodash');

@EntityRepository(Category)
export class CategoryRepository extends Repository<Category> {
  private logger = new Logger(CategoryRepository.name);

  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {
    super(
      categoryRepository.target,
      categoryRepository.manager,
      categoryRepository.queryRunner,
    );
  }
  async createCategory(categoryData: Category): Promise<Category> {
    try {
      const category = this.create(categoryData);
      const categoryCreated = await this.save(category);

      return categoryCreated;
    } catch (err) {
      this.logger.error(err);
      if (err.code === '23505') {
        throw new ConflictException('Name already exists');
      }

      throw new InternalServerErrorException('Something error query');
    }
  }

  async getCategoryById(categoryID: number): Promise<Category> {
    const category = await this.findOne({
      where: {
        id: categoryID,
      },
    });
    console.log('What: ', category);
    console.log('What 1: ', categoryID);
    return category;
  }

  async getCategoryByIdRelation(categoryID: number): Promise<Category> {
    const category = await this.findOne({
      where: {
        id: categoryID,
      },
      relations: ['children'],
    });
    return category;
  }

  async getCategoryByName(name: string): Promise<Category> {
    const category = await this.findOne({
      where: {
        name,
      },
    });
    return category;
  }
}
