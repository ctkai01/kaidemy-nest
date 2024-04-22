import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Course } from './course.entity';
import { LearningLecture } from './learning_lecture.entity';
import { Transaction } from './transaction.entity';
import { User } from './user.entity';

@Entity({ name: 'learning' })
export class Learning {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  public userId: number;

  @Column()
  public courseId: number;

  @ManyToOne(() => User, (user) => user.learnings)
  @JoinColumn({ name: 'userId' })
  user?: User;

  @ManyToOne(() => Course, (course) => course.transactionDetails)
  @JoinColumn({ name: 'courseId' })
  course?: Course;

  @Column({ nullable: true })
  process?: number;

  @Column({ nullable: false })
  type: number;

  @Column({ nullable: true })
  starCount?: number;

  @Column({ nullable: true })
  comment?: string;

  @OneToMany(
    () => LearningLecture,
    (learningLecture) => learningLecture.learning,
  )
  learningLectures?: LearningLecture[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt?: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  createdAt?: Date;
}
