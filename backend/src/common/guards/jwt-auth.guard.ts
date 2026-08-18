import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly reflector: Reflector, // needed to read @Public metadata
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // 1️⃣ Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true; // bypass JWT auth
    }

    // 2️⃣ Get request & Authorization header
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid Authorization header format');
    }

    // 3️⃣ Verify JWT
    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      if (!secret) throw new Error('JWT_SECRET not configured');

      const decoded: any = jwt.verify(token, secret);

      // Attach user payload to request
      request.user = decoded;

      return true;
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        throw new ForbiddenException('Token has expired');
      }
      throw new UnauthorizedException('Invalid token');
    }
  }
}
