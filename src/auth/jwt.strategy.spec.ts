import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';

describe('JwtStrategy', () => {
  let configService: ConfigService;

  beforeEach(() => {
    configService = {
      get: jest.fn(),
    } as any;
  });

  it('should throw error if JWT_SECRET is not defined', () => {
    (configService.get as jest.Mock).mockReturnValue(undefined);

    expect(() => new JwtStrategy(configService)).toThrow('JWT_SECRET is not defined');
  });

  it('should create JwtStrategy instance with secret', () => {
    (configService.get as jest.Mock).mockReturnValue('secret');

    const strategy = new JwtStrategy(configService);

    expect(strategy).toBeDefined();
  });

  it('validate() should return user object with userId and username', async () => {
    (configService.get as jest.Mock).mockReturnValue('secret');

    const strategy = new JwtStrategy(configService);

    const payload = { sub: 123, username: 'user1' };
    const result = await strategy.validate(payload);

    expect(result).toEqual({ userId: 123, username: 'user1' });
  });
});
