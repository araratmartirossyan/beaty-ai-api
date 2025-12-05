import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Configuration } from '../entities/Configuration';
import { LLMProvider } from '../entities/KnowledgeBase';

const configRepository = AppDataSource.getRepository(Configuration);

const DEFAULT_CONFIG_KEY = 'default';

/**
 * Get or create default global configuration
 */
const getOrCreateDefaultConfig = async (): Promise<Configuration> => {
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

export const getAIConfig = async (req: Request, res: Response) => {
  try {
    const config = await getOrCreateDefaultConfig();
    return res.json(config);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error fetching AI configuration' });
  }
};

export const updateAIConfig = async (req: Request, res: Response) => {
  const { model, llmProvider, temperature, maxTokens, topP, topK, frequencyPenalty, presencePenalty, stopSequences } =
    req.body;

  try {
    let config = await configRepository.findOne({ where: { key: DEFAULT_CONFIG_KEY } });

    if (!config) {
      config = configRepository.create({
        key: DEFAULT_CONFIG_KEY,
        llmProvider: llmProvider || LLMProvider.OPENAI,
        model: model || null,
        temperature: temperature !== undefined ? temperature : null,
        maxTokens: maxTokens !== undefined ? maxTokens : null,
        topP: topP !== undefined ? topP : null,
        topK: topK !== undefined ? topK : null,
        frequencyPenalty: frequencyPenalty !== undefined ? frequencyPenalty : null,
        presencePenalty: presencePenalty !== undefined ? presencePenalty : null,
        stopSequences: stopSequences || null,
      });
    } else {
      // Update existing configuration
      if (model !== undefined) config.model = model;
      if (llmProvider !== undefined) config.llmProvider = llmProvider;
      if (temperature !== undefined) config.temperature = temperature;
      if (maxTokens !== undefined) config.maxTokens = maxTokens;
      if (topP !== undefined) config.topP = topP;
      if (topK !== undefined) config.topK = topK;
      if (frequencyPenalty !== undefined) config.frequencyPenalty = frequencyPenalty;
      if (presencePenalty !== undefined) config.presencePenalty = presencePenalty;
      if (stopSequences !== undefined) config.stopSequences = stopSequences;
    }

    await configRepository.save(config);
    return res.json(config);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error updating AI configuration' });
  }
};
