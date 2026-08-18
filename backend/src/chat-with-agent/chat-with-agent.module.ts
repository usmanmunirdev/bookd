import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatWithAgent } from './entities/chat-with-agent.entity';
import { User } from '../user/entities/user.entity';
import { ChatService } from './chat-with-agent.service';
import { ChatController } from './chat-with-agent.controller';
import { ChatGateway } from './chat-with-agent.gateway';
import { ChatSession } from "./entities/chat-sessions.entity";

@Module({
  imports: [TypeOrmModule.forFeature([ChatWithAgent, User, ChatSession])],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
})
export class ChatWithAgentModule { }
