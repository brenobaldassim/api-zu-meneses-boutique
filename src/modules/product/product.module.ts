import { Module } from '@nestjs/common';
import { ProductService } from './services/product.service';
import { ProductController } from './controllers/product.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductServiceContract } from './services/contracts/product-service.contract';

@Module({
  imports: [PrismaModule],
  controllers: [ProductController],
  providers: [
    {
      provide: ProductServiceContract,
      useClass: ProductService,
    },
  ],
  exports: [ProductServiceContract],
})
export class ProductModule {}
