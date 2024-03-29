import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Answer } from './answer.entity';

@Entity({ name: 'questions' })
export class Question {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ nullable: false })
  title: string;

  @Column({ name: 'lecture_id', nullable: false })
  lectureId: number;

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
