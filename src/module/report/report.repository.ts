import {
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import { EntityRepository, Repository } from 'typeorm';
import _ = require('lodash');
import { Answer, Curriculum, Report, TopicLearning } from 'src/entities';
import { Lecture } from 'src/entities/lecture.entity';
import { Question } from 'src/entities/question.entity';

@EntityRepository(Report)
export class ReportRepository extends Repository<Report> {
  private logger = new Logger(ReportRepository.name);

  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
  ) {
    super(
      reportRepository.target,
      reportRepository.manager,
      reportRepository.queryRunner,
    );
  }
  async createReport(reportData: Partial<Report>): Promise<Report> {
    try {
      const report = this.create(reportData);
      const reportCreated = await this.save(report);
      
      return reportCreated;
    } catch (err) {
      this.logger.error(err);

      throw new InternalServerErrorException('Something error query');
    }
  }
}
