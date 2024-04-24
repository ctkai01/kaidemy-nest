import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Course } from "./course.entity";
import { IssueType } from "./issue-type.entity";
import { User } from "./user.entity";

@Entity({ name: 'reports' })
export class Report {
  @PrimaryGeneratedColumn('increment')
  id?: number;

  @Column({ nullable: false })
  userID?: number;

  @ManyToOne(() => User, (user) => user.courses)
  @JoinColumn({ name: 'userID' })
  user: User;

  @Column({ nullable: false })
  courseID?: number;

  @ManyToOne(() => Course, (course) => course.reports)
  @JoinColumn({ name: 'courseID' })
  course: Course;

  @Column({ nullable: false })
  issueTypeID?: number;

  @ManyToOne(() => IssueType, (issueType) => issueType.reports)
  @JoinColumn({ name: 'issueTypeID' })
  issueType: IssueType;

  @Column({ nullable: false })
  description?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at?: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at?: string;
}
