import { IsInt, IsPositive } from 'class-validator';

export class TransferDto {
  @IsInt()
  fromAccountId: number;

  @IsInt()
  toAccountId: number;

  @IsPositive()
  amount: number; // amount in account currency
}
