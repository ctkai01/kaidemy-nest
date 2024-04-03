import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart, Course, Curriculum, Price } from 'src/entities';
import { Lecture } from 'src/entities/lecture.entity';
import { CourseModule } from '../courses/course.module';
import { CurriculumModule } from '../curriculum/curriculum.module';
import { LectureModule } from '../lecture/lecture.module';
import { CartController } from './cart.controller';
import { CartRepository } from './cart.repository';
import { CartService } from './cart.service';
import { PriceModule } from '../price/price.module';
import { StripeModule } from '@golevelup/nestjs-stripe';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, Curriculum, Lecture, Cart, Price]),
    CurriculumModule,
    CourseModule,
    LectureModule,
    PriceModule,
    StripeModule.forRootAsync(StripeModule, {
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          apiKey: configService.get('STRIPE_KEY'),
        };
      },
    }),
  ],
  providers: [CartService, CartRepository],
  controllers: [CartController],
  exports: [CartService, CartRepository],
})
export class CartModule {}
