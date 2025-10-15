import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import Decimal from 'decimal.js';
import { Account } from '../entities/account.entity';
import { LedgerEntry } from '../entities/ledger-entry.entity';
import { Transaction } from '../entities/transaction.entity';

@Injectable()
export class TransactionsService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Account)
    private accountsRepo: Repository<Account>,
    @InjectRepository(LedgerEntry)
    private ledgerRepo: Repository<LedgerEntry>,
    @InjectRepository(Transaction)
    private transactionsRepo: Repository<Transaction>,
  ) {}

  async transfer(
    initiatorUserId: number,
    fromAccountId: number,
    toAccountId: number,
    amount: number,
  ) {
    return this.dataSource.transaction(async (manager) => {
      // lock both account rows to prevent concurrent updates
      const from = await manager
        .createQueryBuilder(Account, 'a')
        .setLock('pessimistic_write')
        .where('a.id = :id', { id: fromAccountId })
        .innerJoinAndSelect('a.user', 'user')
        .getOne();

      const to = await manager
        .createQueryBuilder(Account, 'a')
        .setLock('pessimistic_write')
        .where('a.id = :id', { id: toAccountId })
        .innerJoinAndSelect('a.user', 'user')
        .getOne();

      if (!from || !to) {
        throw new BadRequestException('Account not found');
      }

      // ensure initiator owns the source account
      if (!from.user || from.user.id !== initiatorUserId) {
        throw new ForbiddenException('You do not own the source account');
      }

      if (from.currency !== to.currency) {
        throw new BadRequestException('Currency mismatch');
      }

      const decFrom = new Decimal(from.balance);
      const decAmt = new Decimal(amount);
      if (decFrom.lt(decAmt)) {
        throw new BadRequestException('Insufficient funds');
      }

      const decTo = new Decimal(to.balance || '0');
      const newFrom = decFrom.minus(decAmt).toFixed(2);
      const newTo = decTo.plus(decAmt).toFixed(2);
      from.balance = newFrom;
      to.balance = newTo;

      const tx = manager.create(Transaction, { type: 'transfer' });
      await manager.save(tx);

      const debit = manager.create(LedgerEntry, {
        account: from,
        transaction: tx,
        amount: '-' + decAmt.toFixed(2),
        description: 'transfer',
      });

      const credit = manager.create(LedgerEntry, {
        account: to,
        transaction: tx,
        amount: decAmt.toFixed(2),
        description: 'transfer',
      });

      await manager.save([from, to]);
      await manager.save([debit, credit]);
      return {
        transaction: tx,
        from: { id: from.id, balance: parseFloat(from.balance) },
        to: { id: to.id, balance: parseFloat(to.balance) },
      };
    });
  }

  async list(opts: { type?: string; page?: number; limit?: number } = {}) {
    const page = opts.page && opts.page > 0 ? opts.page : 1;
    const limit = opts.limit && opts.limit > 0 ? opts.limit : 20;

    const qb = this.transactionsRepo
      .createQueryBuilder('tx')
      .leftJoinAndSelect('tx.ledgerEntries', 'entry')
      .orderBy('tx.createdAt', 'DESC');
    if (opts.type) qb.andWhere('tx.type = :type', { type: opts.type });

    const [items, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async exchange(
    initiatorUserId: number,
    fromAccountId: number,
    toAccountId: number,
    amount: number,
    rate: number,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const from = await manager
        .createQueryBuilder(Account, 'a')
        .setLock('pessimistic_write')
        .where('a.id = :id', { id: fromAccountId })
        .innerJoinAndSelect('a.user', 'user')
        .getOne();

      const to = await manager
        .createQueryBuilder(Account, 'a')
        .setLock('pessimistic_write')
        .where('a.id = :id', { id: toAccountId })
        .innerJoinAndSelect('a.user', 'user')
        .getOne();

      if (!from || !to) {
        throw new BadRequestException('Account not found');
      }

      // for exchanges both accounts must belong to the initiator
      if (
        !from.user ||
        !to.user ||
        from.user.id !== initiatorUserId ||
        to.user.id !== initiatorUserId
      ) {
        throw new ForbiddenException(
          'Both accounts must belong to you to perform an exchange',
        );
      }

      if (isNaN(rate) || rate <= 0) {
        throw new BadRequestException('Invalid rate');
      }

      const decFrom = new Decimal(from.balance);
      const decAmt = new Decimal(amount);
      if (decFrom.lt(decAmt)) {
        throw new BadRequestException('Insufficient funds');
      }

      const decRate = new Decimal(rate);
      const decToAmount = decAmt.mul(decRate);

      const newFrom = decFrom.minus(decAmt).toFixed(2);
      const newTo = new Decimal(to.balance || '0').plus(decToAmount).toFixed(2);
      from.balance = newFrom;
      to.balance = newTo;

      const tx = manager.create(Transaction, { type: 'exchange' });
      await manager.save(tx);

      const debit = manager.create(LedgerEntry, {
        account: from,
        transaction: tx,
        amount: '-' + decAmt.toFixed(2),
        description: 'exchange',
      });

      const credit = manager.create(LedgerEntry, {
        account: to,
        transaction: tx,
        amount: decToAmount.toFixed(2),
        description: 'exchange',
      });

      await manager.save([from, to]);
      await manager.save([debit, credit]);

      return {
        transaction: tx,
        from: { id: from.id, balance: parseFloat(from.balance) },
        to: { id: to.id, balance: parseFloat(to.balance) },
      };
    });
  }
}
