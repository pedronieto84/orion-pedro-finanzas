import { Module } from '@nestjs/common';
import { BureaucracyController } from './bureaucracy.controller';
import { BureaucracyService } from './bureaucracy.service';

@Module({
  controllers: [BureaucracyController],
  providers: [BureaucracyService],
})
export class BureaucracyModule {}
