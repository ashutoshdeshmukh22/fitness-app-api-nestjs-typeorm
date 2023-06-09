## Description
Fitness App API

## Tech Stack Used
- Node Js
- Nest Js 
- Postgres
- TypeORM

## Tool Used For Testing API Endpoints
- Postman

## Admin
- Register / Login / Change Password / Forgot Password
- Add Workout
- Add Exercise
- Fetch All Workouts
- Fetch All Exercises

## User
- Register / Login / Change Password / Forgot Password
- Perform A Exercise / Workout
- Fetch User Performed Exercises / Workout
- Fetch Number of Workout / Exercise Performed and Total Duration

(You Can sort the data by category,by age group, by duration, by purpose, by performed count. in ascending or descending order)
(API DOCS)
```bash
# API Docs
http://localhost:3000/api
```

## API Endpoints For Admin

```bash
# Register
http://localhost:3000/auth/signup
```
```bash
# Login
http://localhost:3000/auth/signin
```
```bash
# Log Out
http://localhost:3000/auth/logout
```
```bash
# Change Password
http://localhost:3000/auth/change-password
```
```bash
# Forgot Password
http://localhost:3000/auth/forgot-password
```
```bash
# Add / Create Workout
http://localhost:3000/admin/add-workout
```
```bash
# Add / Create Exercise
http://localhost:3000/admin/add-exercise
```
```bash
# Fetch Workouts
http://localhost:3000/admin/get-workout/?sortby='value'&mode='value'
```
```bash
# Exercises Workouts
http://localhost:3000/admin/get-exercise/?sortby='value'&mode='value'
```

## API Endpoints For User

```bash
# Register
http://localhost:3000/auth/signup
```
```bash
# Login
http://localhost:3000/auth/signin
```
```bash
# Log Out
http://localhost:3000/auth/logout
```
```bash
# Change Password
http://localhost:3000/auth/change-password
```
```bash
# Forgot Password
http://localhost:3000/auth/forgot-password
```
```bash
# Perform Exercise
http://localhost:3000/user/perform-exercise/'exerciseId'?action='start/stop'
```
```bash
# Fetch Performed Workouts
http://localhost:3000/user/get-workout/?sortby='value'&mode='value'
```
```bash
# Fetch Performed Exercises
http://localhost:3000/user/get-exercise/?sortby='value'&mode='value'
```
```bash
# Fetch Total Performed - Number of exercises performed, number of workouts performed, and total duration for which all the exercise/workout performed.
http://localhost:3000/user/get-totalperformed
```

## Installation

```bash
$ npm install
```

## Running the app

```bash
$ npm run start:dev
```
..
