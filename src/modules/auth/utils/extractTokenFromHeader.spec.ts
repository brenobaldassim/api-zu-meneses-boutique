import { extractTokenFromHeader } from './extractTokenFromHeader';
import { Request } from 'express';

describe('extractTokenFromHeader', () => {
  it('should return the token when the header contains a valid Bearer token', () => {
    const mockRequest = {
      headers: {
        authorization: 'Bearer myToken123',
      },
    } as Request;

    expect(extractTokenFromHeader(mockRequest)).toBe('myToken123');
  });

  it('should return undefined when the header does not contain the token', () => {
    const mockRequest = {
      headers: {},
    } as Request;

    expect(extractTokenFromHeader(mockRequest)).toBeUndefined();
  });

  it('should return undefined when the Authorization header has an invalid format', () => {
    const mockRequest = {
      headers: {
        authorization: 'Invalid myToken123',
      },
    } as Request;

    expect(extractTokenFromHeader(mockRequest)).toBeUndefined();
  });

  it('should return undefined when the Authorization header is empty', () => {
    const mockRequest = {
      headers: {
        authorization: '',
      },
    } as Request;

    expect(extractTokenFromHeader(mockRequest)).toBeUndefined();
  });
});
