import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserResponse } from '../types/user-response.type';
import { toUserResponse } from '../types/user-response.type';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    pass: string,
  ): Promise<UserResponse | null> {
    try {
      const user = await this.usersService.findByEmailWithPassword(email);
      if (!user) return null;

      const match = await bcrypt.compare(pass, user.password);
      if (!match) return null;

      const userResp = toUserResponse(user);
      return userResp;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  login(user: UserResponse): { access_token: string } {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(email: string, name: string, password: string) {
    const user = await this.usersService.createUser(email, name, password);
    // remove password before returning tok en

    const userResp = toUserResponse(user);
    return this.login(userResp);
  }
}
