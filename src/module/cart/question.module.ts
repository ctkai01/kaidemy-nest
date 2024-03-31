import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course, Curriculum } from 'src/entities';
import { Lecture } from 'src/entities/lecture.entity';
import { CourseModule } from '../courses/course.module';
import { CurriculumModule } from '../curriculum/curriculum.module';
import { LectureModule } from '../lecture/lecture.module';
import { QuestionController } from './question.controller';
import { QuestionRepository } from './question.repository';
import { QuestionService } from './question.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, Curriculum, Lecture]),
    CurriculumModule,
    CourseModule,
    LectureModule,
  ],
  providers: [QuestionService, QuestionRepository],
  controllers: [QuestionController],
  exports: [QuestionService, QuestionRepository],
})
export class QuestionModule {}
