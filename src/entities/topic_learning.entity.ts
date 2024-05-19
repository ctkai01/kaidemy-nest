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

  @ManyToMany(() => Learning, (learning) => learning.learningTopics, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'topic_learning_learnings', // Explicit join table name
    joinColumn: {
      name: 'topic_learning_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'learning_id',
      referencedColumnName: 'id',
    },
  })
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
