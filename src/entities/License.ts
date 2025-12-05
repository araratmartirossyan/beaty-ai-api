import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';
import { KnowledgeBase } from './KnowledgeBase';

@Entity()
export class License {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  key!: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt!: Date | null;

  @ManyToOne(() => User, (user) => user.licenses)
  user!: User;

  @ManyToMany(() => KnowledgeBase, (kb) => kb.licenses)
  @JoinTable()
  knowledgeBases!: KnowledgeBase[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
