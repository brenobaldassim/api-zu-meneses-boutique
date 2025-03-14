import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { extractTokenFromHeader } from '../utils/extractTokenFromHeader';
import { AuthenticatedRequest } from '@src/@types/auth';

jest.mock('../utils/extractTokenFromHeader');

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let jwtService: JwtService;

  beforeEach(() => {
    jwtService = new JwtService({});
    authGuard = new AuthGuard(jwtService);
  });

  it('should return true if the token is valid', async () => {
    const mockRequest = {
      headers: {
        authorization: 'Bearer validToken123',
      },
      user: {},
    } as AuthenticatedRequest;

    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;

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

  it('should throw UnauthorizedException if token is missing', async () => {
    const mockRequest = {
      headers: {},
    } as AuthenticatedRequest;

    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;

    (extractTokenFromHeader as jest.Mock).mockReturnValue(undefined);

    await expect(authGuard.canActivate(mockExecutionContext)).rejects.toThrow(
      UnauthorizedException,
    );
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
    } as ExecutionContext;

    (extractTokenFromHeader as jest.Mock).mockReturnValue('invalidToken123');
    jest
      .spyOn(jwtService, 'verifyAsync')
      .mockRejectedValue(new Error('Invalid token'));

    await expect(authGuard.canActivate(mockExecutionContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
