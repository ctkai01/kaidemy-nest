import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from './category.entity';

@Entity({ name: 'courses' })
export class Course {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    nullable: true,
    type: 'jsonb',
    array: true,
    transformer: {
      to: (value: string[]) => JSON.stringify(value),
      from: (value: string) => JSON.parse(value) as string[],
    },
  })
  outComes?: string[];

  @Column({
    nullable: true,
    type: 'jsonb',
    array: true,
    transformer: {
      to: (value: string[]) => JSON.stringify(value),
      from: (value: string) => JSON.parse(value) as string[],
    },
  })
  intendedFor?: string[];

   @Column({
    nullable: true,
    type: 'jsonb',
    array: true,
    transformer: {
      to: (value: string[]) => JSON.stringify(value),
      from: (value: string) => JSON.parse(value) as string[],
    },
  })
  requirements?: string[];

  @Column({ length: 60, nullable: false })
  productIdStripe: string;

  @Column({ nullable: true })
  levelId?: number;

  @Column()
  categoryId: number;

  @Column()
  subCategoryId: number;

  @Column({ length: 60, nullable: false })
  title: string;

  @Column({ type: 'text', nullable: true })
  welcomeMessage?: string;

  @Column({ type: 'text', nullable: true })
  congratulationsMessage?: string;

  @Column({ length: 120, nullable: true })
  subtitle?: string;

  @Column({ length: 120, nullable: true })
  primarilyTeach?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ default: 0 })
  status?: number;

  @Column({ nullable: true })
  languageId?: number;

  @Column({ nullable: true })
  priceId?: number;

  @Column({ default: 0 })
  reviewStatus?: number;

  @Column({ nullable: false })
  userID?: number;

  @Column({ length: 60, nullable: true })
  promotionalVideo?: string;

  @Column({ length: 120, nullable: true })
  image?: string;

  @ManyToOne(() => Category, (category) => category.courses)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'subCategoryId', referencedColumnName: 'id' })
  subCategory: Category;

  //   @OneToMany(() => Curriculum, (curriculum) => curriculum.course, {
  //     cascade: true,
  //     onDelete: 'CASCADE',
  //   })
  //   curriculums: Curriculum[];

  //   @OneToMany(() => Learning, (learning) => learning.course, {
  //     cascade: true,
  //     onDelete: 'CASCADE',
  //   })
  //   learnings: Learning[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}