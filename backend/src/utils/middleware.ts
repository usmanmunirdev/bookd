import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const cookieToken = req.cookies?.token;
    const authHeader = req.headers['authorization'];
    const bearerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;

    const token = cookieToken || bearerToken;
    console.log(token);
    if (!token) {
      throw new UnauthorizedException('Authentication token missing');
    }

    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      console.log(decoded);
      req['user'] = decoded;
      console.log(req['user']);
      next();
    } catch (err) {
      console.log(err, 'err in middleware');
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
