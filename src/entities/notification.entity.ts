import { Exclude } from 'class-transformer';
// import moment = require('moment');

// import {
//   ActiveStatus,
//   ActivityStatus,
//   FollowStatus,
//   Gender,
//   PrivateStatus,
//   Status,
//   StoryStatus,
// } from 'src/constants';
import {
  Column,
  Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn
} from 'typeorm';
import { Lecture } from './lecture.entity';
import { User } from './user.entity';
import { NotificationResource, NotificationType } from 'src/constants';


@Entity({ name: 'notifications' })
export class Notification {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  public fromUserId: number;

  @Column()
  public toUserId: number;

  @ManyToOne(() => User, (user) => user.sentNotifications)
  @JoinColumn({ name: 'fromUserId' })
  fromUser: User;

  @ManyToOne(() => User, (user) => user.receivedNotifications)
  @JoinColumn({ name: 'toUserId' })
  toUser: User;

  @Column({ type: 'varchar', nullable: false })
  title: string;

  @Column({ type: 'varchar', nullable: false })
  body: string;

  @Column({ name: 'is_read', default: 0 })
  isRead: boolean;

  @Column({ type: 'enum', enum: NotificationResource })
  entityType: NotificationResource;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({ nullable: false })
  resourceID: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at?: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at?: string;
}
