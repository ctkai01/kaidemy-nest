import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Course } from './course.entity';
import { Learning } from './learning.entity';
import { Lecture } from './lecture.entity';
import { Transaction } from './transaction.entity';
import { User } from './user.entity';

@Entity({ name: 'question_lectures' })
export class QuestionLecture {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  public userId: number;

  @Column()
  public courseId: number;

  @Column()
  public lectureId: number;

  @ManyToOne(() => User, (user) => user.questionLectures)
  @JoinColumn({ name: 'userId' })
  user?: User;

  @ManyToOne(() => Course, (course) => course.questionLectures)
  @JoinColumn({ name: 'courseId' })
  course?: Course;

  @ManyToOne(() => Lecture, (lecture) => lecture.questionLectures)
  @JoinColumn({ name: 'lectureId' })
  lecture?: Lecture;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt?: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  createdAt?: string;
}
