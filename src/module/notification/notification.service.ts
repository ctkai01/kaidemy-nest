import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as firebase from 'firebase-admin';
import * as path from 'path';
import { Course, Notification, NotificationToken, User } from 'src/entities';
import { Repository } from 'typeorm';
import { AcceptNotificationDto } from './dto';
import { PushNotification, ResponseData } from 'src/interface';
import {
  NotificationPayload,
  NotificationResource,
  TITLE_PURCHASE_COURSE_INSTRUCTOR,
  TITLE_PURCHASE_COURSE_STUDENT,
  TITLE_RECEIVE_MESSAGE,
  bodyPurchaseCourseInstructor,
  bodyPurchaseCourseStudent,
  bodyReceiveMessage,
} from 'src/constants';

firebase.initializeApp({
  credential: firebase.credential.cert(
    path.join(__dirname, '..', '..', 'config/kaidemy-firebase-adminsdk.json'),
  ),
});
type KeyValueObject<K extends string, V> = {
  [key in K]: V;
};

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepo: Repository<Notification>,
    @InjectRepository(NotificationToken)
    private readonly notificationTokenRepo: Repository<NotificationToken>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
  ) {}

  async acceptPushNotification(
    userID: number,
    acceptNotificationDto: AcceptNotificationDto,
  ): Promise<ResponseData> {
    const { fcmToken } = acceptNotificationDto;
    await this.notificationTokenRepo.upsert(
      {
        userId: userID,
        fcmToken,
      },
      ['fcmToken'],
    );

    const responseData: ResponseData = {
      message: 'Accept push notification successfully!',
    };
    return responseData;
  }

  async pushNotification(pushNotification: PushNotification) {
    const { data, type, fromID, toID } = pushNotification;
    try {
      const userSender = await this.userRepo.findOne({
        where: {
          id: fromID,
        },
      });
      switch (type) {
        case NotificationPayload.NOTIFICATION_CHAT: {
          const userFcmToken = await this.notificationTokenRepo.find({
            where: {
              userId: toID[0],
            },
          });
          await Promise.all(
            userFcmToken.map(async (item) => {
              return await firebase.messaging().send({
                notification: {
                  title: TITLE_RECEIVE_MESSAGE,
                  body: bodyReceiveMessage(userSender.name),
                },
                data: {
                  ...data,
                },
                token: item.fcmToken,
              });
            }),
          );

          // Save notification
          const notificationSave: Partial<Notification> = {
            fromUserId: fromID,
            toUserId: toID[0],
            title: TITLE_RECEIVE_MESSAGE,
            body: bodyReceiveMessage(userSender.name),
            type: NotificationResource.Message,
            resourceID: data.chatID,
          };
          await this.notificationsRepo.save(notificationSave);
          break;
        }
        case NotificationPayload.NOTIFICATION_PURCHASE_COURSE_STUDENT: {
          const userFcmToken = await this.notificationTokenRepo.find({
            where: {
              userId: toID[0],
            },
          });
          const course = await this.courseRepo.findOne({
            where: {
              id: data.courseID,
            },
          });
          await Promise.all(
            userFcmToken.map(async (item) => {
              return await firebase.messaging().send({
                notification: {
                  title: TITLE_PURCHASE_COURSE_STUDENT,
                  body: bodyPurchaseCourseStudent(course.title),
                },
                data: {
                  ...data,
                },
                token: item.fcmToken,
              });
            }),
          );
        }
        case NotificationPayload.NOTIFICATION_PURCHASE_COURSE_INSTRUCTOR: {
          const userFcmToken = await this.notificationTokenRepo.find({
            where: {
              userId: toID[0],
            },
          });
          const course = await this.courseRepo.findOne({
            where: {
              id: data.courseID,
            },
          });
          await Promise.all(
            userFcmToken.map(async (item) => {
              return await firebase.messaging().send({
                notification: {
                  title: TITLE_PURCHASE_COURSE_INSTRUCTOR,
                  body: bodyPurchaseCourseInstructor(userSender.name, course.title),
                },
                data: {
                  ...data,
                },
                token: item.fcmToken,
              });
            }),
          );
        }
      }
    } catch (err) {
      throw new Error(`Notification processing failed: ${err}`);
    }
    // await firebase.messaging().send({
    //   notification: { title, body },
    //   data: {
    //     ...data,
    //   },
    //   token,
    //   // 'f5hrOStfYsG0BFjF6KNjx-:APA91bHIqQejTwR32p2zxR6f48DWnKHyQSL00tmoh5wMmuANHK52ltTE47SAfQUd_ep6t31duToyNJK2ClsVR30kbP4HGuZBLdSeHK5-rcFSWzM2PHtpYA3c821umV1sKie4hsx8YmvP',
    // });

    // const responseData: ResponseData = {
    //   message: 'Push notification successfully!',
    // };

    // return responseData;
  }
}
