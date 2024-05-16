import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification, NotificationToken, User } from 'src/entities';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, NotificationToken, User]),
    // forwardRef(() => UserModule),
    // forwardRef(() => CourseModule),
    // forwardRef(() => UploadModule),
    // forwardRef(() => AssetModule)
  ],
  providers: [NotificationService],
  controllers: [NotificationController],
  exports: [NotificationService],
})
export class NotificationModule {}
