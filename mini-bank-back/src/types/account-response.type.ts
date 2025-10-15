import { Account } from '../entities/account.entity';

export type AccountResponse = {
  id: number;
  currency: string;
  balance: string;
  userId: number;
};

export function toAccountResponse(account: Account): AccountResponse {
  return {
    id: account.id,
    currency: account.currency,
    balance: account.balance,
    userId: account.user?.id,
  };
}
