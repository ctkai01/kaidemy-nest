import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import amqp, { ChannelWrapper } from 'amqp-connection-manager';
import { Channel } from 'amqplib';
import { Queue } from 'src/constants';
import { MailForgot, PushNotification } from 'src/interface';
import Stripe from 'stripe';

@Injectable()
export class ProducerService {
  private channelWrapper: ChannelWrapper;
  constructor() {
    const connection = amqp.connect(['amqp://localhost']);
    this.channelWrapper = connection
      .createChannel
      //   {
      //   setup: (channel: Channel) => {
      //     return channel.assertQueue(Queue.Email, { durable: true });
      //   },
      // }
      ();
  }

  async addToEmailQueue(mail: MailForgot) {
    try {
      await this.channelWrapper.sendToQueue(
        Queue.Email,
        Buffer.from(JSON.stringify(mail)),
        {
          persistent: true,
        },
      );
      Logger.log('Sent To Queue');
    } catch (error) {
      throw new HttpException(
        'Error adding mail to queue',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async addPaymentToQueue(metadata: Stripe.Charge) {
    try {
      await this.channelWrapper.sendToQueue(
        Queue.Payment,
        Buffer.from(JSON.stringify(metadata)),
        {
          persistent: true,
        },
      );
      Logger.log('Sent To Queue');
    } catch (error) {
      throw new HttpException(
        'Error adding payment to queue',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async addToNotificationQueue(pushNotification: PushNotification) {
    try {
      await this.channelWrapper.sendToQueue(
        Queue.Notification,
        Buffer.from(JSON.stringify(pushNotification)),
        {
          persistent: true,
        },
      );
      Logger.log('Sent Notification To Queue');
    } catch (error) {
      throw new HttpException(
        'Error adding notification to queue',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
