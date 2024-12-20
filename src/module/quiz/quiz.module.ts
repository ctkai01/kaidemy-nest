import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart, Course, Curriculum } from 'src/entities';
import { Lecture } from 'src/entities/lecture.entity';
import { CurriculumModule } from '../curriculum/curriculum.module';
import { LectureModule } from '../lecture/lecture.module';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { CourseModule } from '../courses/course.module';
import { CartRepository } from '../cart/cart.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, Curriculum, Lecture, Cart]),
    CurriculumModule,
    LectureModule,
    CourseModule,
  ],
  providers: [QuizService, CartRepository],
  controllers: [QuizController],
  exports: [QuizService, CartRepository],
})
export class QuizModule {}
