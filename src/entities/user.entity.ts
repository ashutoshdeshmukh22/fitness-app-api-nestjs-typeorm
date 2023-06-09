import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Workout } from './workout.entity';
import { Exercise } from './exercise.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Column({ default: 'basic' })
  role: string;

  //   User Performed Exercises
  @Column('integer', { array: true, nullable: true, default: [] })
  exercisePerformed: number[];

  //   User Performed Workouts
  @Column('integer', { array: true, nullable: true, default: [] })
  workoutPerformed: number[];

  @Column({ default: 0 })
  exerciseCount: number;

  @Column({ default: 0 })
  duration: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  resetPasswordToken: string;

  @Column({ nullable: true, default: false })
  isPerformingExercise: boolean;

  //   Admin User added exercises
  @OneToMany(() => Exercise, (exercise) => exercise.user)
  exercise: Exercise[];

  //   Admin User added workouts
  @OneToMany(() => Workout, (workout) => workout.user)
  workout: Workout[];
}
