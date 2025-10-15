import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { User } from '../entities/user.entity';

// Extend Express Request interface to include 'user'
declare module 'express-serve-static-core' {
  interface Request {
    user?: User; // Replace 'any' with your actual user type if available
  }
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req: Request = ctx.switchToHttp().getRequest();
    return req.user;
  },
);
