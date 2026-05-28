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
    console.log('loginDto', loginDto);
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

    const userId = (user as any)._id.toString();
    
    const userData = {
      _id: userId,
      username: user.username,
      nickname: user.nickname,
      roleId: user.roleId,
      status: user.status,
    };

    const payload: JwtPayload = {
      username: user.username,
      sub: userId,
    };
    
    const token = 'Bearer ' + this.jwtService.sign(payload);
    
    return {
      ...userData,
      token,
    } as any;
  }

  async validateUser(userId: string) {
    return this.usersService.findOne(userId);
  }
}
