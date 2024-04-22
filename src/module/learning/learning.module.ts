import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart, Course, Curriculum, Learning, Price, User, LearningLecture } from 'src/entities';
import { Lecture } from 'src/entities/lecture.entity';
import { CourseModule } from '../courses/course.module';
import { CurriculumModule } from '../curriculum/curriculum.module';
import { LectureModule } from '../lecture/lecture.module';
import { PriceModule } from '../price/price.module';
import { UserModule } from '../user/user.module';
import { LearningController } from './learning.controller';
import { LearningRepository } from './learning.repository';
import { LearningService } from './learning.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Course,
      Curriculum,
      Lecture,
      Cart,
      Price,
      User,
      Learning,
      LearningLecture,
    ]),
    forwardRef(() => CurriculumModule),
    forwardRef(() => CourseModule),
    forwardRef(() => LectureModule),
    forwardRef(() => PriceModule),
    forwardRef(() => UserModule),
  ],
  providers: [LearningService, LearningRepository],
  controllers: [LearningController],
  exports: [LearningService, LearningRepository],
})
export class LearningModule {}
