import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Session,
  BadRequestException,
  Query,
  ConflictException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LogOperation } from '../../common/decorators/log-operation.decorator';
import { UsersService } from '../users/users.service';

@ApiTags('认证管理')
@Controller('v1/sys/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  @LogOperation({ module: '登录', action: '用户登录' })
  @ApiOperation({ summary: '用户登录' })
  async login(
    @Body() loginDto: LoginDto,
    @Session() session: Record<string, any>,
  ) {
    if (!loginDto.code) {
      throw new BadRequestException('验证码不能为空');
    }

    if (!session.code) {
      throw new BadRequestException('验证码已失效');
    }

    if (session.code !== loginDto.code) {
      throw new BadRequestException('验证码错误');
    }

    delete session.code;
    return this.authService.login(loginDto);
  }

  @Post('register')
  @LogOperation({ module: '注册', action: '用户注册' })
  @ApiOperation({ summary: '用户注册' })
  async register(@Body() registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByUsername(
      registerDto.username,
    );
    if (existingUser) {
      throw new ConflictException(
        `用户名:${registerDto.username}已经注册,请更换其他.`,
      );
    }

    const newUser = {
      ...registerDto,
      avatar:
        registerDto.avatar ||
        'https://i.pinimg.com/564x/75/0e/43/750e43ca9a59803ebb05754e740f3946.jpg',
      roleId: '64a7aa20a971facd04696242', // 默认角色ID
      status: true,
    };

    await this.usersService.create(newUser);
    return { message: '恭喜您已注册成功,感谢您的使用ZY·ADMIN！' };
  }

  @Get('verifyConfirm')
  @ApiOperation({ summary: '验证邮箱验证码' })
  async verifyConfirm(
    @Query('email') email: string,
    @Query('code') code: string,
    @Session() session: Record<string, any>,
  ) {
    if (!email) {
      throw new BadRequestException('邮箱不能为空');
    }
    if (!code) {
      throw new BadRequestException('验证码不能为空');
    }

    if (!session.code) {
      throw new BadRequestException('验证码已失效,请重新获取');
    }

    if (session.code !== Number(code)) {
      throw new BadRequestException('验证码错误');
    }

    // TODO: 更新用户验证状态
    delete session.code;
    return { message: '账户验证成功！可进行登录.' };
  }

  @Get('resendConfirmCode')
  @ApiOperation({ summary: '重发验证码' })
  async resendConfirmCode(
    @Query('email') email: string,
    @Session() session: Record<string, any>,
  ) {
    if (!email) {
      throw new BadRequestException('邮箱不能为空');
    }

    // 生成4位随机验证码
    const newCode = Math.floor(1000 + Math.random() * 9000);
    session.code = newCode;

    // TODO: 发送邮件
    console.log('验证码:', newCode);
    return { message: '验证码发送成功！请在5分钟内进行验证.' };
  }

  @Post('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户信息' })
  async getProfile(@Request() req) {
    return this.authService.validateUser(req.user.userId);
  }
}
