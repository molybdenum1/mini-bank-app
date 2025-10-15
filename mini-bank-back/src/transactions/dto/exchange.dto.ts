import { IsInt, IsPositive, IsString } from 'class-validator';

export class ExchangeDto {
  @IsInt()
  fromAccountId: number;

  @IsInt()
  toAccountId: number;

  @IsPositive()
  amount: number;

  @IsString()
  rate: string; // string decimal rate (to multiply)
}
