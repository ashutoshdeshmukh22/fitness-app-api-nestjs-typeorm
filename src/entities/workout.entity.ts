import { User } from 'src/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exercise } from './exercise.entity';

@Entity()
export class Workout {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true, enum: ['Full Body', 'Upper Body', 'Lower Body'] })
  category: string;

  @Column({ nullable: true, enum: ['18-45', '45-60', '60+'] })
  ageGroup: string;

  @Column({ nullable: true, enum: ['Weight Loss', 'Weight Gain', 'Stay Fit'] })
  purpose: string;

  //  Exercises Contains In The Particular Workout
  @Column('integer', { array: true, nullable: true, default: [] })
  exercises: number[];

  @Column({ default: 0 })
  exercisesCount: number;

  @Column({ default: 0 })
  totalDuration: number;

  @Column({ default: 0 })
  performedCount: number;

  @Column({ nullable: true, default: false })
  equipMentRequired: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.exercise)
  user: User;

  @OneToMany(() => Exercise, (exercise) => exercise.workout)
  exercise: Exercise[];
}
