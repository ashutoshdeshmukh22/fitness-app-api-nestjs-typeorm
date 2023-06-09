import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exercise, User, Workout } from 'src/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Workout, Exercise, User])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
