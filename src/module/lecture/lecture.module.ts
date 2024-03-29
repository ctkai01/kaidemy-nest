import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course, Curriculum } from 'src/entities';
import { Lecture } from 'src/entities/lecture.entity';
import { AssetModule } from '../asset/asset.module';
import { CourseModule } from '../courses/course.module';
import { CurriculumModule } from '../curriculum/curriculum.module';
import { UploadModule } from '../upload/upload.module';
import { LectureController } from './lecture.controller';
import { LectureRepository } from './lecture.repository';
import { LectureService } from './lecture.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, Curriculum, Lecture]),
    CurriculumModule,
    CourseModule,
    UploadModule,
    AssetModule,
  ],
  providers: [LectureService, LectureRepository],
  controllers: [LectureController],
  exports: [LectureService, LectureRepository],
})
export class LectureModule {}
