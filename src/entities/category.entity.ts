import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

@Entity({ name: 'categories' })
export class Category {
  @PrimaryGeneratedColumn('increment')
  id?: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  parentID?: number;

  @ManyToOne(() => Category, { onDelete: 'CASCADE' }) // Set onDelete: 'CASCADE' here
  @JoinColumn({ name: 'parentID', referencedColumnName: 'id' })
  parent?: Category;

  @OneToMany(() => Category, (category) => category.parent, {
    onDelete: 'CASCADE', // Set onDelete: 'CASCADE' here as well
    cascade: true,
  })
  children?: Category[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at?: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at?: string;
}
