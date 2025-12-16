import { BaseLanguageModel } from '@langchain/core/language_models/base';
import { ChatOpenAI } from '@langchain/openai';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatAnthropic } from '@langchain/anthropic';
import { LLMProvider } from '../entities/KnowledgeBase';
import { Configuration } from '../entities/Configuration';
import { AppDataSource } from '../data-source';

const configRepository = AppDataSource.getRepository(Configuration);

const DEFAULT_CONFIG: Partial<Configuration> = {
  llmProvider: LLMProvider.OPENAI,
  model: 'gpt-4o',
  temperature: null,
  maxTokens: null,
  topP: null,
  topK: null,
  frequencyPenalty: null,
  presencePenalty: null,
  stopSequences: null,
};

export class LLMProviderService {
  static async getLLM(): Promise<BaseLanguageModel> {
    const config = (await configRepository.findOne({ where: { key: 'default' } })) || (DEFAULT_CONFIG as Configuration);
    const provider = config.llmProvider || LLMProvider.OPENAI;

    switch (provider) {
      case LLMProvider.OPENAI: {
        if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not set');
        return new ChatOpenAI({
          modelName: config?.model || 'gpt-4o',
          openAIApiKey: process.env.OPENAI_API_KEY,
          temperature: 1.0,
          maxTokens: config.maxTokens || 10000,
          topP: 1.0,
        });
      }

      case LLMProvider.GEMINI: {
        if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set');
        const geminiConfig = {
          model: config.model || 'gemini-pro',
          apiKey: process.env.GEMINI_API_KEY,
          ...(config.temperature !== null ? { temperature: config.temperature } : {}),
          ...(config.maxTokens !== null ? { maxOutputTokens: config.maxTokens } : {}),
          ...(config.topP !== null ? { topP: config.topP } : {}),
          ...(config.topK !== null ? { topK: config.topK } : {}),
          ...(config.stopSequences && config.stopSequences.length > 0 ? { stopSequences: config.stopSequences } : {}),
        };
        return new ChatGoogleGenerativeAI(geminiConfig);
      }

      case LLMProvider.ANTHROPIC: {
        if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');
        const anthropicConfig = {
          model: config.model || 'claude-3-sonnet-20240229',
          anthropicApiKey: process.env.ANTHROPIC_API_KEY,
          ...(config.temperature !== null ? { temperature: config.temperature } : {}),
          ...(config.maxTokens !== null ? { maxTokens: config.maxTokens } : {}),
          ...(config.topP !== null ? { topP: config.topP } : {}),
          ...(config.topK !== null ? { topK: config.topK } : {}),
          ...(config.stopSequences && config.stopSequences.length > 0 ? { stopSequences: config.stopSequences } : {}),
        };
        return new ChatAnthropic(anthropicConfig) as BaseLanguageModel;
      }

      default: {
        if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not set');
        return new ChatOpenAI({
          modelName: 'gpt-4o',
          openAIApiKey: process.env.OPENAI_API_KEY,
        });
      }
    }
  }
}
