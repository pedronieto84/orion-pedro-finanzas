import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException } from '@nestjs/common';
import { DailyService } from './daily.service';
import { DailyTask } from './daily-task.interface';

@Controller('dimensions/:dimensionId/daily')
export class DailyController {
  constructor(private readonly service: DailyService) {}

  @Get()
  findAll(@Param('dimensionId') dimensionId: string): DailyTask[] {
    return this.service.findAll(dimensionId);
  }

  @Post()
  create(@Param('dimensionId') dimensionId: string, @Body() data: Partial<DailyTask>): DailyTask {
    return this.service.create(dimensionId, data);
  }

  @Put(':id')
  update(@Param('dimensionId') dimensionId: string, @Param('id') id: string, @Body() data: Partial<DailyTask>): DailyTask {
    const result = this.service.update(dimensionId, id, data);
    if (!result) throw new NotFoundException('Daily task not found');
    return result;
  }

  @Delete(':id')
  delete(@Param('dimensionId') dimensionId: string, @Param('id') id: string): { deleted: boolean } {
    const result = this.service.delete(dimensionId, id);
    if (!result) throw new NotFoundException('Daily task not found');
    return { deleted: true };
  }
}
