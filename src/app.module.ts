import { StripeModule } from '@golevelup/nestjs-stripe';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  Category,
  Checkout,
  Course,
  IssueType,
  Language,
  Level,
  Notification,
  NotificationToken,
  Price,
  Answer,
  AnswerLecture,
  Cart,
  User,
  Chat,
  Asset,
  Curriculum,
  LearningLecture,
  Learning,
  Lecture,
  QuestionLecture,
  Question,
  Report,
  Socket,
  TopicLearning,
  TransactionDetail,
  Transaction,
} from './entities';
import { AuthGuard } from './guards/auth.guard';
import { AuthModule } from './module/auth/auth.module';
import { CategoryModule } from './module/category/category.module';
import { CourseModule } from './module/courses/course.module';
import { CurriculumModule } from './module/curriculum/curriculum.module';
import { EmailModule } from './module/email/email.module';
import { IssueTypeModule } from './module/issue_type/issue-type.module';
import { LanguageModule } from './module/language/language.module';
import { LectureModule } from './module/lecture/lecture.module';
import { LevelModule } from './module/level/level.module';
import { PriceModule } from './module/price/price.module';
import { UploadModule } from './module/upload/upload.module';
import { UploadService } from './module/upload/upload.service';
import { QuizModule } from './module/quiz/quiz.module';
import { QuestionModule } from './module/question/question.module';
import { AnswerModule } from './module/answer/answer.module';
import { CartModule } from './module/cart/cart.module';
import { StripeWebhookModule } from './module/stripe/stripe.module';
import { LearningModule } from './module/learning/learning.module';
import { TopicLearningModule } from './module/topic_learning/topic_learning.module';
import { ReportModule } from './module/report/report.module';
import { QuestionLectureModule } from './module/question_lecture/question_lecture.module';
import { AnswerLectureModule } from './module/answer_lecture/answer_lecture.module';
import { AdminModule } from './module/admin/admin.module';
import { ChatModule } from './module/chat/chat.module';
import { NotificationModule } from './module/notification/notification.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.stage.${process.env.STAGE}`],
      isGlobal: true,
    }),
    JwtModule.register({}),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      // connectionFactory: async (options?: ConnectionOptions): Promise<Connection> => {
      //   return {
      //     then(onfulfilled?, onrejected?) {
      //       // onfulfilled(
      //       //   getConnection()
      //       // })
      //       onrejected((value: any) => {
      //         console.log('Value', value)
      //         getConnection(options.synchronize).connect()
      //       })
      //     },
      //   }
      // }
      // ,
      useFactory: async (configService: ConfigService) => {
        return {
          type: 'postgres',
          autoLoadEntities: true,
          synchronize: true,
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_NAME'),
          logging: true,
          keepConnectionAlive: true,
          extra: {
            insecureAuth: true,
            charset: 'utf8mb4_unicode_ci',
          },
          entities: [
            User,
            Price,
            Level,
            Category,
            IssueType,
            Language,
            Course,
            Cart,
            Checkout,
            AnswerLecture,
            Chat,
            Notification,
            NotificationToken,
            Answer,
            Asset,
            Curriculum,
            LearningLecture,
            Learning,
            Lecture,
            QuestionLecture,
            Question,
            Report,
            Socket,
            TopicLearning,
            TransactionDetail,
            Transaction,
          ],
          timezone: '+07:00',
        };
      },
    }),
    AuthModule,
    EmailModule,
    UploadModule,
    PriceModule,
    LevelModule,
    CategoryModule,
    IssueTypeModule,
    LanguageModule,
    CourseModule,
    CurriculumModule,
    LectureModule,
    QuizModule,
    QuestionModule,
    AnswerModule,
    CartModule,
    StripeWebhookModule,
    LearningModule,
    TopicLearningModule,
    ReportModule,
    QuestionLectureModule,
    AnswerLectureModule,
    AdminModule,
    ChatModule,
    NotificationModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: 'CONFIG_APP',
      useValue: new ConfigService(),
    },
    UploadService,
  ],
})
export class AppModule {}
