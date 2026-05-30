import { Module } from '@nestjs/common';
import { AdminMattersController } from './admin-matters.controller';
import { AdminMattersService } from './admin-matters.service';

@Module({
  controllers: [AdminMattersController],
  providers: [AdminMattersService],
})
export class AdminMattersModule {}
