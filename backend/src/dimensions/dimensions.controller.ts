import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException } from '@nestjs/common';
import { DimensionsService } from './dimensions.service';
import { Dimension } from './dimension.interface';

@Controller('dimensions')
export class DimensionsController {
  constructor(private readonly dimensionsService: DimensionsService) {}

  @Get()
  findAll(): Dimension[] {
    return this.dimensionsService.findAll();
  }

  @Post()
  create(@Body() data: Partial<Dimension>): Dimension {
    return this.dimensionsService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<Dimension>): Dimension {
    const result = this.dimensionsService.update(id, data);
    if (!result) throw new NotFoundException('Dimension not found');
    return result;
  }

  @Delete(':id')
  delete(@Param('id') id: string): { deleted: boolean } {
    const result = this.dimensionsService.delete(id);
    if (!result) throw new NotFoundException('Dimension not found');
    return { deleted: true };
  }
}
