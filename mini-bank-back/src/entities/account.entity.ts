import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { LedgerEntry } from './ledger-entry.entity';

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  currency: string; // 'USD' or 'EUR'

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  balance: string;

  @ManyToOne(() => User, (user) => user.accounts)
  user: User;

  @OneToMany(() => LedgerEntry, (entry) => entry.account)
  ledgerEntries: LedgerEntry[];
}
