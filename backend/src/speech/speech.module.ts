import { Module } from '@nestjs/common';
import { AudioController } from '../speech/speech.controller';
import { OpenAIService } from '../speech/speech.service';

@Module({
  controllers: [AudioController],
  providers: [OpenAIService],
})
export class SpeechModule {}
