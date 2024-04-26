import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Answer,
  Course,
  Curriculum,
  IssueType,
  Learning,
  Question,
  QuestionLecture,
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
import { QuestionLectureController } from './question_lecture.controller';
import { QuestionLectureRepository } from './question_lecture.repository';
import { QuestionLectureService } from './question_lecture.service';

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
      Report,
      QuestionLecture,
    ]),
    CurriculumModule,
    CourseModule,
    LectureModule,
    QuestionModule,
    LearningModule,
    IssueTypeModule,
  ],
  providers: [QuestionLectureService, QuestionLectureRepository],
  controllers: [QuestionLectureController],
  exports: [QuestionLectureService, QuestionLectureRepository],
})
export class QuestionLectureModule {}
