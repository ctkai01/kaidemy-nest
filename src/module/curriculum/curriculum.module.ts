import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course, Curriculum } from 'src/entities';
import { CourseModule } from '../courses/course.module';
import { CurriculumController } from './curriculum.controller';
import { CurriculumRepository } from './curriculum.repository';
import { CurriculumService } from './curriculum.service';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Curriculum]), CourseModule],
  providers: [CurriculumService, CurriculumRepository],
  controllers: [CurriculumController],
  exports: [CurriculumService, CurriculumRepository],
})
export class CurriculumModule {}
