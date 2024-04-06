import { StripeModule } from "@golevelup/nestjs-stripe";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Course } from "src/entities";
import { TransactionDetail } from "src/entities/transaction-detail.entity";
import { Transaction } from "src/entities/transaction.entity";
import { CourseModule } from "../courses/course.module";
import StripeService from "./stripe.service";
import StripeWebhookController from "./stripeWebhook.controller";
import { TransactionRepository } from "./transation.repository";


@Module({
  imports: [
    TypeOrmModule.forFeature([Course, TransactionDetail, Transaction]),

    StripeModule.forRootAsync(StripeModule, {
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          apiKey: configService.get('STRIPE_KEY'),
        };
      },
    }),
    CourseModule,
  ],
  providers: [StripeService, TransactionRepository],
  controllers: [StripeWebhookController],
})
export class StripeWebhookModule {}
