import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
let controller: AuthController;
let mockAuthService: Partial<AuthService>;

beforeEach(async () => {
mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn(),
};

const module: TestingModule = await Test.createTestingModule({
    controllers: [AuthController],
    providers: [{ provide: AuthService, useValue: mockAuthService }],
}).compile();

controller = module.get<AuthController>(AuthController);
});

it('should be defined', () => {
expect(controller).toBeDefined();
});

it('should login successfully with valid credentials', async () => {
const user = { userId: 1, username: 'admin' };
const token = { access_token: 'jwt-token', expires_in: '3600' };

 jest.spyOn(mockAuthService, 'validateUser').mockResolvedValue(user);
 jest.spyOn(mockAuthService, 'login').mockResolvedValue(token); 


const result = await controller.login({ username: 'admin', password: 'admin123' });

expect(result).toEqual(token);
expect(mockAuthService.validateUser).toHaveBeenCalledWith('admin', 'admin123');
});

it('should throw UnauthorizedException with invalid credentials', async () => {
jest.spyOn(mockAuthService, 'validateUser').mockResolvedValue(null);

await expect(
    controller.login({ username: 'invalid', password: 'wrong' }),
).rejects.toThrow(UnauthorizedException);
});

it('should not call login if validateUser returns null', async () => {
  jest.spyOn(mockAuthService, 'validateUser').mockResolvedValue(null);
  const loginSpy = jest.spyOn(mockAuthService, 'login');

  await expect(
    controller.login({ username: 'invalid', password: 'wrong' }),
  ).rejects.toThrow(UnauthorizedException);

  expect(loginSpy).not.toHaveBeenCalled();
});

it('should propagate errors from authService.validateUser', async () => {
  jest.spyOn(mockAuthService, 'validateUser').mockRejectedValue(new Error('Unexpected error'));
  await expect(controller.login({ username: 'admin', password: 'admin123' })).rejects.toThrow('Unexpected error');
});

it('should propagate errors from authService.login', async () => {
  jest.spyOn(mockAuthService, 'validateUser').mockResolvedValue({ userId: 1, username: 'admin' });
  jest.spyOn(mockAuthService, 'login').mockRejectedValue(new Error('Login failed'));

  await expect(controller.login({ username: 'admin', password: 'admin123' })).rejects.toThrow('Login failed');
});


});
