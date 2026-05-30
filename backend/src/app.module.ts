import { Module } from '@nestjs/common';
import { StorageModule } from './storage/storage.module';
import { DimensionsModule } from './dimensions/dimensions.module';
import { BankAccountsModule } from './bank-accounts/bank-accounts.module';
import { CardsModule } from './cards/cards.module';
import { ProvidersModule } from './providers/providers.module';
import { BureaucracyModule } from './bureaucracy/bureaucracy.module';
import { DailyModule } from './daily/daily.module';
import { AdminMattersModule } from './admin-matters/admin-matters.module';

@Module({
  imports: [
    StorageModule,
    DimensionsModule,
    BankAccountsModule,
    CardsModule,
    ProvidersModule,
    BureaucracyModule,
    DailyModule,
    AdminMattersModule,
  ],
})
export class AppModule {}
