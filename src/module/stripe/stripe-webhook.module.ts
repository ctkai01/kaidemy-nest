import { Module } from "@nestjs/common";
import StripeService from "./stripe.service";
import StripeWebhookController from "./stripeWebhook.controller";

@Module({
  providers: [StripeService],
  controllers: [StripeWebhookController],
})
export class StripeWebhookModule {}
