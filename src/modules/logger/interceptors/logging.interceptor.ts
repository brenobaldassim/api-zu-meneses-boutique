import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { RequestLoggerService } from '../services/logger.service';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

interface HttpError extends Error {
  status?: number;
  stack?: string;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly requestLoggerService: RequestLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const response = context.switchToHttp().getResponse<Response>();
    const startTime = Date.now();

    const { method, url, headers, ip } = request;
    const userAgent = headers['user-agent'];

    return next.handle().pipe(
      tap({
        next: () => {
          const endTime = Date.now();
          const responseTime = endTime - startTime;
          const statusCode = response.statusCode;

          const userId = request.user?.id;

          this.requestLoggerService.logRequest({
            method,
            url,
            statusCode,
            responseTime,
            userAgent,
            ip,
            userId,
          });
        },
        error: (error: HttpError) => {
          const endTime = Date.now();
          const responseTime = endTime - startTime;

          this.requestLoggerService.logError(method, url, error, responseTime);
        },
      }),
    );
  }
}
