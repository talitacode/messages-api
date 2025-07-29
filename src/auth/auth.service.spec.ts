import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, InternalServerErrorException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              switch (key) {
                case 'USERNAME':
                  return 'user';
                case 'PASSWORD':
                  return 'pass';
                case 'JWT_EXPIRES_IN':
                  return '3600s';
                default:
                  return undefined;
              }
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('constructor and mustGetEnv', () => {
    it('should throw if required env variables are missing', () => {
      
      const mockConfig = {
        get: jest.fn().mockReturnValue(undefined),
      } as unknown as ConfigService;

      expect(() => new AuthService(jwtService, mockConfig)).toThrow(InternalServerErrorException);
    });

    it('should assign env variables correctly', () => {
      expect((service as any).username).toBe('user');
      expect((service as any).password).toBe('pass');
      expect((service as any).jwtExpiresIn).toBe('3600s');
    });
  });

  describe('validateUser', () => {
    it('should return user object if credentials are valid', async () => {
      const result = await service.validateUser('user', 'pass');
      expect(result).toEqual({ userId: 1, username: 'user' });
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      await expect(service.validateUser('user', 'wrong')).rejects.toThrow(UnauthorizedException);
      await expect(service.validateUser('wrong', 'pass')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should return access token with expiry', async () => {
      (jwtService.sign as jest.Mock).mockReturnValue('signed-token');
      const token = await service.login({ userId: 1, username: 'user' });
      expect(jwtService.sign).toHaveBeenCalledWith(
        { username: 'user', sub: 1 },
        { expiresIn: '3600s' },
      );
      expect(token).toEqual({ access_token: 'signed-token', expires_in: '3600s' });
    });
  });
});
