import { LedgerEntry } from '../entities/ledger-entry.entity';

export type LedgerEntryResponse = {
  id: number;
  accountId: number;
  transactionId: number;
  amount: string;
  description: string;
  createdAt: Date;
};

export function toLedgerEntryResponse(entry: LedgerEntry): LedgerEntryResponse {
  return {
    id: entry.id,
    accountId: entry.account?.id,
    transactionId: entry.transaction?.id,
    amount: entry.amount,
    description: entry.description,
    createdAt: entry.createdAt,
  };
}
