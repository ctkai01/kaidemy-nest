import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Cart } from './cart.entity';
import { Category } from './category.entity';
import { Learning } from './learning.entity';
import { Price } from './price.entity';
import { TransactionDetail } from './transaction-detail.entity';
import { Checkout } from './checkout.entity';
import { User } from './user.entity';

@Entity({ name: 'courses' })
export class Course {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    nullable: true,
    type: 'text',
    array: true,
    transformer: {
      to: (value: string[]) => value, // No need to stringify
      from: (value: string) => value, // No need to parse
    },
  })
  outComes?: string[];

  @Column({
    nullable: true,
    type: 'text',
    array: true,
    transformer: {
      to: (value: string[]) => value, // No need to stringify
      from: (value: string) => value, // No need to parse
    },
  })
  intendedFor?: string[];

  @Column({
    nullable: true,
    type: 'text',
    array: true,
    transformer: {
      to: (value: string[]) => value, // No need to stringify
      from: (value: string) => value, // No need to parse
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

  @ManyToOne(() => User, (user) => user.courses)
  @JoinColumn({ name: 'userID' })
  user: User;

  @Column({ length: 60, nullable: true })
  promotionalVideo?: string;

  @Column({ length: 120, nullable: true })
  image?: string;

  @ManyToOne(() => Category, (category) => category.courses)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @ManyToOne(() => Price, (price) => price.courses)
  @JoinColumn({ name: 'priceId' })
  price: Price;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'subCategoryId', referencedColumnName: 'id' })
  subCategory: Category;

  @ManyToMany(() => Cart)
  carts: Cart[];

  @OneToMany(() => Checkout, (checkout) => checkout.course)
  checkout?: Checkout[];

  @OneToMany(() => Learning, (learning) => learning.course)
  learnings?: Learning[];

  @OneToMany(
    () => TransactionDetail,
    (transactionDetail) => transactionDetail.course,
  )
  transactionDetails: TransactionDetail[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
