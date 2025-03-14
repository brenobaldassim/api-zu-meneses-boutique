import { Request } from 'express';

export type JwtPayload = {
  sub: string;
  email: string;
};

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}
