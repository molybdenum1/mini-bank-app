import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Account } from '../entities/account.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Account) private accountsRepo: Repository<Account>,
  ) {}

  async createUser(email: string, name: string, password: string) {
    const hashed = await bcrypt.hash(password, 10);
    const user = this.usersRepo.create({ email, name, password: hashed });
    const saved = await this.usersRepo.save(user);

    // create accounts
    const usd = this.accountsRepo.create({
      currency: 'USD',
      balance: '1000.00',
      user: saved,
    });
    const eur = this.accountsRepo.create({
      currency: 'EUR',
      balance: '500.00',
      user: saved,
    });
    await this.accountsRepo.save([usd, eur]);

    return saved;
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    const user = await this.usersRepo
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
    if (!user) return null;
    return user;
  }

  async findById(id: number) {
    return this.usersRepo.findOne({ where: { id }, relations: ['accounts'] });
  }
}
