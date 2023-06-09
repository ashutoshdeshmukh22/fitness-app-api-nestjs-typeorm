import { AdminService } from './admin.service';
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorater';
import { User } from 'src/entities/user.entity';
import { AdminGuard } from 'src/auth/guard/admin.guard';
import { AddExerciseDto, AddWorkoutDto } from 'src/dtos';
import { ApiTags } from '@nestjs/swagger';

@UseGuards(JwtGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  // add Exercise
  @ApiTags('Admin')
  @Post('add-exercise')
  addExercise(@Body() exerciseDto: AddExerciseDto, @GetUser() user: User) {
    return this.adminService.addExercise(exerciseDto, user);
  }

  // add Workout
  @ApiTags('Admin')
  @Post('add-workout')
  addWorkout(@Body() workoutDto: AddWorkoutDto, @GetUser() user: User) {
    return this.adminService.addWorkout(workoutDto, user);
  }

  // Welcome Route
  @ApiTags('Admin')
  @Get('Welcome')
  welcome() {
    return 'Welcome to the admin module';
  }

  // Get Exercises
  @ApiTags('Admin')
  @Get('get-exercise')
  getExercise(
    @Query('mode') mode: string,
    @Query('sortby') sortby: string,
    @Query('equipMentRequired') equipMentRequired: boolean,
  ) {
    return this.adminService.getExercise(mode, sortby, equipMentRequired);
  }

  @ApiTags('Admin')
  @Get('get-workout')
  getWorkout(@Query('mode') mode: string, @Query('sortby') sortby: string) {
    return this.adminService.getWorkout(mode, sortby);
  }
}
