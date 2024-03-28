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

@Entity({ name: 'assets' })
export class Asset {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 240, nullable: false })
  url: string;

  @Column({ type: 'int', nullable: false })
  lectureId: number;

  @ManyToOne(() => Lecture, (lecture) => lecture.assets, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'lectureId', referencedColumnName: 'id' })
  lecture: Lecture;

  @Column({ type: 'varchar', nullable: true })
  bunnyId: string;

  @Column({ type: 'int', nullable: false })
  type: number;

  @Column({ type: 'int', nullable: true })
  duration: number;

  @Column({ type: 'bigint', nullable: true })
  size: number;

  @Column({ type: 'varchar', nullable: true })
  name: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at?: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at?: string;
}
