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
import { QuestionLecture } from './question_lecture.entity';
import { Transaction } from './transaction.entity';
import { User } from './user.entity';

@Entity({ name: 'answer_lectures' })
export class AnswerLecture {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  public userId: number;

  @Column()
  public questionLectureId: number;

  @ManyToOne(
    () => QuestionLecture,
    (questionLecture) => questionLecture.answerLectures,
    {
      onDelete: 'CASCADE',
    },
  )
  questionLecture: QuestionLecture;

  @ManyToOne(() => User, (user) => user.answerLectures)
  user: User;

  @Column({ nullable: false })
  answer: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt?: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  createdAt?: string;
}
