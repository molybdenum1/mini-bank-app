import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../entities/account.entity';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private accountsRepo: Repository<Account>,
  ) {}

  async listForUser(userId: number): Promise<Account[]> {
    return this.accountsRepo.find({ where: { user: { id: userId } } });
  }

  async getBalance(accountId: number, userId: number) {
    const account = await this.accountsRepo.findOne({
      where: { id: accountId, user: { id: userId } },
    });
    if (!account) throw new NotFoundException('Account not found');
    return account.balance;
  }
}
