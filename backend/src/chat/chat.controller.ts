import { Controller, Post, Body, Req, Headers, InternalServerErrorException, Get, Query, UseGuards, Param } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatMessageDto } from './dto/create-chat.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  @Post()
  async chat(@Body() dto: ChatMessageDto, @Req() req: any) {
    const userId = req.user?.sub;
    const timezone =
      req.headers['x-timezone'] ||
      req.headers['timezone'];
    return this.chatService.processPrompt(dto, userId, timezone);
  }

  @Get('all')
  async getAllChats(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    try {
      const pageNumber = page ? Number(page) : 1;
      const limitNumber = limit ? Number(limit) : 10;

      const chatHistory = await this.chatService.getAllChatsGroupedByThread(
        pageNumber,
        limitNumber,
        search,
      );

      return { success: true, data: chatHistory };
    } catch (error) {
      if (error.status) throw error;
      console.error('Error in getAllChats:', error);
      throw new InternalServerErrorException('Failed to fetch chat history');
    }
  }

  @Get('thread/:threadId')
  @UseGuards(JwtAuthGuard)
  async getChatsByThread(@Param('threadId') threadId: string, @Req() req: any) {
    const userId = req.user?.sub;
    return this.chatService.getChatsByThread(threadId, userId);
  }

  @Get('preview')
  @UseGuards(JwtAuthGuard)
  async getPreviews(@Req() req: any) {
    const userId = req.user?.sub;
    return this.chatService.getPreviews(userId);
  }

}
