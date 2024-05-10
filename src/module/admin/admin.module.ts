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
import { UserModule } from '../user/user.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

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
    ]),
    CurriculumModule,
    CourseModule,
    LectureModule,
    QuestionModule,
    LearningModule,
    IssueTypeModule,
    UserModule,
  ],
  providers: [AdminService],
  controllers: [AdminController],
  exports: [AdminService],
})
export class AdminModule {}
