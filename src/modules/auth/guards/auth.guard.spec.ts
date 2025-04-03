import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { extractTokenFromHeader } from '../utils/extractTokenFromHeader';
import { AuthenticatedRequest } from '@src/@types/auth';
import { Reflector } from '@nestjs/core';

jest.mock('../utils/extractTokenFromHeader');

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let jwtService: JwtService;
  let reflector: Reflector;

  beforeEach(() => {
    jwtService = new JwtService({});
    reflector = new Reflector();
    authGuard = new AuthGuard(jwtService, reflector);
  });

  it('should bypass auth when isPublic is true', async () => {
    const mockRequest = {
      headers: {},
    } as AuthenticatedRequest;

    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

    (extractTokenFromHeader as jest.Mock).mockClear();
    const verifySpy = jest.spyOn(jwtService, 'verifyAsync');

    const result = await authGuard.canActivate(mockExecutionContext);

    expect(result).toBe(true);
    expect(extractTokenFromHeader).not.toHaveBeenCalled();
    expect(verifySpy).not.toHaveBeenCalled();
  });

  it('should require auth (verify token) when isPublic is false', async () => {
    const mockRequest = {
      headers: { authorization: 'Bearer validToken123' },
    } as AuthenticatedRequest;

    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    (extractTokenFromHeader as jest.Mock).mockReturnValue('validToken123');
    jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({
      id: 'user123',
      email: 'testuser@mail.com',
    });

    const result = await authGuard.canActivate(mockExecutionContext);

    expect(result).toBe(true);
    expect(mockRequest.user).toEqual({
      id: 'user123',
      email: 'testuser@mail.com',
    });
  });

  it('should throw UnauthorizedException if token verification fails', async () => {
    const mockRequest = {
      headers: {
        authorization: 'Bearer invalidToken123',
      },
    } as AuthenticatedRequest;

    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    (extractTokenFromHeader as jest.Mock).mockReturnValue('invalidToken123');
    jest
      .spyOn(jwtService, 'verifyAsync')
      .mockRejectedValue(new Error('Invalid token'));

    await expect(authGuard.canActivate(mockExecutionContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
