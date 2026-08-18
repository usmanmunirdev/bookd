import { Pinecone, Index, RecordMetadata } from '@pinecone-database/pinecone';
import { v4 as uuidv4 } from 'uuid';
import { generateEmbedding } from './openai';
import { ConfigService } from '@nestjs/config';

export interface PineconeMetadata extends RecordMetadata {
  userId: string;
  message: string;
  response: string;
  timestamp: number;
}

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const getIndex = (): Index<PineconeMetadata> => {
  return pinecone.index<PineconeMetadata>('bookd-index');
};

export const addChatToPinecone = async (
  userId: string,
  message: string,
  response: string,
  configService: ConfigService,
): Promise<void> => {
  const vectorId = uuidv4();
  const text = `User: ${message}\nAssistant: ${response}`;
  const embedding = await generateEmbedding(text, configService);

  const index = getIndex();
  await index.namespace(`user-${userId}`).upsert([
    {
      id: vectorId,
      values: embedding,
      metadata: { userId, message, response, timestamp: Date.now() },
    },
  ]);
};

export const getHistoryFromPinecone = async (
  userId: string,
  query: string,
  configService: ConfigService,
  limit = 5,
): Promise<PineconeMetadata[]> => {
  const queryEmbedding = await generateEmbedding(query, configService);
  const index = getIndex();

  const results = await index.namespace(`user-${userId}`).query({
    topK: limit,
    vector: queryEmbedding,
    includeMetadata: true,
  });

  return (results.matches || [])
    .map((match) => match.metadata)
    .filter((metadata): metadata is PineconeMetadata => metadata !== undefined);
};
