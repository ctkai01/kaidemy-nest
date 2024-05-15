import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as firebase from 'firebase-admin';
import * as path from 'path';
import { Notification, NotificationToken } from 'src/entities';
import { Repository } from 'typeorm';
import { AcceptNotificationDto } from './dto';
import { ResponseData } from 'src/interface';

firebase.initializeApp({
  credential: firebase.credential.cert(
    path.join(__dirname, '..', '..', 'config/firebase-adminsdk.json'),
  ),
});

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepo: Repository<Notification>,
    @InjectRepository(NotificationToken)
    private readonly notificationTokenRepo: Repository<NotificationToken>,
  ) {}

  async acceptPushNotification(
    userID: number,
    acceptNotificationDto: AcceptNotificationDto,
  ): Promise<ResponseData> {
    const { fcmToken } = acceptNotificationDto;
    await this.notificationTokenRepo.save({
      userId: userID,
      fcmToken,
    });

    const responseData: ResponseData = {
      message: 'Accept push notification successfully!',
    };
    return responseData;
  }

  async pushNotification(): Promise<ResponseData> {
    await firebase.messaging().send({
      notification: { title: 'Test', body: 'hello world' },
      token: 'Dsdsds',
    });

    const responseData: ResponseData = {
      message: 'Push notification successfully!',
    };

    return responseData;
  }
}
