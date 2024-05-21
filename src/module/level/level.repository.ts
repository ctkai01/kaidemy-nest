import {
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Level } from 'src/entities';
import _ = require('lodash');

@EntityRepository(Level)
export class LevelRepository extends Repository<Level> {
  private logger = new Logger(LevelRepository.name);

  constructor(
    @InjectRepository(Level)
    private levelRepository: Repository<Level>,
  ) {
    super(
      levelRepository.target,
      levelRepository.manager,
      levelRepository.queryRunner,
    );
  }
  async createLevel(levelData: Level): Promise<Level> {
    try {
      const level = this.create(levelData);
      const levelCreated = await this.save(level);

      return levelCreated;
    } catch (err) {
      this.logger.error(err);
      if (err.code === '23505') {
        throw new ConflictException('Name already exists');
      }

      throw new InternalServerErrorException('Something error query');
    }
  }

  async getLevelById(levelID: number): Promise<Level> {
    const level = await this.findOne({
      where: {
        id: levelID,
      },
    });
    return level;
  }

}
