import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Exercise, Workout } from 'src/entities';
import { AddExerciseDto, AddWorkoutDto } from 'src/dtos';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Exercise) private repo: Repository<Exercise>,
    @InjectRepository(Workout) private workoutRepo: Repository<Workout>,
  ) {}

  async addExercise(exerciseDto: AddExerciseDto, user: User) {
    if (!['18-45', '45-60', '60+'].includes(exerciseDto.ageGroup)) {
      return { message: 'Age Group Must Be 18-45, 45-60, 60+' };
    } else if (
      !['Weight Loss', 'Weight Gain', 'Stay Fit'].includes(exerciseDto.purpose)
    ) {
      return {
        message: 'Purpose Must Be Weight Loss, Weight Gain, Stay Fit',
      };
    } else if (
      !['Full Body', 'Upper Body', 'Lower Body'].includes(exerciseDto.category)
    ) {
      return {
        message: 'Category Must Be Full Body, Upper Body, Lower Body',
      };
    }

    const exercise = this.repo.create(exerciseDto);

    // Find the Workout That has same age group and purpose and add the workout reference to the exercise
    const workout = await this.workoutRepo.findOne({
      where: {
        ageGroup: exercise.ageGroup,
        purpose: exercise.purpose,
      },
    });
    if (!workout) {
      // If no related workout found we wil create one
      const newWorkout = this.workoutRepo.create({
        title: `${exercise.purpose} - ${exercise.category} - ${exercise.ageGroup} `,
        category: exercise.category,
        ageGroup: exercise.ageGroup,
        purpose: exercise.purpose,
        user: user,
      });
      await this.workoutRepo.save(newWorkout);
      console.log(
        'No Related Workout Found, \nSo Created One \nAnd Exercise Added ',
      );

      // Adding a Reference of User to Exercise Who Created That Exercise
      exercise.user = user;
      // Adding a Reference of Workout To Which Workout The Exercise Belongs
      exercise.workout = newWorkout;

      // Finally Saving The Exercise
      await this.repo.save(exercise);

      // We will Add or Update The Exercises Array in The Workout Table
      try {
        // Initialize the Exercises array if it's null or undefined
        newWorkout.exercises =
          newWorkout.exercises !== null && newWorkout.exercises !== undefined
            ? newWorkout.exercises
            : [];
        // workout.exercises = Array.isArray(workout.exercises)
        //   ? workout.exercises
        //   : [];

        newWorkout.exercises.push(exercise.id);

        // Updating the exercises Count
        newWorkout.exercisesCount = newWorkout.exercises.length;

        // Updating the Workout Table
        await this.workoutRepo.save(newWorkout);
        await this.repo.save(exercise);
      } catch (error) {
        console.log('Error At Saving Exercise Ref to Workout Table', error);
      }
    } else {
      // Adding a Reference of User to Exercise Who Created That Exercise
      exercise.user = user;

      // Adding a Reference of Workout To Which Workout The Exercise Belongs
      exercise.workout = workout;

      // Finally Saving The Exercise
      await this.repo.save(exercise);

      // We will Add or Update The Exercises Array in The Workout Table
      try {
        // Initialize the Exercises array if it's null or undefined
        workout.exercises =
          workout.exercises !== null && workout.exercises !== undefined
            ? workout.exercises
            : [];

        workout.exercises.push(exercise.id);
        // Updating the exercises Count
        workout.exercisesCount = workout.exercises.length;

        // Updating the Workout Table
        await this.workoutRepo.save(workout);
        await this.repo.save(exercise);
      } catch (error) {
        console.log('Error At Saving Exercise Ref to Workout Table', error);
      }
    }

    return { message: 'Exercise Added Successfully' };
  }

  async getExercise(mode: string, sortby: string, equipMentRequired: boolean) {
    const filterOptions = {};

    if (
      sortby === 'title' ||
      'category' ||
      'duration' ||
      'ageGroup' ||
      'performedCount' ||
      'purpose' ||
      'created_at' ||
      'updated_at' ||
      'id'
    ) {
      filterOptions[sortby] = mode;
    }
    console.log(filterOptions);

    return await this.repo.find({
      order: filterOptions,
      where: {
        equipMentRequired: equipMentRequired,
      },
    });
  }

  async addWorkout(workoutDto: AddWorkoutDto, user: User) {
    if (!['18-45', '45-60', '60+'].includes(workoutDto.ageGroup)) {
      return { message: 'Age Group Must Be 18-45, 45-60, 60+' };
    } else if (
      !['Weight Loss', 'Weight Gain', 'Stay Fit'].includes(workoutDto.purpose)
    ) {
      return {
        message: 'Purpose Must Be Weight Loss, Weight Gain, Stay Fit',
      };
    } else if (
      !['Full Body', 'Upper Body', 'Lower Body'].includes(workoutDto.category)
    ) {
      return {
        message: 'Category Must Be Full Body, Upper Body, Lower Body',
      };
    }

    const workout = this.workoutRepo.create(workoutDto);
    workout.user = user;
    await this.workoutRepo.save(workout);
    return { message: 'Workout Added Successfully' };
  }

  async getWorkout(mode: string, sortby: string) {
    const filterOptions = {};

    if (
      sortby === 'title' ||
      'category' ||
      'duration' ||
      'ageGroup' ||
      'performedCount' ||
      'created_at' ||
      'purpose' ||
      'updated_at' ||
      'id'
    ) {
      filterOptions[sortby] = mode;
    }
    console.log(filterOptions);

    return await this.workoutRepo.find({
      order: filterOptions,
    });
  }
}
