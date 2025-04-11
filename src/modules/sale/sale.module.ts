import { Module } from '@nestjs/common';
import { SaleService } from './services/sale.service';
import { SaleController } from './controllers/sale.controller';
import { SaleServiceContract } from './services/contract/sale-service.contract';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SaleController],
  providers: [
    {
      provide: SaleServiceContract,
      useClass: SaleService,
    },
  ],
  exports: [SaleServiceContract],
})
export class SaleModule {}
