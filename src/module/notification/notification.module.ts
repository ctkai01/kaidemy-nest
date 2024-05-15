import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification, NotificationToken } from 'src/entities';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, NotificationToken]),
    // forwardRef(() => CurriculumModule),
    // forwardRef(() => CourseModule),
    // forwardRef(() => UploadModule),
    // forwardRef(() => AssetModule)
  ],
  providers: [NotificationService],
  controllers: [NotificationController],
  exports: [NotificationService],
})
export class LectureModule {}
