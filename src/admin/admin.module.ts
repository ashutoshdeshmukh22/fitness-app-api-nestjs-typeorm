import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exercise, Workout } from 'src/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Workout, Exercise])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
