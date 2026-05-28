import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import {
  JwtPayload,
  LoginResponse,
} from '../../common/interfaces/user.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const user = await this.usersService.findByUsername(loginDto.username);

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const isPasswordValid = await this.usersService.validatePassword(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    if (!user.status) {
      throw new UnauthorizedException('用户已被禁用');
    }

    const payload: JwtPayload = {
      username: user.username,
      sub: (user as any)._id.toString(),
    };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: (user as any)._id.toString(),
        username: user.username,
        nickname: user.nickname,
        email: user.email,
        avatar: user.avatar,
        roleId: user.roleId,
      },
    };
  }

  async validateUser(userId: string) {
    return this.usersService.findOne(userId);
  }
}
