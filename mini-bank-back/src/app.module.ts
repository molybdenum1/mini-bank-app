import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { User } from './entities/user.entity';
import { Account } from './entities/account.entity';
import { LedgerEntry } from './entities/ledger-entry.entity';
import { Transaction } from './entities/transaction.entity';
import { TransactionsModule } from './transactions/transactions.module';
import { AccountsModule } from './accounts/accounts.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: parseInt(configService.get<string>('DB_PORT', '5432'), 10),
        username: configService.get<string>('DB_USER', 'postgres'),
        password: configService.get<string>('DB_PASS', '1312'),
        database: configService.get<string>('DB_NAME', 'mini_bank'),
        entities: [User, Account, LedgerEntry, Transaction],
        synchronize: true,
      }),
    }),
    UsersModule,
    AuthModule,
    AccountsModule,
    TransactionsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
