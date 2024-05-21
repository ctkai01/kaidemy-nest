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
  Entity, OneToMany, PrimaryGeneratedColumn
} from 'typeorm';
import { Learning } from './learning.entity';
import { Checkout } from './checkout.entity';
import { Course } from './course.entity';
import { TopicLearning } from './topic_learning.entity';
import { Report } from './report.entity';
import { QuestionLecture } from './question_lecture.entity';
import { AnswerLecture } from './answer_lecture.entity';
import { Chat } from './chat.entity';
import {  Socket } from './socket.entity';
import { Notification } from './notification.entity';
// import { ChatMember } from './chat-member.entity';
// import { CommentUser } fr/om './c/omment-user.entity';
// import { Comment } from './/comme/nt.entity';
// import { Conversation } from './/conversation.entity';
// import { Message } from './message.entity';
// import { MessageUser } from './message-user.entity';
// import { Message } from './messages.entity';
// import { PostUser } from './post-user.entity';
// import { Post } from './post.entity';
// import { Relation } from './relation.entity';
// import { Story } from './story.entity';
// import { UserStory } from './user-story.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('increment')
  id?: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Exclude({ toPlainOnly: true })
  @Column()
  password: string;

  @Column({ name: 'type_account' })
  typeAccount: number;

  @Column()
  role: number;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ nullable: true })
  headline?: string;

  @Column({ nullable: true })
  biography?: string;

  @Column({ nullable: true, name: 'website_url' })
  websiteURL?: string;

  @Column({ nullable: true, name: 'twitter_url' })
  twitterURL?: string;

  @Column({ nullable: true, name: 'facebook_url' })
  facebookURL?: string;

  @Column({ nullable: true, name: 'linkedIn_url' })
  linkedInURL?: string;

  @Column({ nullable: true, name: 'youtube_url' })
  youtubeURL?: string;

  @Exclude({ toPlainOnly: true })
  @Column({ nullable: true, name: 'email_token' })
  emailToken?: string;

  @Column({ default: false, name: 'is_block' })
  isBlock?: boolean;

  @Column({ nullable: true, name: 'account_stripe_id' })
  accountStripeID?: string;

  @Column({ nullable: true, name: 'account_stripe_status' })
  accountStripeStatus?: number;

  @Column({ nullable: true, name: 'key_account_stripe' })
  keyAccountStripe?: string;

  @OneToMany(() => Checkout, (checkout) => checkout.user)
  checkout?: Checkout[];

  @OneToMany(() => Learning, (learning) => learning.user)
  learnings?: Learning[];

  @OneToMany(() => Socket, (socket) => socket.user)
  sockets?: Socket[];

  @OneToMany(() => TopicLearning, (topicLearning) => topicLearning.user)
  topicLearnings?: TopicLearning[];

  @OneToMany(() => QuestionLecture, (questionLecture) => questionLecture.user)
  questionLectures?: QuestionLecture[];

  @OneToMany(() => Course, (course) => course.user)
  courses?: Course[];

  @OneToMany(() => Report, (report) => report.user)
  reports?: Report[];

  @OneToMany(() => AnswerLecture, (answerLecture) => answerLecture.user)
  answerLectures?: AnswerLecture[];

  @OneToMany(() => Chat, (chat) => chat.fromUser)
  sentChats?: Chat[];

  @OneToMany(() => Chat, (chat) => chat.toUser)
  receivedChats?: Chat[];

  @OneToMany(() => Notification, (notification) => notification.fromUser)
  sentNotifications?: Notification[];

  @OneToMany(() => Notification, (notification) => notification.toUser)
  receivedNotifications?: Notification[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at?: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at?: string;

}
