import { StripeModule } from '@golevelup/nestjs-stripe';
import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category, Course, Language, Level, Price, User, Learning, Cart, TransactionDetail, Transaction } from 'src/entities';
import { CategoryModule } from '../category/category.module';
import { CategoryRepository } from '../category/category.repository';
import { UserModule } from '../user/user.module';
import { UserRepository } from '../user/user.repository';
import { CourseController } from './course.controller';
import { CourseRepository } from './course.repository';
import { CourseService } from './course.service';
import { LanguageModule } from '../language/language.module';
import { LevelModule } from '../level/level.module';
import { PriceModule } from '../price/price.module';
import { UploadModule } from '../upload/upload.module';
import { TransactionRepository } from './transation.repository';
import { CartModule } from '../cart/cart.module';
import { QueueModule } from '../queues/queue.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Course,
      User,
      Category,
      Language,
      Level,
      Price,
      Learning,
      TransactionDetail,
      Transaction,
      Cart,
      User
    ]),
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
    LanguageModule,
    LevelModule,
    PriceModule,
    UploadModule,
    CartModule,
    forwardRef(() => QueueModule),
  ],
  providers: [CourseService, CourseRepository, TransactionRepository],
  controllers: [CourseController],
  exports: [CourseService, CourseRepository],
})
export class CourseModule {}
