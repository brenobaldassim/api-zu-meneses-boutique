import { Injectable } from '@nestjs/common';
import { PING_MESSAGE_RESPONSE } from '@modules/server/constants';

@Injectable()
export class AppService {
  getPing(): string {
    return PING_MESSAGE_RESPONSE;
  }
}
