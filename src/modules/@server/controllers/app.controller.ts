import { Controller, Get } from '@nestjs/common';
import { AppService } from '../services/app.service';
import { Public } from '@src/shared/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getPing(): string {
    return this.appService.getPing();
  }
}
