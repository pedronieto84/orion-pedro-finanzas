import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException } from '@nestjs/common';
import { BureaucracyService } from './bureaucracy.service';
import { BureaucracyItem } from './bureaucracy-item.interface';

@Controller('dimensions/:dimensionId/bureaucracy')
export class BureaucracyController {
  constructor(private readonly service: BureaucracyService) {}

  @Get()
  findAll(@Param('dimensionId') dimensionId: string): BureaucracyItem[] {
    return this.service.findAll(dimensionId);
  }

  @Post()
  create(@Param('dimensionId') dimensionId: string, @Body() data: Partial<BureaucracyItem>): BureaucracyItem {
    return this.service.create(dimensionId, data);
  }

  @Put(':id')
  update(@Param('dimensionId') dimensionId: string, @Param('id') id: string, @Body() data: Partial<BureaucracyItem>): BureaucracyItem {
    const result = this.service.update(dimensionId, id, data);
    if (!result) throw new NotFoundException('Bureaucracy item not found');
    return result;
  }

  @Delete(':id')
  delete(@Param('dimensionId') dimensionId: string, @Param('id') id: string): { deleted: boolean } {
    const result = this.service.delete(dimensionId, id);
    if (!result) throw new NotFoundException('Bureaucracy item not found');
    return { deleted: true };
  }
}
