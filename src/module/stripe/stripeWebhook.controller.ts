import {
  Controller,
  Post,
  Headers,
  Req,
  BadRequestException,
} from '@nestjs/common';
import StripeService from './stripe.service';
import Stripe from 'stripe';
import { RequestWithRawBody } from 'src/middleware/rawBody.middleware';

@Controller('webhook')
export default class StripeWebhookController {
  constructor(
    private readonly stripeService: StripeService,
  ) {}

  @Post()
  async handleIncomingEvents(
    @Headers('stripe-signature') signature: string,
    @Req() request: RequestWithRawBody,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    const event = await this.stripeService.constructEventFromPayload(
      signature,
      request.rawBody,
    );

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
    }
  }
}
