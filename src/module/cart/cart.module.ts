import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart, Course, Curriculum, Price, User } from 'src/entities';
import { Lecture } from 'src/entities/lecture.entity';
import { CourseModule } from '../courses/course.module';
import { CurriculumModule } from '../curriculum/curriculum.module';
import { LectureModule } from '../lecture/lecture.module';
import { CartController } from './cart.controller';
import { CartRepository } from './cart.repository';
import { CartService } from './cart.service';
import { PriceModule } from '../price/price.module';
import { UserModule } from '../user/user.module';
import { StripeModule } from '@golevelup/nestjs-stripe';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StripeWebhookService } from './stripe-webhook.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, Curriculum, Lecture, Cart, Price, User]),
    forwardRef(() => CurriculumModule),
    forwardRef(() => CourseModule),
    forwardRef(() => LectureModule),
    forwardRef(() => PriceModule),
    forwardRef(() => UserModule),
    forwardRef(() => LectureModule),
    StripeModule.forRootAsync(StripeModule, {
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          apiKey: configService.get('STRIPE_KEY'),
          // webhookConfig: {
          //   stripeSecrets: {
          //     account:
          //       'whsec_cb4db6ed715b11790d10316f918e525c0a5809ed00b4e60ee01080b566d85c04',
          //   },
          // },
        };
      },
    }),
  ],
  providers: [CartService, CartRepository, StripeWebhookService],
  controllers: [CartController],
  exports: [CartService, CartRepository],
})
export class CartModule {}
