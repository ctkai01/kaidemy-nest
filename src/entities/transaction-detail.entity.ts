import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Course } from './course.entity';
import { Transaction } from './transaction.entity';
import { User } from './user.entity';

@Entity({ name: 'transaction_details' })
  export class TransactionDetail {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    public transactionId: number;

    @Column()
    public courseId: number;

    @ManyToOne(() => Transaction, (transaction) => transaction.transactionDetails)
    @JoinColumn({ name: 'transactionId' })
    transaction?: Transaction;

    @ManyToOne(() => Course, (course) => course.transactionDetails)
    @JoinColumn({ name: 'courseId' })
    course?: Course;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    fee_buy: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt?: Date;

    @Column({
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
      onUpdate: 'CURRENT_TIMESTAMP',
    })
    createdAt?: Date;
  
  }
