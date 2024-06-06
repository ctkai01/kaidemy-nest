import { LearningLecture } from './learning_lecture.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Asset } from './asset.entity';
import { Curriculum } from './curriculum.entity';
import { QuestionLecture } from './question_lecture.entity';
import { Question } from './question.entity';

@Entity('lectures')
export class Lecture {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'text', nullable: false })
  title: string;

  @Column({ type: 'text', nullable: true })
  article?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @OneToMany(() => Asset, (asset) => asset.lecture, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  assets?: Asset[];

  @OneToMany(
    () => LearningLecture,
    (learningLecture) => learningLecture.lecture,
  )
  learningLectures?: LearningLecture[];
  //   @OneToMany(() => Question, (question) => question.lecture, {
  //     cascade: true,
  //     onDelete: 'CASCADE',
  //   })
  //   questions: Question[];

  @OneToMany(() => Question, (question) => question.lecture)
  questions?: Question[];

  @OneToMany(
    () => QuestionLecture,
    (questionLecture) => questionLecture.lecture,
  )
  questionLectures?: QuestionLecture[];

  @Column({ type: 'boolean', default: false })
  isPromotional?: boolean;

  @Column({ nullable: false })
  curriculumID: number;

  @ManyToOne(() => Curriculum, (curriculum) => curriculum.lectures, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'curriculumID', referencedColumnName: 'id' })
  curriculum?: Curriculum;

  @Column({ type: 'int', nullable: false })
  type: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt?: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  createdAt?: Date;
}
