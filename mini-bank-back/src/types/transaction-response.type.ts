import { Transaction } from '../entities/transaction.entity';
import {
  LedgerEntryResponse,
  toLedgerEntryResponse,
} from './ledger-entry-response.type';

export type TransactionResponse = {
  id: number;
  type: string;
  createdAt: Date;
  ledgerEntries: LedgerEntryResponse[];
};

export function toTransactionResponse(
  transaction: Transaction,
): TransactionResponse {
  return {
    id: transaction.id,
    type: transaction.type,
    createdAt: transaction.createdAt,
    ledgerEntries: transaction.ledgerEntries?.map(toLedgerEntryResponse) || [],
  };
}
