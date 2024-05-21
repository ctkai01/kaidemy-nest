import { ConflictException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import { EntityRepository, Repository } from 'typeorm';
import _ = require('lodash');
import { Curriculum } from 'src/entities';

@EntityRepository(Curriculum)
export class CurriculumRepository extends Repository<Curriculum> {
  private logger = new Logger(CurriculumRepository.name);

  constructor(
    @InjectRepository(Curriculum)
    private curriculumRepository: Repository<Curriculum>,
  ) {
    super(
      curriculumRepository.target,
      curriculumRepository.manager,
      curriculumRepository.queryRunner,
    );
  }
  async createCurriculum(curriculumData: Curriculum): Promise<Curriculum> {
    try {
      const curriculum = this.create(curriculumData);
      const curriculumCreated = await this.save(curriculum);

      return curriculumCreated;
    } catch (err) {
      this.logger.error(err);

      throw new InternalServerErrorException('Something error query');
    }
  }

  async getCurriculumById(curriculumID: number): Promise<Curriculum | null> {
    const curriculum = await this.findOne({
      where: {
        id: curriculumID,
      },
    });
    return curriculum;
  }

  async getCurriculumByIdWithRelation(
    curriculumID: number,
    relations: string[],
  ): Promise<Curriculum | null> {
    const curriculum = await this.findOne({
      where: {
        id: curriculumID,
      },
      relations: relations,
    });
    return curriculum;
  }
}
