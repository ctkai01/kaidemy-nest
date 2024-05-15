import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification, NotificationToken, User } from 'src/entities';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, NotificationToken, User]),
    // forwardRef(() => CurriculumModule),
    // forwardRef(() => CourseModule),
    // forwardRef(() => UploadModule),
    // forwardRef(() => AssetModule)
  ],
  providers: [NotificationService],
  controllers: [NotificationController],
  exports: [NotificationService],
})
export class NotificationModule {}
