import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Answer, Course, Curriculum, Learning, Question, TopicLearning } from 'src/entities';
import { Lecture } from 'src/entities/lecture.entity';
import { CourseModule } from '../courses/course.module';
import { CurriculumModule } from '../curriculum/curriculum.module';
import { LearningModule } from '../learning/learning.module';
import { LectureModule } from '../lecture/lecture.module';
import { QuestionModule } from '../question/question.module';
import { TopicLearningController } from './topic_learning.controller';
import { TopicLearningRepository } from './topic_learning.repository';
import { TopicLearningService } from './topic_learning.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, Curriculum, Lecture, Question, Answer, TopicLearning, Learning]),
    CurriculumModule,
    CourseModule,
    LectureModule,
    QuestionModule,
    LearningModule
  ],
  providers: [TopicLearningService, TopicLearningRepository],
  controllers: [TopicLearningController],
  exports: [TopicLearningService, TopicLearningRepository],
})
export class TopicLearningModule {}
