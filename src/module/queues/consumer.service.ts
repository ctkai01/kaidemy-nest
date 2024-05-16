import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import amqp, { ChannelWrapper } from 'amqp-connection-manager';
import { ConfirmChannel, ConsumeMessage } from 'amqplib';
import { EmailService } from 'src/module/email/email.service';
import Stripe from 'stripe';
import { CourseService } from '../courses/course.service';
import StripeService from '../stripe/stripe.service';
import { Queue } from 'src/constants';
import { PushNotification } from 'src/interface';
import { NotificationService } from '../notification/notification.service';
// import { EmailService } from 'src/email/email.service';

@Injectable()
export class ConsumerService implements OnModuleInit {
  private channelWrapper: ChannelWrapper;
  private readonly logger = new Logger(ConsumerService.name);
  constructor(
    private emailService: EmailService,
    private courseService: CourseService,
    private notificationService: NotificationService,
  ) {
    const connection = amqp.connect(['amqp://localhost']);
    this.channelWrapper = connection.createChannel();
  }

  public async onModuleInit() {
    try {
      await this.channelWrapper.addSetup(async (channel: ConfirmChannel) => {
        await channel.assertQueue(Queue.Email, { durable: true });
        await channel.assertQueue(Queue.Payment, { durable: true });
        await channel.assertQueue(Queue.Notification, { durable: true });
        await channel.consume(Queue.Email, async (message) => {
          this.consumerEmail(message);
        });
        await channel.consume(Queue.Payment, async (message) => {
          this.consumerPayment(message);
        });
         await channel.consume(Queue.Notification, async (message) => {
          this.consumerNotification(message);
        });
      });
      this.logger.log('Consumer service started and listening for messages.');
    } catch (err) {
      this.logger.error('Error starting the consumer:', err);
    }
  }

  public async consumerEmail(message: ConsumeMessage) {
    try {
      const content = JSON.parse(message.content.toString());
      this.logger.log('Received message:', content);
      await this.emailService.sendEmailForgotPassword(content);
      this.channelWrapper.ack(message);
    } catch (err) {
      this.logger.error('Error processing message:', err);
      this.channelWrapper.nack(message);
    }
  }

  public async consumerPayment(message: ConsumeMessage) {
    try {
      const data: Stripe.Charge = JSON.parse(message.content.toString());
      this.logger.log('Received message:', data);
      await this.courseService.paymentProcess(data);
      this.channelWrapper.ack(message);
    } catch (err) {
      this.logger.error('Error processing message:', err);
      this.channelWrapper.nack(message);
    }
  }

  public async consumerNotification(message: ConsumeMessage) {
    try {
      const data: PushNotification = JSON.parse(message.content.toString());
      this.logger.log('Received message:', data);
      await this.notificationService.pushNotification(data);
      this.channelWrapper.ack(message);
    } catch (err) {
      this.logger.error('Error processing message:', err);
      this.channelWrapper.nack(message);
    }
  }
}
