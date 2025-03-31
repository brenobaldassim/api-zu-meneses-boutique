import { Module } from '@nestjs/common';
import { AddressService } from './repositories/address.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AddressServiceContract } from './contracts/address-service.contract';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: AddressServiceContract,
      useClass: AddressService,
    },
  ],
  exports: [AddressServiceContract],
})
export class AddressModule {}
