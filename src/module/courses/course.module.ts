import { StripeModule } from '@golevelup/nestjs-stripe';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category, Course, User } from 'src/entities';
import { CategoryModule } from '../category/category.module';
import { CategoryRepository } from '../category/category.repository';
import { UserModule } from '../user/user.module';
import { UserRepository } from '../user/user.repository';
import { CourseController } from './course.controller';
import { CourseRepository } from './course.repository';
import { CourseService } from './course.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, User, Category]),
    UserModule,
    StripeModule.forRootAsync(StripeModule, {
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          apiKey: configService.get('STRIPE_KEY'),
        };
      },
    }),
    CategoryModule,
  ],
  providers: [CourseService, CourseRepository],
  controllers: [CourseController],
  exports: [CourseService, CourseRepository],
})
export class CourseModule {}
