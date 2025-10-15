import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../entities/user.entity';
import { AccountsService } from './accounts.service';

@UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private accountsService: AccountsService) {}

  @Get()
  async listAccounts(@CurrentUser() user: User) {
    const accounts = await this.accountsService.listForUser(user.id);
    return accounts.map((a) => ({
      id: a.id,
      currency: a.currency,
      balance: a.balance,
    }));
  }

  @Get(':id/balance')
  async getBalance(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    try {
      const balance = await this.accountsService.getBalance(id, user.id);
      return { id, balance };
    } catch (error) {
      console.error('Error retrieving account balance:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
    }
  }
}
