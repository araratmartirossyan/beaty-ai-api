import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { LLMProvider } from './KnowledgeBase';

@Entity()
export class Configuration {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, default: 'default' })
  key!: string; // 'default' for global config

  // AI Configuration (Global)
  @Column({
    type: 'simple-enum',
    enum: LLMProvider,
    default: LLMProvider.OPENAI,
  })
  llmProvider!: LLMProvider;

  @Column({ type: 'varchar', nullable: true })
  model!: string | null; // Model name (e.g., 'gpt-4', 'gemini-pro', 'claude-3-sonnet-20240229')

  @Column('decimal', { nullable: true, precision: 3, scale: 2 })
  temperature!: number | null; // 0.0 to 2.0 (Gemini), 0.0 to 1.0 (OpenAI/Anthropic)

  @Column('int', { nullable: true })
  maxTokens!: number | null; // Max tokens to generate (OpenAI/Anthropic: maxTokens, Gemini: maxOutputTokens)

  @Column('decimal', { nullable: true, precision: 3, scale: 2 })
  topP!: number | null; // Nucleus sampling parameter (0.0 to 1.0)

  @Column('int', { nullable: true })
  topK!: number | null; // Top-k sampling (Gemini/Anthropic)

  @Column('decimal', { nullable: true, precision: 3, scale: 2 })
  frequencyPenalty!: number | null; // Frequency penalty (OpenAI only: -2.0 to 2.0)

  @Column('decimal', { nullable: true, precision: 3, scale: 2 })
  presencePenalty!: number | null; // Presence penalty (OpenAI only: -2.0 to 2.0)

  @Column('simple-array', { nullable: true })
  stopSequences!: string[] | null; // Stop sequences (Gemini/Anthropic)

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
