import { Injectable } from '@nestjs/common';
import { config } from 'dotenv';
import OpenAI from 'openai';
import * as fs from 'fs';

config();

@Injectable()
export class OpenAIService {
  private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  async transcribeAudio(filePath: string) {
    const response = await this.openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: 'whisper-1',
    });

    return response.text;
  }
}
