import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Question } from './question.entity';

@Entity({ name: 'answers' })
export class Answer {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ name: 'answerText', nullable: false, length: 200 })
  answerText: string;

  @Column({ name: 'isCorrect', nullable: false })
  isCorrect: boolean;

  @Column({ nullable: true })
  explain: string;

  @Column({ nullable: false })
  questionId: number;

  @ManyToOne(() => Question, (question) => question.answers, {
    onDelete: 'CASCADE',
  })
  question?: Question;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at?: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at?: string;
}
