import {
  Controller,
  Post,
  Headers,
  Req,
  BadRequestException,
} from '@nestjs/common';
import StripeService from '../stripe/stripe.service';
import Stripe from 'stripe';
interface RequestWithRawBody extends Request {
  rawBody: Buffer;
}
@Controller('stripe/webhookz')
export default class StripeWebhookController {
  constructor(private readonly stripeService: StripeService) {}

  @Post()
  async handleIncomingEvents(
    @Headers('stripe-signature') signature: string,
    @Req() request: RequestWithRawBody,
  ) {

    console.log('signature', signature);
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    const event = await this.stripeService.constructEventFromPayload(
      signature,
      request.rawBody,
    );

    if (event.type === 'charge.succeeded') {
      const data = event.data.object as Stripe.Charge;
    //   console.log(data);
      console.log(data.metadata);

      const courses = JSON.parse(data.metadata.courses);
      console.log(courses);

      const balanceTransactions = await this.stripeService.stripeClient.balanceTransactions.retrieve(
        data.balance_transaction.toString(),
      );
      console.log(balanceTransactions.amount);
      console.log(balanceTransactions.fee);
    }
  }
}
