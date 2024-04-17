import {
  Controller,
  Post,
  Headers,
  Req,
  BadRequestException,
} from '@nestjs/common';
<<<<<<< HEAD
import StripeService from './stripe.service';
import Stripe from 'stripe';
import { RequestWithRawBody } from 'src/middleware/rawBody.middleware';

@Controller('webhook')
export default class StripeWebhookController {
  constructor(
    private readonly stripeService: StripeService,
  ) {}
=======
import StripeService from '../stripe/stripe.service';
import Stripe from 'stripe';
import { getRepository } from 'typeorm';
import { Transaction } from 'src/entities/transaction.entity';
import { TransactionDetail } from 'src/entities/transaction-detail.entity';
interface RequestWithRawBody extends Request {
  rawBody: Buffer;
}
@Controller('stripe/webhookz')
export default class StripeWebhookController {
  constructor(private readonly stripeService: StripeService) {}
>>>>>>> 5f9e6fc87e73f5086ec899343fe212165a602d63

  @Post()
  async handleIncomingEvents(
    @Headers('stripe-signature') signature: string,
    @Req() request: RequestWithRawBody,
  ) {
<<<<<<< HEAD
=======
    console.log('signature', signature);
>>>>>>> 5f9e6fc87e73f5086ec899343fe212165a602d63
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    const event = await this.stripeService.constructEventFromPayload(
      signature,
      request.rawBody,
    );

<<<<<<< HEAD
    if (
      event.type === 'charge.succeeded'
    ) {
      const data = event.data.object as Stripe.Charge;
        console.log('data: ', data);
      

    }

    if (event.type === 'checkout.session.completed') {
      // const paymentIntent = await stripe.paymentIntents.retrieve(
      //   'pi_3MtwBwLkdIwHu7ix28a3tqPa',
      // );
=======
    if (event.type === 'charge.succeeded') {
      const data = event.data.object as Stripe.Charge;
      //   console.log(data);
      this.stripeService.chargeSucceededEvent(data)
     
>>>>>>> 5f9e6fc87e73f5086ec899343fe212165a602d63
    }
  }
}
