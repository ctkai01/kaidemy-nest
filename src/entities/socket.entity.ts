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

@Entity({ name: 'sockets' })
export class Socket {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  public userId: number;

  @ManyToOne(() => User, (user) => user.learnings)
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Column({ type: 'varchar', nullable: false })
  socketId: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at?: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at?: string;
}
