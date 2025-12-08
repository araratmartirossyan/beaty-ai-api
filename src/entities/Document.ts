import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { KnowledgeBase } from './KnowledgeBase';

@Entity()
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  fileName!: string;

  @Column()
  filePath!: string; // Path to stored PDF file

  @Column('simple-json', { nullable: true })
  metadata!: any; // Additional metadata (file size, page count, etc.)

  @ManyToOne(() => KnowledgeBase, (kb) => kb.documents, { onDelete: 'CASCADE' })
  knowledgeBase!: KnowledgeBase;

  @Column()
  knowledgeBaseId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
