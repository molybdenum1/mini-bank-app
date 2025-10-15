import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { Request } from 'express';
import { User } from '../entities/user.entity';

interface JwtPayload {
  sub: number | string;
  email?: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request & { user?: User }>();
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid Authorization header',
      );
    }

    const token = auth.split(' ')[1];
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      if (!payload || payload.sub === undefined || payload.sub === null) {
        throw new UnauthorizedException('Invalid token payload');
      }

      const userId =
        typeof payload.sub === 'string' ? Number(payload.sub) : payload.sub;
      const user = await this.usersService.findById(userId);
      if (!user) throw new UnauthorizedException('User not found');

      req.user = user;
      return true;
    } catch (err) {
      console.error('JWT verification failed:', err);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
