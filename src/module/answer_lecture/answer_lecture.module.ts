import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Answer,
  AnswerLecture,
  Course,
  Curriculum,
  IssueType,
  Learning,
  Question,
  QuestionLecture,
  Report,
  TopicLearning,
  User
} from 'src/entities';
import { Lecture } from 'src/entities/lecture.entity';
import { CourseModule } from '../courses/course.module';
import { CurriculumModule } from '../curriculum/curriculum.module';
import { IssueTypeModule } from '../issue_type/issue-type.module';
import { LearningModule } from '../learning/learning.module';
import { LectureModule } from '../lecture/lecture.module';
import { QuestionModule } from '../question/question.module';
import { QuestionLectureModule } from '../question_lecture/question_lecture.module';
import { UserModule } from '../user/user.module';
import { AnswerLectureController } from './answer_lecture.controller';
import { AnswerLectureRepository } from './answer_lecture.repository';
import { AnswerLectureService } from './answer_lecture.service';

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
      User,
      AnswerLecture
    ]),
    CurriculumModule,
    CourseModule,
    LectureModule,
    QuestionModule,
    LearningModule,
    IssueTypeModule,
    UserModule,
    QuestionLectureModule
  ],
  providers: [AnswerLectureService, AnswerLectureRepository],
  controllers: [AnswerLectureController],
  exports: [AnswerLectureService, AnswerLectureRepository],
})
export class AnswerLectureModule {}
