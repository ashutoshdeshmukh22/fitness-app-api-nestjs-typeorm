import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtGuard } from './guard';
import { AuthDto, ChangePassDto, LoginDto, ResetPasswordDto } from 'src/dtos';
import { ApiTags } from '@nestjs/swagger';
import { GetUser } from './decorater';
import { User } from 'src/entities';
import { ForgotPasswordDto } from 'src/dtos/forgot-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiTags('Auth')
  @UseGuards(JwtGuard)
  @Get('Welcome')
  welcome() {
    return 'Welcome to the Gym App';
  }

  @ApiTags('Auth')
  @Post('signup')
  signup(@Body() dto: AuthDto) {
    return this.authService.signup(dto);
  }

  @ApiTags('Auth')
  @HttpCode(HttpStatus.OK) // 200
  @Post('signin')
  signin(@Body() dto: LoginDto) {
    return this.authService.signin(dto);
  }

  @ApiTags('Auth')
  @Get('logout')
  async logout(@Req() req) {
    // Check if the request contains the Authorization header
    if (req.headers.authorization) {
      // Split the Authorization header to get the token
      const token = req.headers.authorization.split(' ')[1];
      // Invalidate the token
      const isTokenInvalidated = await this.authService.invalidateToken(token);
      // Check if the token was successfully invalidated
      if (isTokenInvalidated) {
        // Return a success message
        return { message: 'Logout successful' };
      }
    }
    // If the request does not contain the Authorization header or the token couldn't be invalidated, throw an error
    throw new UnauthorizedException('Invalid token');
  }

  // Change Password
  @ApiTags('Auth')
  @UseGuards(JwtGuard)
  @Post('change-password')
  async changePassword(
    @GetUser() user: User,
    @Body() changePassDto: ChangePassDto,
  ) {
    return this.authService.changePassword(user, changePassDto);
  }

  // forgot password
  @ApiTags('Auth')
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPassDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPassDto);
  }

  // reset password
  @ApiTags('Auth')
  @Post('reset-password')
  async resetPassword(
    @Query('token') token: string,
    @Body() resetPassDto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(token, resetPassDto.newPassword);
  }

  //   @Post('logout')
  //   @UseGuards(AuthGuard('jwt'))
  //   async logout(@Req() request: Request) {}
}
