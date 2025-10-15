import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransferDto } from './dto/transfer.dto';
import { ExchangeDto } from './dto/exchange.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Get, Query } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../entities/user.entity';

interface TransactionsQuery {
  type?: string;
  page?: string;
  limit?: string;
}

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly txService: TransactionsService) {}

  @Post('transfer')
  async transfer(@Body() dto: TransferDto, @CurrentUser() user: User) {
    const tx = await this.txService.transfer(
      user.id,
      dto.fromAccountId,
      dto.toAccountId,
      dto.amount,
    );
    return { id: tx.transaction.id };
  }

  @Post('exchange')
  async exchange(@Body() dto: ExchangeDto, @CurrentUser() user: User) {
    const tx = await this.txService.exchange(
      user.id,
      dto.fromAccountId,
      dto.toAccountId,
      dto.amount,
      Number(dto.rate),
    );
    return { id: tx.transaction.id };
  }

  @Get()
  async list(@Query() query: TransactionsQuery) {
    const page = query.page ? Number(query.page) : undefined;
    const limit = query.limit ? Number(query.limit) : undefined;
    const res = await this.txService.list({ type: query.type, page, limit });
    return res;
  }
}
