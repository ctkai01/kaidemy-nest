import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { Learning } from './learning.entity';
import { Question } from './question.entity';
import { User } from './user.entity';

@Entity({ name: 'topic_learnings' })
export class TopicLearning {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'user_id', nullable: false })
  userId: number;

  @ManyToOne(() => User, (user) => user.topicLearnings)
  user?: User;

  @ManyToMany(() => Learning,  { onDelete: 'CASCADE' })
  @JoinTable()
  learnings: Learning[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at?: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at?: string;
}
