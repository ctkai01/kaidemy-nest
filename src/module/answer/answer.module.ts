import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Answer, Course, Curriculum, Question } from 'src/entities';
import { Lecture } from 'src/entities/lecture.entity';
import { CourseModule } from '../courses/course.module';
import { CurriculumModule } from '../curriculum/curriculum.module';
import { LectureModule } from '../lecture/lecture.module';
import { AnswerController } from './answer.controller';
import { AnswerRepository } from './answer.repository';
import { AnswerService } from './answer.service';
import { QuestionModule } from '../question/question.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, Curriculum, Lecture, Question, Answer]),
    CurriculumModule,
    CourseModule,
    LectureModule,
    QuestionModule
  ],
  providers: [AnswerService, AnswerRepository],
  controllers: [AnswerController],
  exports: [AnswerService, AnswerRepository],
})
export class AnswerModule {}
