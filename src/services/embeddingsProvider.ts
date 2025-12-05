import { Embeddings } from '@langchain/core/embeddings';
import { OpenAIEmbeddings } from '@langchain/openai';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { LLMProvider } from '../entities/KnowledgeBase';

export class EmbeddingsProviderService {
  static async getEmbeddings(provider: LLMProvider): Promise<Embeddings> {
    switch (provider) {
      case LLMProvider.OPENAI:
        return new OpenAIEmbeddings({
          openAIApiKey: process.env.OPENAI_API_KEY,
        });

      case LLMProvider.GEMINI:
        if (!process.env.GEMINI_API_KEY) {
          // Fallback to OpenAI if Gemini key not set
          return new OpenAIEmbeddings({
            openAIApiKey: process.env.OPENAI_API_KEY,
          });
        }
        return new GoogleGenerativeAIEmbeddings({
          modelName: 'models/embedding-001',
          apiKey: process.env.GEMINI_API_KEY,
        });

      case LLMProvider.ANTHROPIC:
        // Anthropic doesn't have embeddings, use OpenAI as fallback
        return new OpenAIEmbeddings({
          openAIApiKey: process.env.OPENAI_API_KEY,
        });

      default:
        return new OpenAIEmbeddings({
          openAIApiKey: process.env.OPENAI_API_KEY,
        });
    }
  }
}
