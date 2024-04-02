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
  Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn
} from 'typeorm';
import { Course } from './course.entity';
import { Lecture } from './lecture.entity';
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

@Entity({ name: 'carts' })
export class Cart {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'int', nullable: false })
  userId: number;

  @Column({ nullable: true })
  key?: string;

  @ManyToMany(() => Course)
  @JoinTable()
  courses?: Course[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at?: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at?: string;
}