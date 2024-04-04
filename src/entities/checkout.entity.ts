import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Course } from './course.entity';
import { User } from './user.entity';

@Entity({ name: 'checkouts' })
export class Checkout {
  @PrimaryGeneratedColumn('increment')
  id?: number;

  @Column()
  checkoutSession: string;

  @Column({ nullable: false })
  courseId?: number;

  @Column({ nullable: false })
  userId?: number;

  @ManyToOne(() => User, (user) => user.checkout
  // , {
  //   onDelete: 'CASCADE',
  // }
  )
  @JoinColumn({ name: 'userId' })
  user?: User;

  @ManyToOne(() => Course, (course) => course.checkout
  // , {
  //   onDelete: 'CASCADE',
  // }
  )
  @JoinColumn({ name: 'courseId' })
  course?: Course;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at?: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at?: string;
}
