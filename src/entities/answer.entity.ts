import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Question } from './question.entity';

@Entity({ name: 'answers' })
export class Answer {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ name: 'answer_text', nullable: false, length: 200 })
  answerText: string;

  @Column({ name: 'is_correct', nullable: false })
  isCorrect: boolean;

  @Column({ nullable: true })
  explain: string;

  @Column({ name: 'question_id', nullable: false })
  questionId: number;

  @ManyToOne(() => Question, (question) => question.answers)
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
