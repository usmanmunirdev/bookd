import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatWithAgent } from './entities/chat-with-agent.entity';
import { ChatSession } from './entities/chat-sessions.entity';
import { User } from '../user/entities/user.entity';
import { SendMessageDto, MarkReadDto } from './dto/chat-with-agent.dto';
import { ChatGateway } from './chat-with-agent.gateway';
import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';
import { BOOKD_SIMPLE_PROMPT } from './prompts/chat-with-agent.prompt';

@Injectable()
export class ChatService {
  private readonly openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  constructor(
    @InjectRepository(ChatWithAgent)
    private chatRepo: Repository<ChatWithAgent>,
    @InjectRepository(ChatSession)
    private sessionRepo: Repository<ChatSession>,
    private chatGateway: ChatGateway,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) { }

  // User sends a message
  async userSendMessage(dto: SendMessageDto) {
    try {
      let chatId = dto.chatId;
      let isNewChat = false;
      console.log("userSendMessage called with dto:", dto);
      // 1. If chatId is NOT provided, check for last existing chat
      if (!chatId) {
        console.log("No chatId provided, checking for existing chat...");
        const existingChat = await this.chatRepo.findOne({
          where: { userId: dto.userId },
          order: { createdAt: 'DESC' },
          select: ['chatId'],
        });

        if (existingChat) {
          console.log("Existing chat found with chatId:", chatId);
          chatId = existingChat.chatId;
        } else {
          chatId = uuidv4();
          isNewChat = true;
        }
      } else {
        // If chatId is passed, check if it exists
        const chatExist = await this.chatRepo.exists({ where: { chatId } });
        if (!chatExist) {
          isNewChat = true; // ChatId is provided but not in DB → new chat
        }
      }
      console.log("Using chatId:", chatId);
      // 2. Load user info
      const user = await this.userRepo.findOne({
        where: { id: dto.userId },
        select: ['id', 'fullName', 'email', 'profileImage'],
      });

      // 3. Create & save message
      const chat = this.chatRepo.create({
        chatId,
        message: dto.message,
        userId: dto.userId,
        senderType: 'USER',
      });

      await this.chatRepo.save(chat);

      // 4. Emit: newMessage (always)
      this.chatGateway.server.to(chatId).emit('newMessage', {
        id: chat.id,
        chatId,
        message: chat.message,
        senderType: chat.senderType,
        createdAt: chat.createdAt,
        user,
      });

      // 5. SPECIAL CASE: NEW CHAT → emit "newNotification"
      this.chatGateway.server.emit('newNotification', {
        chatId,
        user,
      });

      // 🔍 check if AI is enabled for this chat
      let session = await this.sessionRepo.findOne({ where: { chatId } });

      if (!session) {
        // if session doesn't exist → create with default AI = true
        session = this.sessionRepo.create({ chatId, aiEnabled: true });
        await this.sessionRepo.save(session);
      }

      // If AI disabled → do nothing
      if (!session.aiEnabled) {
        return { success: true, message: "Message sent", chatId };
      }

      // 🧠 AI is enabled → generate reply
      const aiReply = await this.generateAIReply(chatId, dto.message);

      // Save AI message
      const aiChat = this.chatRepo.create({
        chatId,
        message: aiReply,
        senderType: 'ADMIN',
      });

      await this.chatRepo.save(aiChat);

      // Emit AI reply to UI
      this.chatGateway.server.to(chatId).emit('newMessage', {
        id: aiChat.id,
        chatId,
        message: aiChat.message,
        senderType: aiChat.senderType,
        createdAt: aiChat.createdAt,
      });

      return { success: true, message: "Message sent", chatId };
    } catch (err: any) {
      throw new BadRequestException(err.message || "Failed to send user message");
    }
  }

  // Admin sends a message
  async adminSendMessage(adminId: string, chatId: string, message: string) {
    try {
      const threadExists = await this.chatRepo.findOne({ where: { chatId } });
      if (!threadExists) throw new NotFoundException('Thread not found');

      const chat = this.chatRepo.create({
        chatId,
        message,
        adminId,
        senderType: 'ADMIN',
      });

      await this.chatRepo.save(chat);

      this.chatGateway.server.to(chatId).emit('newMessage', {
        id: chat.id,
        chatId,
        message: chat.message,
        senderType: chat.senderType,
        createdAt: chat.createdAt,
      });

      return { success: true, message: 'Admin message sent', chatId };
    } catch (err: any) {
      throw new BadRequestException(err.message || 'Failed to send admin message');
    }
  }

  // Get chat thread by chatId
  async getThread(chatId: string, side: 'ADMIN' | 'USER' | null) {
    try {
      // 1. Load all messages
      const messages = await this.chatRepo.find({
        where: { chatId },
        relations: ['user', 'admin'],
        order: { createdAt: 'ASC' },
      });

      // 2. Determine which senderType should be marked read
      let targetSenderType: any = null;

      if (side?.toLocaleLowerCase() === 'admin') {
        targetSenderType = 'USER';
      } else if (side?.toLocaleLowerCase() === 'user') {
        targetSenderType = 'ADMIN';
      }

      // 3. Mark relevant messages as read
      if (targetSenderType) {
        await this.chatRepo.update(
          {
            chatId,
            senderType: targetSenderType,
            isRead: false,
          },
          {
            isRead: true,
            readAt: new Date(),
          },
        );
      }

      return { success: true, messages };
    } catch (err) {
      console.log(err);
      throw new BadRequestException('Failed to load thread');
    }
  }

  // List all threads with last message time
  async getAllThreads() {
    try {
      const threads = await this.chatRepo
        .createQueryBuilder('chat')
        .select('chat.chatId', 'chatId')
        .addSelect('MAX(chat.createdAt)', 'lastMessageAt')
        .groupBy('chat.chatId')
        .orderBy('lastMessageAt', 'DESC')
        .getRawMany();

      return { success: true, threads };
    } catch (err) {
      throw new BadRequestException('Failed to load threads');
    }
  }

  async getAllUsersInChats(search?: string, page: number = 1, limit: number = 10) {
    try {
      const take = Number(limit) || 10;
      const skip = (Number(page) - 1) * take;

      const query = this.chatRepo
        .createQueryBuilder('chat')
        .leftJoin(User, 'user', 'user.id = chat.userId')
        .where('chat.userId IS NOT NULL');

      if (search && search.trim()) {
        query.andWhere(
          `(
          LOWER(user.email) LIKE LOWER(:search)
          OR LOWER(user.firstName) LIKE LOWER(:search)
          OR LOWER(user.lastName) LIKE LOWER(:search)
          OR LOWER(user.fullName) LIKE LOWER(:search)
          OR LOWER(CONCAT(user.firstName, ' ', user.lastName)) LIKE LOWER(:search)
        )`,
          { search: `%${search.trim()}%` },
        );
      }

      // COUNT subquery for total
      const countQuery = this.chatRepo
        .createQueryBuilder('chat')
        .leftJoin(User, 'user', 'user.id = chat.userId')
        .where('chat.userId IS NOT NULL')
        .select('COUNT(DISTINCT user.id)', 'count');

      if (search && search.trim()) {
        countQuery.andWhere(
          `(
          LOWER(user.email) LIKE LOWER(:search)
          OR LOWER(user.firstName) LIKE LOWER(:search)
          OR LOWER(user.lastName) LIKE LOWER(:search)
          OR LOWER(user.fullName) LIKE LOWER(:search)
          OR LOWER(CONCAT(user.firstName, ' ', user.lastName)) LIKE LOWER(:search)
        )`,
          { search: `%${search.trim()}%` },
        );
      }

      const [users, countResult] = await Promise.all([
        query
          .select([
            'user.id',
            'user.profileImage',
            'user.fullName',
            'user.firstName',
            'user.lastName',
            'user.email',
            'user.phone',
            'MAX(chat.chatId) as chatId',
          ])
          .groupBy('user.id')
          .addGroupBy('user.profileImage')
          .addGroupBy('user.firstName')
          .addGroupBy('user.lastName')
          .addGroupBy('user.fullName')
          .addGroupBy('user.email')
          .addGroupBy('user.phone')
          .offset(skip)
          .limit(take)
          .getRawMany(),
        countQuery.getRawOne(),
      ]);

      const total = parseInt(countResult?.count ?? '0', 10);
      const hasMore = skip + users.length < total;

      const mappedUsers = users.map((u) => ({
        id: u.user_id,
        profileImage: u.user_profileImage,
        firstName: u.user_firstName,
        lastName: u.user_lastName,
        fullName:
          u.user_fullName ??
          `${u.user_firstName ?? ''} ${u.user_lastName ?? ''}`.trim(),
        email: u.user_email,
        phone: u.user_phone,
        chatId: u.chatid,
      }));

      return { success: true, users: mappedUsers, total, page: Number(page), hasMore };
    } catch (err) {
      console.error(err);
      throw new BadRequestException('Failed to fetch users in chats');
    }
  }

  async markMessagesAsRead(dto: MarkReadDto) {
    try {
      const { chatId, readerType } = dto;

      // USER is reading → mark ADMIN messages as read
      // ADMIN is reading → mark USER messages as read
      const senderToMark = readerType === 'USER' ? 'ADMIN' : 'USER';

      const unreadMessages = await this.chatRepo.find({
        where: { chatId, senderType: senderToMark, isRead: false },
      });

      if (unreadMessages.length === 0) {
        return { success: true, updated: 0 };
      }

      for (const msg of unreadMessages) {
        msg.isRead = true;
        msg.readAt = new Date();
      }

      await this.chatRepo.save(unreadMessages);

      // Emit socket event for read receipts
      this.chatGateway.server.to(chatId).emit('messagesRead', {
        chatId,
        readerType,
        messageIds: unreadMessages.map((m) => m.id),
      });

      return { success: true, updated: unreadMessages.length };
    } catch (err) {
      throw new BadRequestException('Failed to mark messages as read');
    }
  }

  async toggleAi(chatId: string, enabled: boolean) {
    try {
      let session = await this.sessionRepo.findOne({ where: { chatId } });

      if (!session) {
        session = this.sessionRepo.create({
          chatId,
          aiEnabled: enabled,
        });
      } else {
        session.aiEnabled = enabled;
      }

      await this.sessionRepo.save(session);

      this.chatGateway.server.to(chatId).emit("aiToggleUpdated", {
        chatId,
        aiEnabled: enabled,
      });

      return { success: true, aiEnabled: enabled };
    } catch (err) {
      console.error("Failed to toggle AI:", err);
      throw new BadRequestException("Failed to toggle AI");
    }
  }

  async getAiStatus(chatId: string) {
    try {
      let session = await this.sessionRepo.findOne({ where: { chatId } });

      if (!session) {
        // Default ON if session not found
        session = this.sessionRepo.create({
          chatId,
          aiEnabled: true,
        });
        await this.sessionRepo.save(session);
      }

      return { chatId, aiEnabled: session.aiEnabled };
    } catch (err) {
      console.error("Failed to fetch AI status", err);
      throw new BadRequestException("Failed to fetch AI status");
    }
  }

  async generateAIReply(chatId: string, userMsg: string): Promise<string> {
    try {
      // Load last 15 messages
      const history = await this.getLastMessages(chatId, 15);

      const messages: ChatCompletionMessageParam[] = [
        {
          role: "system",
          content: BOOKD_SIMPLE_PROMPT,
        },
        ...history.reverse().map<ChatCompletionMessageParam>((msg) => ({
          role: msg.senderType === "USER" ? "user" : "assistant",
          content: msg.message,
        })),
        {
          role: "user",
          content: userMsg,
        },
      ];

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages,
      });

      return completion.choices[0].message.content || "Let me help you with that.";
    } catch (error) {
      console.error("AI error:", error);
      return "Sorry, I'm having trouble responding right now.";
    }
  }

  async getLastMessages(chatId: string, limit: number = 15) {
    return this.chatRepo.find({
      where: { chatId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

}

