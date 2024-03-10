import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities';
import { Level } from 'src/entities/level.entity';
import { AdminRoleGuard } from 'src/guards/admin-role.guard';
import { UserModule } from '../user/user.module';
import { UserRepository } from '../user/user.repository';
import { LevelController } from './level.controller';
import { LevelRepository } from './level.repository';
import { LevelService } from './level.service';

@Module({
  imports: [TypeOrmModule.forFeature([Level, User]), UserModule],
  providers: [LevelService, LevelRepository, UserRepository],
  controllers: [LevelController],
  exports: [LevelService, LevelRepository],
})
export class LevelModule {}
