import { ConflictException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import { EntityRepository, Repository } from 'typeorm';
import _ = require('lodash');
import { Curriculum } from 'src/entities';
import { Lecture } from 'src/entities/lecture.entity';

@EntityRepository(Lecture)
export class LectureRepository extends Repository<Lecture> {
  private logger = new Logger(LectureRepository.name);

  constructor(
    @InjectRepository(Lecture)
    private lectureRepository: Repository<Lecture>,
  ) {
    super(
      lectureRepository.target,
      lectureRepository.manager,
      lectureRepository.queryRunner,
    );
  }
  async createLecture(lectureData: Lecture): Promise<Lecture> {
    try {
      const lecture = this.create(lectureData);
      const lectureCreated = await this.save(lecture);

      return lectureCreated;
    } catch (err) {
      this.logger.error(err);

      throw new InternalServerErrorException('Something error query');
    }
  }

  async getLectureById(lectureID: number): Promise<Lecture | null> {
    const lecture = await this.findOne({
      where: {
        id: lectureID,
      },
    });
    return lecture;
  }

  async getLectureByIdWithRelation(
    lectureID: number,
    relations: string[],
  ): Promise<Lecture | null> {
    const lecture = await this.findOne({
      where: {
        id: lectureID,
      },
      relations: relations,
    });
    return lecture;
  }

}
