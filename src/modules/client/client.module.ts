import { Module } from '@nestjs/common';
import { ClientService } from './services/client.service';
import { ClientController } from './controllers/client.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ClientServiceContract } from './services/contracts/client-service.contract';

@Module({
  imports: [PrismaModule],
  controllers: [ClientController],
  providers: [
    {
      provide: ClientServiceContract,
      useClass: ClientService,
    },
  ],
  exports: [ClientServiceContract],
})
export class ClientModule {}
