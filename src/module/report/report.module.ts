import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Answer,
  Course,
  Curriculum,
  IssueType,
  Learning,
  Question,
  Report,
  TopicLearning
} from 'src/entities';
import { Lecture } from 'src/entities/lecture.entity';
import { CourseModule } from '../courses/course.module';
import { CurriculumModule } from '../curriculum/curriculum.module';
import { IssueTypeModule } from '../issue_type/issue-type.module';
import { LearningModule } from '../learning/learning.module';
import { LectureModule } from '../lecture/lecture.module';
import { QuestionModule } from '../question/question.module';
import { ReportController } from './report.controller';
import { ReportRepository } from './report.repository';
import { ReportService } from './report.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Course,
      Curriculum,
      Lecture,
      Question,
      Answer,
      TopicLearning,
      Learning,
      IssueType,
      Report
    ]),
    CurriculumModule,
    CourseModule,
    LectureModule,
    QuestionModule,
    LearningModule,
    IssueTypeModule
  ],
  providers: [ReportService, ReportRepository],
  controllers: [ReportController],
  exports: [ReportService, ReportRepository],
})
export class ReportModule {}
