import { Injectable, Logger } from '@nestjs/common';
import { CLOSE_COLOR, COLORS, METHODS } from '../constants';

export interface LogEntry {
  method: string;
  url: string;
  statusCode: number;
  responseTime: number;
  userAgent?: string;
  ip?: string;
  userId?: string;
}

@Injectable()
export class RequestLoggerService {
  private readonly logger: Logger;
  private readonly methodColor: Record<METHODS, COLORS>;

  constructor() {
    this.methodColor = {
      [METHODS.GET]: COLORS.green,
      [METHODS.POST]: COLORS.yellow,
      [METHODS.PUT]: COLORS.blue,
      [METHODS.DELETE]: COLORS.red,
      [METHODS.PATCH]: COLORS.magenta,
      [METHODS.OPTIONS]: COLORS.cyan,
    };
    this.logger = new Logger('HTTP');
  }

  private getStatusEmoji(statusCode: number): string {
    if (statusCode >= 200 && statusCode < 300) return '✅';
    if (statusCode >= 300 && statusCode < 400) return '🔄';
    if (statusCode >= 400 && statusCode < 500) return '⚠️';
    if (statusCode >= 500) return '❌';
    return '📋';
  }

  private getMethodColor(method: string): string {
    return (
      this.methodColor[method as keyof typeof this.methodColor] || COLORS.white
    );
  }

  logRequest(entry: LogEntry): void {
    const { method, url, statusCode, responseTime, ip, userId } = entry;

    const statusEmoji = this.getStatusEmoji(statusCode);
    const methodColor = this.getMethodColor(method);

    const logMessage = `${statusEmoji} ${methodColor}${method}${CLOSE_COLOR} ${url} - ${methodColor}${statusCode}${CLOSE_COLOR} - ${COLORS.yellow}+${responseTime}ms${CLOSE_COLOR}${
      ip ? ` - IP: ${ip}` : ''
    }${userId ? ` - User: ${userId}` : ''}`;

    if (statusCode >= 400) {
      this.logger.error(logMessage);
    } else if (statusCode >= 300) {
      this.logger.warn(logMessage);
    } else {
      this.logger.log(logMessage);
    }
  }

  logError(
    method: string,
    url: string,
    error: any,
    responseTime: number,
  ): void {
    const statusCode = (error as { status?: number }).status || 500;
    const statusEmoji = this.getStatusEmoji(Number(statusCode));
    const methodColor = this.getMethodColor(method);

    const logMessage = `${statusEmoji} ${methodColor}${method}\x1b[0m ${url} - ${statusCode} - ${responseTime}ms - ${
      (error as Error).message
    }`;

    this.logger.error(logMessage);
    if ((error as Error).stack) {
      this.logger.error((error as Error).stack);
    }
  }
}
