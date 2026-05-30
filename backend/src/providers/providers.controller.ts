import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { Provider } from './provider.interface';

@Controller('dimensions/:dimensionId/providers')
export class ProvidersController {
  constructor(private readonly service: ProvidersService) {}

  @Get()
  findAll(@Param('dimensionId') dimensionId: string): Provider[] {
    return this.service.findAll(dimensionId);
  }

  @Post()
  create(@Param('dimensionId') dimensionId: string, @Body() data: Partial<Provider>): Provider {
    return this.service.create(dimensionId, data);
  }

  @Put(':id')
  update(@Param('dimensionId') dimensionId: string, @Param('id') id: string, @Body() data: Partial<Provider>): Provider {
    const result = this.service.update(dimensionId, id, data);
    if (!result) throw new NotFoundException('Provider not found');
    return result;
  }

  @Delete(':id')
  delete(@Param('dimensionId') dimensionId: string, @Param('id') id: string): { deleted: boolean } {
    const result = this.service.delete(dimensionId, id);
    if (!result) throw new NotFoundException('Provider not found');
    return { deleted: true };
  }
}
