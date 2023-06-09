import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Exercise, User, Workout } from 'src/entities';
import { In, Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Exercise) private repo: Repository<Exercise>,
    @InjectRepository(Workout) private workoutRepo: Repository<Workout>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async performExercise(exerciseId: number, action: string, user: User) {
    // Getting the exercise item by id to be performed
    const exerciseItem = await this.repo.findOne({
      where: { id: exerciseId },
    });
    if (!exerciseItem) {
      return {
        msg: 'Exercise Not Found',
      };
    }
    // Performing the exercise
    if (action === 'start') {
      // Check if the user is already performing another exercise
      if (user.isPerformingExercise) {
        return {
          msg: 'Another exercise is already being performed. Please complete that one',
        };
      }
      // Setting the flag to true to indicate that an exercise is being performed
      user.isPerformingExercise = true;
      await this.userRepo.save(user);
      exerciseItem.startedAt = new Date();
      await this.repo.save(exerciseItem);
      return { message: 'Exercise Started' };
    } else if (action === 'stop') {
      user.isPerformingExercise = false;
      await this.userRepo.save(user);
      exerciseItem.stoppedAt = new Date();
      await this.repo.save(exerciseItem);
      // calculate the total duration in seconds
      const currentTotalTime = Math.floor(
        (exerciseItem.stoppedAt.getTime() - exerciseItem.startedAt.getTime()) /
          1000,
      );
      //  save the total duration in database
      const prevExerciseDuration = exerciseItem.duration;
      const currExerciseDuration = currentTotalTime;
      const totalExerciseTime = this.addTime(
        prevExerciseDuration,
        currExerciseDuration,
      );
      // console.log(
      //   'prevExerciseDuration -',
      //   typeof prevExerciseDuration,
      //   'Value -',
      //   prevExerciseDuration,
      // );
      // console.log(
      //   'currExerciseDuration -',
      //   typeof currExerciseDuration,
      //   'Value -',
      //   currExerciseDuration,
      // );
      // console.log(totalExerciseTime);
      // console.log(typeof totalExerciseTime);

      try {
        exerciseItem.duration = totalExerciseTime;
        exerciseItem.performedCount = exerciseItem.performedCount + 1;

        await this.repo.save(exerciseItem);
      } catch (error) {
        console.log('Error At Exercise Saving');
      }

      // Save the performed exercise details to the user table and workout table
      try {
        const userItem = await this.userRepo.findOne({
          where: { id: user.id },
        });
        // Initialize the performedExercise and workoutPerformed array if it's null or undefined
        userItem.exercisePerformed = userItem.exercisePerformed || [];
        userItem.workoutPerformed = userItem.workoutPerformed || [];

        // check if the user is already performed the exercise
        if (!userItem.exercisePerformed.includes(exerciseItem.id)) {
          userItem.exercisePerformed.push(exerciseItem.id);
        }
        // Updating User Performed Exercise count and Duration
        // save exerciseCount by adding the Values in exercisePerformed Array
        userItem.exerciseCount = userItem.exercisePerformed.length;
        userItem.duration = userItem.duration + currentTotalTime;

        // saving Details to Workout Table
        const workout = await this.workoutRepo.findOne({
          where: {
            ageGroup: exerciseItem.ageGroup,
            purpose: exerciseItem.purpose,
          },
        });

        // Saving Performed Workout Ref To User
        // check if the user is already performed the workout
        if (!userItem.workoutPerformed.includes(workout.id)) {
          userItem.workoutPerformed.push(workout.id);
        }

        // Adding Exercise Duration and Saving To Workout
        workout.totalDuration =
          (workout.totalDuration || 0) + (exerciseItem.duration || 0);

        // Adding Exercise Performed Count and Saving To Workout
        workout.performedCount =
          (workout.performedCount || 0) + (exerciseItem.performedCount || 0);

        // Finally save the Workout
        await this.workoutRepo.save(workout);

        // Finally save the User
        await this.userRepo.save(userItem);

        return { message: 'Exercise Stopped', TotalTime: currentTotalTime };
      } catch (error) {
        console.log('Error at Saving Exercise to user');
      }
    } else {
      return {
        msg: 'Invalid Action',
      };
    }
    // exercise.performedCount++;
    // await this.repo.save(exercise);
    // return { message: 'Exercise Performed Successfully' };
  }

  async getExercise(
    mode: string,
    sortby: string,
    equipMentRequired: boolean,
    user: User,
  ) {
    // return exercises performed by the user
    const userItem = await this.userRepo.findOne({
      where: { id: user.id },
    });

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

    const exercises: Exercise[] = await this.repo.find({
      order: filterOptions,
      where: {
        id: In(userItem.exercisePerformed),
        equipMentRequired: equipMentRequired,
      },
    });

    return exercises;
  }

  async getWorkout(mode: string, sortby: string, user: User) {
    // return exercises performed by the user
    const userItem = await this.userRepo.findOne({
      where: { id: user.id },
    });

    const filterOptions = {};

    if (
      sortby === 'title' ||
      'category' ||
      'duration' ||
      'ageGroup' ||
      'performedCount' ||
      'created_at' ||
      'updated_at' ||
      'id'
    ) {
      filterOptions[sortby] = mode;
    }

    const workouts: Workout[] = await this.workoutRepo.find({
      order: filterOptions,
      where: {
        id: In(userItem.workoutPerformed),
      },
    });

    return workouts;
  }

  async getTotalPerformed(mode: string, sortby: string, user: User) {
    const userItem = await this.userRepo.findOne({
      where: { id: user.id },
    });

    const userPerformedExercisesIds = userItem.exercisePerformed;
    const userPerformedWorkoutsIds = userItem.workoutPerformed;

    console.log(userPerformedExercisesIds);
    console.log(userPerformedWorkoutsIds);

    // Get All Exercises From DB Using Array of Exercises Ids
    const userPerformedExercises = await this.repo.find({
      where: {
        id: In(userPerformedExercisesIds),
      },
    });
    // Get All Workouts From DB Using Array of Workout Ids
    const userPerformedWorkouts = await this.repo.find({
      where: {
        id: In(userPerformedWorkoutsIds),
      },
    });

    // Calculating Total Exercise Duration Performed By User
    const TotalExerciseDuration = userPerformedExercises.reduce(
      (acc, curr) => acc + curr.duration,
      0,
    );
    // Calculating Total Workout Duration Performed By User
    const TotalWorkoutDuration = userPerformedWorkouts.reduce(
      (acc, curr) => acc + curr.duration,
      0,
    );

    if (userPerformedExercises.length === 0 || TotalExerciseDuration === 0) {
      return {
        msg: 'You Have Not Performed Any Exercises Yet, Perform some Exercises',
      };
    }

    return {
      message: 'Success',
      ExercisePerformed: userPerformedExercises.length,
      TotalExerciseDuration: TotalExerciseDuration,
      WorkoutPerformed: userPerformedWorkouts.length,
      TotalWorkoutDuration: TotalWorkoutDuration,
    };
  }

  addTime = (previousTime, currentTime) => {
    const totalTime = parseInt(previousTime) + parseInt(currentTime);
    return totalTime;
  };
}
