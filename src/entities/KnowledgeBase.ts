import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { License } from './License';

export enum LLMProvider {
  OPENAI = 'OPENAI',
  GEMINI = 'GEMINI',
  ANTHROPIC = 'ANTHROPIC',
}

@Entity()
export class KnowledgeBase {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description!: string;

  @Column('simple-json', { nullable: true })
  documents!: any; // Stores metadata about uploaded files

  @Column('text', { nullable: true })
  promptInstructions!: string | null; // Custom prompt instructions for this knowledge base

  @ManyToMany(() => License, (license) => license.knowledgeBases)
  licenses!: License[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
