import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException } from '@nestjs/common';
import { AdminMattersService } from './admin-matters.service';
import { AdminMatter } from './admin-matter.interface';

@Controller('dimensions/:dimensionId/admin-matters')
export class AdminMattersController {
  constructor(private readonly service: AdminMattersService) {}

  @Get()
  findAll(@Param('dimensionId') dimensionId: string): AdminMatter[] {
    return this.service.findAll(dimensionId);
  }

  @Post()
  create(@Param('dimensionId') dimensionId: string, @Body() data: Partial<AdminMatter>): AdminMatter {
    return this.service.create(dimensionId, data);
  }

  @Put(':id')
  update(@Param('dimensionId') dimensionId: string, @Param('id') id: string, @Body() data: Partial<AdminMatter>): AdminMatter {
    const result = this.service.update(dimensionId, id, data);
    if (!result) throw new NotFoundException('Admin matter not found');
    return result;
  }

  @Delete(':id')
  delete(@Param('dimensionId') dimensionId: string, @Param('id') id: string): { deleted: boolean } {
    const result = this.service.delete(dimensionId, id);
    if (!result) throw new NotFoundException('Admin matter not found');
    return { deleted: true };
  }
}
