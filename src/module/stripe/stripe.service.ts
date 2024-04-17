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
import { TransactionRepository } from './transation.repository';

@Injectable()
export default class StripeService {
  private stripe: Stripe;

  constructor(
    @InjectStripeClient() readonly stripeClient: Stripe,
    private configService: ConfigService,
    private readonly courseService: CourseService,
    private readonly cartRepository: CartRepository,

    private readonly transactionRepository: TransactionRepository,
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
    console.log(data.metadata);
    try {
      const courses: CourseTransaction[] = JSON.parse(data.metadata.courses);
      console.log('courses: ', courses);
      console.log('userBuy: ', data.metadata.userBuy);
      console.log('group: ', data.metadata.group);

      const balanceTransactions =
        await this.stripeClient.balanceTransactions.retrieve(
          data.balance_transaction.toString(),
        );
      console.log(balanceTransactions.amount);
      console.log(balanceTransactions.fee);
      const userBuy = data.metadata.userBuy;
      // Create transaction
      const transaction: Partial<Transaction> = {
        actual: balanceTransactions.amount,
        fee_stripe: balanceTransactions.fee,
        userId: Number(userBuy),
      };
      await this.transactionRepository.save(transaction);
      const transactionDetails: TransactionDetail[] = [];
      const transferPromises = [];
      courses.forEach(async (course) => {
        const feeBuy =
          Math.round((course.price * (100 - FEE_PLATFORM)) / 100) * 100;
        transactionDetails.push({
          fee_buy: feeBuy,
          courseId: course.id,
          transactionId: transaction.id,
        });
        const transferPromise = this.stripe.transfers.create({
          currency: 'usd',
          amount: feeBuy,
          destination: course.author,
          transfer_group: data.metadata.group,
        });
        transferPromises.push(transferPromise);
      });
      await Promise.all(transferPromises);
      // Create transaction detail
      await this.transactionRepository.manager
        .getRepository(TransactionDetail)
        .save(transactionDetails);

      await Promise.all(
        courses.map((course) =>
          this.courseService.registerCourse(Number(userBuy), course.id),
        ),
      );
        console.log("HEY")
      const cart = await this.cartRepository.getCartByUserID(Number(userBuy));
      // Remove cart
      await this.cartRepository.remove(cart);
    } catch (err) {
      console.log(err);
    }
  }
}
