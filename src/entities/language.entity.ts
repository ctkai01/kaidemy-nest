import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Course } from "./course.entity";

@Entity({ name: 'languages' })
export class Language {
  @PrimaryGeneratedColumn('increment')
  id?: number;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => Course, (course) => course.language)
  courses?: Course[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at?: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at?: string;
}
