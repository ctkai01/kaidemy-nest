import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course, Notification, NotificationToken, User } from 'src/entities';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { UserModule } from '../user/user.module';
import { CourseModule } from '../courses/course.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, NotificationToken, User, Course]),
    // forwardRef(() => UserModule),
    // forwardRef(() => CourseModule),
    // forwardRef(() => UploadModule),
    // forwardRef(() => AssetModule)
    // CourseModule
  ],
  providers: [NotificationService],
  controllers: [NotificationController],
  exports: [NotificationService],
})
export class NotificationModule {}
