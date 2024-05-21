import { InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from 'src/entities';
import { EntityRepository, Repository } from 'typeorm';
import _ = require('lodash');

@EntityRepository(Course)
export class CourseRepository extends Repository<Course> {
  private logger = new Logger(CourseRepository.name);

  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {
    super(
      courseRepository.target,
      courseRepository.manager,
      courseRepository.queryRunner,
    );
  }
  async createCourse(courseData: Partial<Course>): Promise<Course> {
    try {
      const course = this.create(courseData);
      const courseCreated = await this.save(course);

      return courseCreated;
    } catch (err) {
      this.logger.error(err);

      throw new InternalServerErrorException('Something error query');
    }
  }

  async getCourseByID(courseID: number): Promise<Course | null> {
    const course = await this.findOne({
      where: {
        id: courseID,
      },
    });
    return course;
  }

  async getCourseByIDWithRelation(courseID: number, relations: string[]): Promise<Course | null> {
    const course = await this.findOne({
      where: {
        id: courseID,
      },
      relations,
    });
    return course;
  }
}
