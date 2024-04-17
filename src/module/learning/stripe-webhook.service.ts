import {
  InjectStripeClient,
  StripeWebhookHandler,
} from '@golevelup/nestjs-stripe';
import { Injectable } from '@nestjs/common';
import { Public } from 'src/decorators';
import Stripe from 'stripe';

@Injectable()
export class StripeWebhookService {
  constructor(@InjectStripeClient() private stripe: Stripe) {}
  @Public()
  @StripeWebhookHandler('charge.succeeded')
  async handleSubscriptionUpdate(event: Stripe.Event): Promise<void> {
    const dataObject = event.data.object as Stripe.Charge;
    // implement here subscription create in our Database
    // ...
    console.log(dataObject);
  }

  //   @StripeWebhookHandler('customer.subscription.deleted')
  //   async handleSubscriptionDelete(event: Stripe.Event): Promise<void> {
  //     const dataObject = event.data.object as Stripe.Subscription;
  //     // implement here subscription delete in our Database
  //     // ...
  //   }
}
