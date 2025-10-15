import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { LedgerEntry } from './ledger-entry.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string; // e.g. 'transfer', 'deposit', 'withdrawal'

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => LedgerEntry, (entry) => entry.transaction, { cascade: true })
  ledgerEntries: LedgerEntry[];
}
