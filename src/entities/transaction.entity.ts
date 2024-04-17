import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TransactionDetail } from './transaction-detail.entity';
import { User } from './user.entity';

@Entity({ name: 'transactions' })
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  actual: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  fee_stripe: number;

  @Column({ nullable: false })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' }) // Define the ManyToOne relationship with Course
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user?: User;

  @OneToMany(
    () => TransactionDetail,
    (transactionDetail) => transactionDetail.transaction,
  )
  transactionDetails: TransactionDetail[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt?: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  createdAt?: Date;
}
