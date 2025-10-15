import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Account } from './account.entity';
import { Transaction } from './transaction.entity';

@Entity('ledger')
export class LedgerEntry {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Account, (account) => account.ledgerEntries)
  account: Account;

  @ManyToOne(() => Transaction, (transaction) => transaction.ledgerEntries)
  transaction: Transaction;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount: string; // positive or negative

  @Column()
  description: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
