import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException } from '@nestjs/common';
import { CardsService } from './cards.service';
import { Card } from './card.interface';

@Controller('dimensions/:dimensionId/cards')
export class CardsController {
  constructor(private readonly service: CardsService) {}

  @Get()
  findAll(@Param('dimensionId') dimensionId: string): Card[] {
    return this.service.findAll(dimensionId);
  }

  @Post()
  create(@Param('dimensionId') dimensionId: string, @Body() data: Partial<Card>): Card {
    return this.service.create(dimensionId, data);
  }

  @Put(':id')
  update(@Param('dimensionId') dimensionId: string, @Param('id') id: string, @Body() data: Partial<Card>): Card {
    const result = this.service.update(dimensionId, id, data);
    if (!result) throw new NotFoundException('Card not found');
    return result;
  }

  @Delete(':id')
  delete(@Param('dimensionId') dimensionId: string, @Param('id') id: string): { deleted: boolean } {
    const result = this.service.delete(dimensionId, id);
    if (!result) throw new NotFoundException('Card not found');
    return { deleted: true };
  }
}
