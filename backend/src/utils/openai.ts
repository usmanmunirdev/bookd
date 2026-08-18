import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';

let openaiInstance: OpenAI;

export const getOpenAIClient = (configService: ConfigService): OpenAI => {
  if (!openaiInstance) {
    const apiKey = configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not defined in environment variables');
    }
    openaiInstance = new OpenAI({ apiKey });
  }
  return openaiInstance;
};

export const generateEmbedding = async (
  text: string,
  configService: ConfigService,
): Promise<number[]> => {
  const openai = getOpenAIClient(configService);
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text,
  });
  return response.data[0].embedding;
};
