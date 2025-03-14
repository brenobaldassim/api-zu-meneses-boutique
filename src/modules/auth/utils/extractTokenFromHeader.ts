import { Request } from 'express';

export function extractTokenFromHeader(request: Request): string | undefined {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return;
  }

  const [type, token] = authHeader.split(' ');
  return type === 'Bearer' ? token : undefined;
}
