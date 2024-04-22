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

@Entity({ name: 'learning_lectures' })
export class LearningLecture {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  public lectureId: number;

  @Column()
  public learningId: number;

  @ManyToOne(() => Learning, (learning) => learning.learningLectures)
  @JoinColumn({ name: 'learningId' })
  learning?: Learning;

  @ManyToOne(() => Lecture, (lecture) => lecture.learningLectures)
  @JoinColumn({ name: 'lectureId' })
  lecture?: Lecture;

  @Column()
  isDone?: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt?: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  createdAt?: Date;
}
