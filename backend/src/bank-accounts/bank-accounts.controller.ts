import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException } from '@nestjs/common';
import { BankAccountsService } from './bank-accounts.service';
import { BankAccount } from './bank-account.interface';

@Controller('dimensions/:dimensionId/bank-accounts')
export class BankAccountsController {
  constructor(private readonly service: BankAccountsService) {}

  @Get()
  findAll(@Param('dimensionId') dimensionId: string): BankAccount[] {
    return this.service.findAll(dimensionId);
  }

  @Post()
  create(@Param('dimensionId') dimensionId: string, @Body() data: Partial<BankAccount>): BankAccount {
    return this.service.create(dimensionId, data);
  }

  @Put(':id')
  update(@Param('dimensionId') dimensionId: string, @Param('id') id: string, @Body() data: Partial<BankAccount>): BankAccount {
    const result = this.service.update(dimensionId, id, data);
    if (!result) throw new NotFoundException('Bank account not found');
    return result;
  }

  @Delete(':id')
  delete(@Param('dimensionId') dimensionId: string, @Param('id') id: string): { deleted: boolean } {
    const result = this.service.delete(dimensionId, id);
    if (!result) throw new NotFoundException('Bank account not found');
    return { deleted: true };
  }
}
