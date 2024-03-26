import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Course } from './course.entity'; // Import the Course entity

@Entity({ name: 'curriculums' })
export class Curriculum {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'varchar', length: 150, nullable: false })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: false })
  courseId: number;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' }) // Define the ManyToOne relationship with Course
  @JoinColumn({ name: 'courseId', referencedColumnName: 'id' })
  course?: Course;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt?: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  createdAt?: Date;
}
