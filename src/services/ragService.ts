import { Document } from '@langchain/core/documents';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { LLMProvider } from '../entities/KnowledgeBase';
import { LLMProviderService } from './llmProvider';
import { EmbeddingsProviderService } from './embeddingsProvider';
import { AppDataSource } from '../data-source';
import { Configuration } from '../entities/Configuration';
import { PostgresVectorStore } from '../utils/postgresVectorStore';
import { pgPool } from '../db/pgPool';

const configRepository = AppDataSource.getRepository(Configuration);
const DEFAULT_CONFIG_KEY = 'default';

const getGlobalConfig = async (): Promise<Configuration> => {
  let config = await configRepository.findOne({ where: { key: DEFAULT_CONFIG_KEY } });
  if (!config) {
    config = configRepository.create({
      key: DEFAULT_CONFIG_KEY,
      llmProvider: LLMProvider.OPENAI,
      model: null,
      temperature: null,
      maxTokens: null,
      topP: null,
      topK: null,
      frequencyPenalty: null,
      presencePenalty: null,
      stopSequences: null,
    });
    await configRepository.save(config);
  }
  return config;
};

// Ensure pgvector schema exists (run once per process)
let pgVectorInitialized = false;
const PGVECTOR_DIMENSION = 1536; // text-embedding-3-small

export class RagService {
  private async ensurePgVectorSchema() {
    if (pgVectorInitialized) return;
    const client = await pgPool.connect();
    try {
      await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
      await client.query(`CREATE EXTENSION IF NOT EXISTS vector;`);
      await client.query(`
        CREATE TABLE IF NOT EXISTS kb_documents (
          id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
          kb_id text NOT NULL,
          content text NOT NULL,
          metadata jsonb,
          embedding vector(${PGVECTOR_DIMENSION}) NOT NULL
        );
      `);
      await client.query(`CREATE INDEX IF NOT EXISTS kb_documents_kb_id_idx ON kb_documents (kb_id);`);
      await client.query(`
        CREATE INDEX IF NOT EXISTS kb_documents_embedding_idx
        ON kb_documents
        USING ivfflat (embedding vector_cosine_ops)
        WITH (lists = 100);
      `);
      pgVectorInitialized = true;
    } finally {
      client.release();
    }
  }

  async ingestDocument(kbId: string, text: string, metadata: any) {
    await this.ensurePgVectorSchema();
    const config = await getGlobalConfig();
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const docs = await splitter.createDocuments([text], metadata);
    const embeddings = await EmbeddingsProviderService.getEmbeddings();
    const store = new PostgresVectorStore(embeddings, pgPool, kbId);
    await store.addDocuments(docs);
  }

  async query(kbId: string, question: string, promptInstructions: string | null = null) {
    await this.ensurePgVectorSchema();
    const embeddings = await EmbeddingsProviderService.getEmbeddings();
    const store = new PostgresVectorStore(embeddings, pgPool, kbId);

    const queryVector = await embeddings.embedQuery(question);
    const results = await store.similaritySearchVectorWithScore(queryVector, 4);
    if (results.length === 0) {
      return 'No documents found in this knowledge base. Please upload PDF documents first.';
    }
    const context = results.map(([doc]: [Document, number]) => doc.pageContent).join('\n\n');
    // Build prompt with custom instructions if provided
    let prompt = '';
    if (promptInstructions) {
      prompt += `You must strictly follow these instructions:\n${promptInstructions}\n\n`;
    }
    prompt += `Answer the question based only on the following context:\n\n${context}\n\nQuestion: ${question}`;
    const llm = await LLMProviderService.getLLM();
    const response = await llm.invoke(prompt);
    return response.content;
  }

  async deleteKnowledgeBase(kbId: string) {
    await this.ensurePgVectorSchema();
    const embeddings = await EmbeddingsProviderService.getEmbeddings();
    const store = new PostgresVectorStore(embeddings, pgPool, kbId);
    await store.deleteByKnowledgeBase();
  }
}

export const ragService = new RagService();
