import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { AuthDto, ChangePassDto, ForgotPasswordDto, LoginDto } from 'src/dtos';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private repo: Repository<User>,
    private jwt: JwtService,
  ) {}

  async signup(dto: AuthDto) {
    // Check if the user with the email is already exist or not
    const user = await this.repo.findOne({ where: { email: dto.email } });
    if (!user) {
      // Generate the password hash
      const hash = await argon.hash(dto.password);
      try {
        // Save the New user in the db
        const user = this.repo.create({
          username: dto.username,
          email: dto.email,
          password: hash,
          role: dto.role,
        });
        await this.repo.save(user);
        delete user.password;
        return {
          msg: 'user created',
          data: user,
        };
      } catch (error) {
        throw error;
      }
    }
    throw new ForbiddenException('User with the email already exist');
  }

  async signin(dto: LoginDto) {
    // find the user by email
    const user = await this.repo.findOne({ where: { email: dto.email } });

    // if the user does not exists throw an exception
    if (!user) throw new ForbiddenException('User Does Not Exist');

    // if found compare the passwords
    const isPwMatch = await argon.verify(user.password, dto.password);

    // if the password is incorrect throw an exception
    if (!isPwMatch) throw new ForbiddenException('Invalid Credentials');

    delete user.password;
    // send back the user
    const token = await this.signToken(user.id, user.email, user.role);

    return {
      msg: 'Logged In',
      email: user.email,
      token: token,
    };
  }

  async signToken(
    userId: number,
    email: string,
    role: string,
  ): Promise<string> {
    const payload = { sub: userId, email, role };

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: process.env.JWT_SECRET,
    });

    return token;
  }

  // invalidateToken token
  async invalidateToken(token: string) {
    // Decode the token to extract the payload
    const decodedToken = this.jwt.decode(token);
    // Check if the token is valid and has not expired
    if (decodedToken) {
      // Set the expiration time to a past date to invalidate the token
      const invalidatedToken = await this.jwt.sign(
        { decodedToken },
        {
          expiresIn: '0s',
          secret: process.env.JWT_SECRET,
        }, // Set the expiration time to a past date (e.g., 0 seconds)
      );
      return invalidatedToken;
    }
  }

  async changePassword(user: User, changePassDto: ChangePassDto) {
    // Check if the old password is correct
    const userItem = await this.repo.findOne({ where: { id: user.id } });
    const isOldPasswordCorrect = await argon.verify(
      userItem.password,
      changePassDto.oldPassword,
    );
    // If the old password is correct, hash the new password and save it
    if (isOldPasswordCorrect) {
      const hash = await argon.hash(changePassDto.newPassword);
      userItem.password = hash;
      await this.repo.save(userItem);
      return { message: 'Password changed successfully' };
    }
    // If the old password is incorrect, throw an error
    throw new ForbiddenException('Invalid old password');
  }

  // forgot password
  async forgotPassword(forgotPassDto: ForgotPasswordDto) {
    // Find the user by email
    const user = await this.repo.findOne({
      where: { email: forgotPassDto.email },
    });
    // If the user exists, send an email with a link to reset the password
    if (user) {
      // Generate a random token
      const token = Math.random().toString(36).substring(2);
      console.log('token:', token);
      // Save the token in the db
      user.resetPasswordToken = token;
      await this.repo.save(user);
      const resetUrl = `http://localhost:3000/auth/reset-password?token=${token}`;
      // Send the email
      // const emailContent = `Click the following link to reset your password: ${resetUrl}`;
      // await this.mailService.sendEmail(email, 'Password Reset', emailContent);
      return {
        msg: 'Check your email for the password reset link',
        resetLink: resetUrl,
      };
    }
    // If the user does not exist, throw an error
    throw new ForbiddenException('Invalid email');
  }

  // reset password
  async resetPassword(token: string, newPassword: string) {
    // Find the user by token
    const user = await this.repo.findOne({
      where: { resetPasswordToken: token },
    });

    if (!user) {
      throw new ForbiddenException('Invalid token');
    }

    // Hash the new password
    const hash = await argon.hash(newPassword);
    // Update the user's password and reset token
    user.password = hash;
    user.resetPasswordToken = null;
    await this.repo.save(user);
    return { message: 'Password reset successful' };
  }
}
