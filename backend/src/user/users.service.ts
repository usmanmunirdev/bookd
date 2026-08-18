import { Injectable, NotFoundException, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Between } from 'typeorm';
import { User } from './entities/user.entity';
import { Chat } from '../chat/entities/chat.entity';
import { BookingLog } from '../booking-log/entities/booking-log.entity';
import { ChatWithAgent } from '../chat-with-agent/entities/chat-with-agent.entity';
import { Plan } from '../plans/entities/plan.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Chat)
    private readonly chatRepo: Repository<Chat>,
    @InjectRepository(BookingLog)
    private readonly bookingLogRepo: Repository<BookingLog>,
    @InjectRepository(ChatWithAgent)
    private readonly chatWithAgentRepo: Repository<ChatWithAgent>,
    @InjectRepository(Plan)
    private readonly planRepo: Repository<Plan>,
  ) { }

  async list(params: { page?: number; limit?: number; name?: string }) {
    try {
      const page = params.page ? Number(params.page) : 1;
      const limit = params.limit ? Number(params.limit) : 10;
      const skip = (page - 1) * limit;

      const where = params.name
        ? [
          { firstName: ILike(`%${params.name}%`) },
          { lastName: ILike(`%${params.name}%`) },
          { fullName: ILike(`%${params.name}%`) },
          { email: ILike(`%${params.name}%`) },
        ]
        : undefined;

      const [users, total] = await this.userRepo.findAndCount({
        where,
        relations: {
          subscription: {
            plan: true,
          },
        },
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      });

      const totalPages = Math.ceil(total / limit);

      const mappedUsers = users.map((u) => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        fullName: u.fullName,
        email: u.email,
        phone: u.phone,
        profileImage: u.profileImage,
        emailVerified: u.emailVerified,
        createdAt: u.createdAt,
        plan: (u as any).subscription?.plan?.title ?? null,
      }));

      return {
        users: mappedUsers,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          showing: users.length,
          currentPage: page,
        } as any,
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('Failed to fetch users');
    }
  }

  async getDashboardStats(startDate?: string, endDate?: string) {
    try {
      const whereCondition: any = {};

      if (startDate && endDate) {
        whereCondition.createdAt = Between(
          new Date(startDate),
          new Date(endDate),
        );
      }

      const [
        totalUsers,
        totalBookings,
        totalChats,
        totalAgentChats,
        planWiseUsers,
      ] = await Promise.all([
        this.userRepo.count(
          startDate && endDate ? { where: whereCondition } : {},
        ),

        this.bookingLogRepo.count(
          startDate && endDate ? { where: whereCondition } : {},
        ),

        this.chatRepo.count(
          startDate && endDate ? { where: whereCondition } : {},
        ),

        this.chatWithAgentRepo
          .createQueryBuilder('cwa')
          .select('COUNT(DISTINCT cwa.chatId)', 'count')
          .where('cwa.userId IS NOT NULL')
          .andWhere(startDate && endDate ? 'cwa.createdAt BETWEEN :start AND :end' : '1=1', { start: startDate, end: endDate })
          .getRawOne()
          .then((r) => parseInt(r?.count ?? '0', 10)),

        this.userRepo
          .createQueryBuilder("user")
          .leftJoin("user.subscription", "subscription")
          .leftJoin("subscription.plan", "plan")
          .select("plan.title", "planTitle")
          .addSelect("COUNT(user.id)", "userCount")
          .where("user.emailVerified = :verified", { verified: true })
          .andWhere(
            startDate && endDate
              ? "user.createdAt BETWEEN :start AND :end"
              : "1=1",
            {
              start: startDate,
              end: endDate,
            },
          )
          .groupBy("plan.title")
          .getRawMany()
      ]);

      // Format plan-wise result
      const plans = planWiseUsers.reduce((acc, item) => {
        acc[item.planTitle] = Number(item.userCount);
        return acc;
      }, {});

      return {
        success: true,
        filters: startDate && endDate ? { startDate, endDate } : "ALL_TIME",
        stats: {
          users: totalUsers,
          bookings: totalBookings,
          chats: totalChats,
          agentChats: totalAgentChats,
          plans, // 👈 free: 19, elite: 4
        },
      };
    } catch (error) {
      console.error("Dashboard Stats Error:", error);

      throw new InternalServerErrorException(
        "Failed to fetch dashboard statistics",
      );
    }
  }

  async findOne(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(data: Partial<User>) {
    const entity = this.userRepo.create(data);
    return this.userRepo.save(entity);
  }

  async update(id: string, data: any) {
    const { firstName, lastName, email, phone, fullName } = data;
    const updateData: any = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (fullName !== undefined) updateData.fullName = fullName;
    await this.userRepo.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string) {
    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      await this.bookingLogRepo.delete({ user: { id } });

      await this.chatWithAgentRepo.delete({ user: { id } });

      await this.chatRepo.delete({ user: { id } });

      await this.userRepo.delete(id);

      return user;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new InternalServerErrorException(
        'Failed to delete user and chat history'
      );
    }
  }
}