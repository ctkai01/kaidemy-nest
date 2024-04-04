import { StripeModule } from "@golevelup/nestjs-stripe";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import StripeService from "./stripe.service";
import StripeWebhookController from "./stripeWebhook.controller";


@Module({
  imports: [
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
  providers: [StripeService],
  controllers: [StripeWebhookController],
})
export class StripeWebhookModule {}
