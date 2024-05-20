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
  Order,
  NotificationType,
  TEACHER,
} from 'src/constants';
import { GetNotificationDto } from './dto/get-notifications-dto';
import { PageMetaDto } from 'src/common/paginate/page-meta.dto';
import { PageDto } from 'src/common/paginate/paginate.dto';

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

  async getNotifications(
    userID: number,
    getNotificationDto: GetNotificationDto,
  ): Promise<ResponseData> {
    const { skip, order, page, size } = getNotificationDto;

    const queryBuilder = this.notificationsRepo
      .createQueryBuilder('notifications')
      .orderBy('notifications.created_at', Order.DESC)
      .where('notifications.toUserId = :toUserId', {
        toUserId: userID,
      });

    const itemCount = await queryBuilder.getCount();
    queryBuilder.skip(skip).take(size);

    const { entities: notifications } = await queryBuilder.getRawAndEntities();

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: {
        skip,
        order: Order.DESC,
        page,
        size,
      },
    });

    const data = new PageDto(notifications, pageMetaDto);

    const responseData: ResponseData = {
      message: 'Get notification successfully!',
      data,
    };
    return responseData;
  }

  async readAllNotifications(userID: number): Promise<ResponseData> {
    this.notificationsRepo
      .createQueryBuilder('notifications')
      .update(Notification)
      .set({
        isRead: true,
      })
      .where('"toUserId" = :toUserId', {
        toUserId: userID,
      })
      .execute();
    const responseData: ResponseData = {
      message: 'Read all notification successfully!',
    };
    return responseData;
  }

  async countNoReadNotifications(userID: number): Promise<ResponseData> {
    const noReadNotification = await this.notificationsRepo.find({
      where: {
        toUserId: userID,
        isRead: false
      }
    })
   
    const responseData: ResponseData = {
      message: 'Get count no read notification successfully!',
      data: {
        count: noReadNotification.length,
      },
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

          const userReceiver = await this.userRepo.findOne({
            where: {
              id: toID[0],
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
            entityType: NotificationResource.Message,
            type:
              userReceiver.role === TEACHER
                ? NotificationType.INSTRUCTOR
                : NotificationType.STUDENT,
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

          // Save notification
          const notificationSave: Partial<Notification> = {
            fromUserId: fromID,
            toUserId: toID[0],
            title: TITLE_PURCHASE_COURSE_STUDENT,
            body: bodyPurchaseCourseStudent(course.title),
            entityType: NotificationResource.Course,
            type: NotificationType.STUDENT,
            resourceID: course.id,
          };
          await this.notificationsRepo.save(notificationSave);
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
                  body: bodyPurchaseCourseInstructor(
                    userSender.name,
                    course.title,
                  ),
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
            title: TITLE_PURCHASE_COURSE_INSTRUCTOR,
            body: bodyPurchaseCourseInstructor(userSender.name, course.title),
            entityType: NotificationResource.Course,
            type: NotificationType.INSTRUCTOR,
            resourceID: course.id,
          };
          await this.notificationsRepo.save(notificationSave);
        }
      }
    } catch (err) {
      throw new Error(`Notification processing failed: ${err}`);
    }
  }
}
