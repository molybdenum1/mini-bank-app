import { postTransfer, postExchange } from "./transactions";

export async function transfer(
  token: string,
  toAccountId: number | string,
  amount: number,
  fromAccountId?: number | string
) {
  return postTransfer(token, { fromAccountId, toAccountId, amount });
}

export async function exchange(
  token: string,
  payload: {
    fromAccountId?: number | string;
    toAccountId?: number | string;
    amount: number;
    fromCurrency?: string;
    toCurrency?: string;
    rate?: string;
  }
) {
  return postExchange(token, payload);
}
