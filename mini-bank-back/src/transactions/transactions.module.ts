import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { Account } from '../entities/account.entity';
import { LedgerEntry } from '../entities/ledger-entry.entity';
import { Transaction } from '../entities/transaction.entity';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, LedgerEntry, Transaction]),
    AuthModule,
    UsersModule,
  ],
  providers: [TransactionsService],
  controllers: [TransactionsController],
})
export class TransactionsModule {}
