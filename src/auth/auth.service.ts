import { Injectable, UnauthorizedException, InternalServerErrorException  } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
private readonly username: string;
private readonly password: string;
private readonly jwtExpiresIn: string;

constructor(
private jwtService: JwtService,
private configService: ConfigService,
) {
this.username = this.mustGetEnv('USERNAME');
this.password = this.mustGetEnv('PASSWORD');
this.jwtExpiresIn = this.mustGetEnv('JWT_EXPIRES_IN');
}

private mustGetEnv(key: string): string {
const value = this.configService.get<string>(key);
if (!value) {
    throw new InternalServerErrorException(`A variável de ambiente ${key} não está definida`);
}
return value;
}

async validateUser(username: string, password: string): Promise<any> {
if (username === this.username && password === this.password) {
    return { userId: 1, username };
}
throw new UnauthorizedException('Credenciais inválidas');
}

async login(user: any) {
const payload = { username: user.username, sub: user.userId };
return {
    access_token: this.jwtService.sign(payload, {
    expiresIn: this.jwtExpiresIn,
    }),
    expires_in: this.jwtExpiresIn,
};
}

}
