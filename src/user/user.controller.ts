import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { GetUser } from 'src/auth/decorater';
import { JwtGuard } from 'src/auth/guard';
import { User } from 'src/entities';
import { ApiTags } from '@nestjs/swagger';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @ApiTags('User')
  @UseGuards(JwtGuard)
  @Post('/perform-exercise/:exerciseId')
  performExercise(
    @Param('exerciseId') exerciseId: string,
    @Query('action') action: string,
    @GetUser() user: User,
  ) {
    return this.userService.performExercise(parseInt(exerciseId), action, user);
  }

  @ApiTags('User')
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(JwtGuard)
  @Get('get-exercise')
  getExercise(
    @Query('mode') mode: string,
    @Query('sortby') sortby: string,
    @Query('equipMentRequired') equipMentRequired: boolean,
    @GetUser() user: User,
  ) {
    return this.userService.getExercise(mode, sortby, equipMentRequired, user);
  }

  @ApiTags('User')
  @UseGuards(JwtGuard)
  @Get('get-workout')
  getWorkout(
    @Query('mode') mode: string,
    @Query('sortby') sortby: string,
    @GetUser() user: User,
  ) {
    return this.userService.getWorkout(mode, sortby, user);
  }

  @ApiTags('User')
  @UseGuards(JwtGuard)
  @Get('get-totalperformed')
  getTotalPerformed(
    @Query('mode') mode: string,
    @Query('sortby') sortby: string,
    @GetUser() user: User,
  ) {
    return this.userService.getTotalPerformed(mode, sortby, user);
  }
}
