import { Module } from '@nestjs/common';
import { CourseModule } from '../courses/course.module';
import { CourseService } from '../courses/course.service';
import StripeService from '../stripe/stripe.service';
import { ConsumerService } from './consumer.service';
import { ProducerService } from './producer.service';

@Module({
  imports: [CourseModule],
  providers: [ProducerService, ConsumerService],
  exports: [ProducerService],
})
export class QueueModule {}
