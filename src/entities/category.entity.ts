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

  @Column({ nullable: true }) // Remove parentId column definition
  parentID?: number;

  @JoinColumn({ name: 'parentID', referencedColumnName: 'id' })
  parent?: Category;

  @OneToMany(() => Category, (category) => category.parent, { onDelete: "CASCADE" })
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
