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
import { NotificationResource } from 'src/constants';


@Entity({ name: 'notification_tokens' })
export class NotificationToken {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  public userId: number;

  @ManyToOne(() => User, (user) => user.learnings)
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Column({ name: "fcm_token", type: 'varchar', nullable: false, unique: true })
  fcmToken: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at?: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at?: string;
}
