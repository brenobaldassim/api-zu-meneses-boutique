import { Module } from '@nestjs/common';
import { ClientService } from './services/client.service';
import { ClientController } from './controllers/client.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ClientServiceContract } from './contracts/client-service.contract';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
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
