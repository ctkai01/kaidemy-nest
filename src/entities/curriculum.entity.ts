import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Course } from './course.entity'; // Import the Course entity
import { Lecture } from './lecture.entity';

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

  @OneToMany(() => Lecture, (lecture) => lecture.curriculum, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  lectures?: Lecture[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt?: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  createdAt?: Date;
}
