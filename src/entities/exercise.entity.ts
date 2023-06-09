import { Exclude } from 'class-transformer';
import { User } from 'src/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Workout } from './workout.entity';

@Entity()
export class Exercise {
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

  @Column({ default: 0 })
  performedCount: number;

  @Column({ default: 0 })
  duration: number;

  @Column({ nullable: true, default: false })
  equipMentRequired: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Exclude()
  @Column({ nullable: true })
  startedAt: Date;

  @Exclude()
  @Column({ nullable: true })
  stoppedAt: Date;

  @ManyToOne(() => User, (user) => user.exercise)
  user: User;

  @ManyToOne(() => Workout, (workout) => workout.exercise)
  workout: Workout;
}
