import { Controller, Post, Body, Param, Get, Query } from '@nestjs/common';
import { ChatService } from './chat-with-agent.service';
import { SendMessageDto, MarkReadDto } from './dto/chat-with-agent.dto';

@Controller('chat-with-agent')
export class ChatController {
  constructor(private chatService: ChatService) { }

  @Post('user')
  userSend(@Body() dto: SendMessageDto) {
    return this.chatService.userSendMessage(dto);
  }

  @Post('admin')
  adminSend(@Body() body: { chatId: string, adminId: string; message: string }) {
    return this.chatService.adminSendMessage(body.adminId, body?.chatId, body.message);
  }

  @Get('thread/:chatId')
  getThread(
    @Param('chatId') chatId: string,
    @Query('side') side?: any,
  ) {
    return this.chatService.getThread(chatId, side);
  }

  @Get('threads')
  getAllThreads() {
    return this.chatService.getAllThreads();
  }

  @Get('all-chats')
  getUsersInChats(
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.chatService.getAllUsersInChats(search, page, limit);
  }

  @Post('mark-read')
  markRead(@Body() dto: MarkReadDto) {
    return this.chatService.markMessagesAsRead(dto);
  }

  @Post('toggle-ai')
  toggleAi(@Body() body: { chatId: string; enabled: boolean }) {
    return this.chatService.toggleAi(body.chatId, body.enabled);
  }

  @Get('ai-status/:chatId')
  async getAiStatus(@Param('chatId') chatId: string) {
    return this.chatService.getAiStatus(chatId);
  }

}
