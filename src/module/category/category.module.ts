import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category, Course, User } from 'src/entities';
import { UserModule } from '../user/user.module';
import { UserRepository } from '../user/user.repository';
import { CategoryController } from './category.controller';
import { CategoryRepository } from './category.repository';
import { CategoryService } from './category.service';

@Module({
  imports: [TypeOrmModule.forFeature([Category, User, Course]), UserModule],
  providers: [CategoryService, CategoryRepository, UserRepository],
  controllers: [CategoryController],
  exports: [CategoryService, CategoryRepository],
})
export class CategoryModule {}
