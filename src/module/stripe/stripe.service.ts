import { InjectStripeClient } from '@golevelup/nestjs-stripe';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CourseTransaction } from 'src/constants';
import { FEE_PLATFORM } from 'src/constants/payment';
import { TransactionDetail } from 'src/entities/transaction-detail.entity';
import { Transaction } from 'src/entities/transaction.entity';
import Stripe from 'stripe';
import { getRepository } from 'typeorm';
import { CartRepository } from '../cart/cart.repository';
import { CourseRepository } from '../courses/course.repository';
import { CourseService } from '../courses/course.service';
import { ProducerService } from '../queues/producer.service';
import { TransactionRepository } from '../courses/transation.repository';

@Injectable()
export default class StripeService {
  private stripe: Stripe;

  constructor(
    @InjectStripeClient() readonly stripeClient: Stripe,
    private configService: ConfigService,
    private readonly courseService: CourseService,
    private readonly cartRepository: CartRepository,
    private producerService: ProducerService,
  ) {
    this.stripe = new Stripe(configService.get('STRIPE_KEY'), {
      apiVersion: '2023-10-16',
    });
  }

  public async constructEventFromPayload(signature: string, payload: Buffer) {
    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
    console.log('webhookSecret: ', webhookSecret);
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );
  }

  public async chargeSucceededEvent(data: Stripe.Charge) {
    try {
      await this.producerService.addPaymentToQueue(data);
    } catch (err) {
      console.log(err);
    }
  }
}
