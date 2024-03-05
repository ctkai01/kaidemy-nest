import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Module({
  imports: [MulterModule.register()],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
