import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course, Curriculum } from 'src/entities';
import { Lecture } from 'src/entities/lecture.entity';
import { CurriculumModule } from '../curriculum/curriculum.module';
import { LectureModule } from '../lecture/lecture.module';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, Curriculum, Lecture]),
    CurriculumModule,
    LectureModule,
  ],
  providers: [QuizService],
  controllers: [QuizController],
  exports: [QuizService],
})
export class QuizModule {}
