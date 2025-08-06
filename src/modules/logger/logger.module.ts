import { Module } from '@nestjs/common';
import { RequestLoggerService } from './services/logger.service';
import { LoggingInterceptor } from './interceptors/logging.interceptor';

@Module({
  providers: [RequestLoggerService, LoggingInterceptor],
  exports: [RequestLoggerService, LoggingInterceptor],
})
export class LoggerModule {}
