import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Answer } from './answer.entity';
import { Lecture } from './lecture.entity';

@Entity({ name: 'questions' })
export class Question {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  lectureId: number;

  @ManyToOne(() => Lecture, (lecture) => lecture.questions)
  @JoinColumn({ name: 'lectureId' })
  lecture?: Lecture;

  @OneToMany(() => Answer, (answer) => answer.question, { cascade: true })
  answers?: Answer[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at?: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at?: string;
}
